"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import { auth, db } from "@/lib/firebase"
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword as firebaseUpdatePassword,
  updateProfile as firebaseUpdateProfile
} from "firebase/auth"
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  collection, 
  where, 
  getDocs 
} from "firebase/firestore"
import { toast } from "sonner"

export type UserRole = "student" | "teacher" | "admin" | null

export interface User {
  uid: string
  email: string
  fullName: string
  role: string
  gradeClass?: string
  studentId?: string
  teacherId?: string
  approvalStatus?: string
  whatsappNumber?: string
  subjectsTaught?: string[]
  emailVerified: boolean
  whatsappVerified: boolean
}

interface AuthContextType {
  role: UserRole
  setRole: (role: UserRole) => void
  user: User | null
  login: (email: string, pass: string, role: UserRole) => Promise<boolean>
  signup: (userData: any) => Promise<boolean>
  logout: () => void
  refreshStatus: () => Promise<void>
  checkEmailVerificationStatus: () => Promise<boolean>
  updateProfile: (updates: Partial<User>) => Promise<boolean>
  requestPasswordReset: (email: string) => Promise<boolean>
  updatePassword: (email: string, newPass: string) => Promise<boolean>
  resendVerificationLink: () => Promise<boolean>
  verifyWhatsApp: (code: string) => Promise<boolean>
  resendWhatsAppOTP: () => Promise<boolean>
  sendPreSignupOTP: (phone: string, email: string) => Promise<boolean>
  verifyPreSignupOTP: (phone: string, email: string, code: string) => Promise<boolean>
  isRecovery: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const SESSION_KEY = "dampella_session"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isRecovery, setIsRecovery] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  // Minimum time to hold the loading screen (set by login, 0 = no minimum)
  const minLoadUntilRef = React.useRef<number>(0)
  
  // Load session on mount
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // In Firebase, we might need to handle recovery mode differently
        // For now, let's just fetch the profile
        await fetchProfile(firebaseUser.uid, firebaseUser.email!)
      } else {
        setUser(null)
        setRole(null)
        setIsRecovery(false)
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const fetchProfile = async (uid: string, email: string) => {
    try {
      const docRef = doc(db, "profiles", uid)
      let docSnap = await getDoc(docRef)

      // Auto-create profile if missing (common for imported users)
      if (!docSnap.exists()) {
        console.log("No profile found. Creating initial profile for:", email)
        const newProfile = {
          id: uid,
          email: email.toLowerCase(),
          fullName: email.split('@')[0],
          role: 'student', // Default role
          approvalStatus: 'approved',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        await setDoc(docRef, newProfile)
        docSnap = await getDoc(docRef)
      }

      if (docSnap.exists()) {
        const profile = docSnap.data()
        const userData = {
          uid: profile.id || uid,
          email: profile.email,
          fullName: profile.fullName || profile.full_name,
          role: profile.role,
          gradeClass: profile.gradeClass || profile.grade_class,
          studentId: profile.studentId || profile.student_id,
          teacherId: profile.teacherId || profile.teacher_id,
          approvalStatus: profile.approvalStatus || profile.approval_status,
          subjectsTaught: profile.subjectsTaught || profile.subjects_taught,
          whatsappNumber: profile.whatsappNumber || profile.whatsapp_number,
          emailVerified: auth.currentUser?.emailVerified || false,
          whatsappVerified: profile.whatsappVerified || false
        }
        setUser(userData)
        setRole(profile.role as UserRole)
        saveLocalSession(userData, profile.role as UserRole)
      }
    } catch (err) {
      console.error("Error fetching/creating profile:", err)
    } finally {
      // Enforce minimum loading duration if set by login()
      const remaining = minLoadUntilRef.current - Date.now()
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining))
      }
      minLoadUntilRef.current = 0
      setIsLoading(false)
    }
  }

  const saveLocalSession = (userData: User, userRole: UserRole) => {
    const session = {
      user: userData,
      role: userRole,
      timestamp: Date.now()
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }

  const login = async (email: string, pass: string, expectedRole: UserRole): Promise<boolean> => {
    minLoadUntilRef.current = Date.now() + 8000  // hold loading screen for at least 8s
    setIsLoading(true)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), pass)
      const firebaseUser = userCredential.user

      // Verify if the actual role matches the portal expectation
      const docRef = doc(db, "profiles", firebaseUser.uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const actualRole = docSnap.data().role
        
        // Admins can access any portal, otherwise roles must match
        if (actualRole !== expectedRole && actualRole !== 'admin') {
          await signOut(auth)
          const roleName = actualRole.charAt(0).toUpperCase() + actualRole.slice(1)
          toast.error(`Access Denied: This account is registered as a ${roleName}. Please use the correct portal.`)
          setIsLoading(false)
          return false
        }
      }

      toast.success("Identity verified! Accessing portal...")
      
      // Force refresh of the user object to get the latest emailVerified status
      await fetchProfile(firebaseUser.uid, firebaseUser.email!)
      
      return true
    } catch (err: any) {
      console.error("Login error:", err)
      let message = "Login failed. Please try again."
      if (err.code === 'auth/invalid-credential') {
        message = "Invalid login credentials. Please check your email and password."
      }
      toast.error(message)
      setIsLoading(false)
      return false
    }
  }

  const signup = async (userData: any): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Guard: email must not be null/empty
      if (!userData.email || typeof userData.email !== 'string') {
        toast.error("Please enter a valid email address.")
        setIsLoading(false)
        return false
      }

      // Guard: password must not be null/empty
      if (!userData.password || typeof userData.password !== 'string' || userData.password.length < 6) {
        toast.error("Password must be at least 6 characters.")
        setIsLoading(false)
        return false
      }

      // For students, validate their ID against the whitelist
      if (userData.role === 'student') {
        const studentId = userData.studentId?.trim().toUpperCase()
        const validStudentsRef = collection(db, "valid_students")
        const q = query(validStudentsRef, where("student_id", "==", studentId))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
          toast.error("Invalid Student ID. Please check your ID and try again.")
          return false
        }

        const studentData = querySnapshot.docs[0].data()
        const officialGrade = studentData.grade?.toString()
        
        if (officialGrade && userData.gradeClass !== officialGrade) {
          toast.error(`ID ${studentId} is registered for Grade ${officialGrade}. Your selection must match this.`)
          return false
        }
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email.trim().toLowerCase(), 
        userData.password
      )
      
      const user = userCredential.user

      // Create profile in Firestore
      const profileData = {
        id: user.uid,
        email: userData.email.trim().toLowerCase(),
        fullName: userData.fullName,
        role: userData.role,
        gradeClass: userData.gradeClass || null,
        teacherId: userData.teacherId || null,
        studentId: userData.studentId?.trim().toUpperCase() || null,
        whatsappNumber: userData.whatsappNumber || null,
        subjectsTaught: userData.subjectsTaught || [],
        password: userData.password, // Plaintext as requested in previous conversations
        approvalStatus: userData.role === 'teacher' ? 'pending' : 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await setDoc(doc(db, "profiles", user.uid), profileData)

      // Send verification email (existing)
      await sendEmailVerification(user)
      toast.info("Verification link sent to your email.")

      toast.success("Account created successfully!")
      return true
    } catch (err: any) {
      console.error("Signup error details:", err)
      toast.error(err.message || "Failed to create account")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await signOut(auth)
    setRole(null)
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }

  const refreshStatus = async () => {
    if (!user || !auth.currentUser) return
    
    try {
      const docRef = doc(db, "profiles", auth.currentUser.uid)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) throw new Error("Could not refresh status")
      
      const profile = docSnap.data()

      const updatedUser = {
        ...user,
        approvalStatus: profile.approvalStatus || profile.approval_status,
        fullName: profile.fullName || profile.full_name,
        subjectsTaught: profile.subjectsTaught || profile.subjects_taught,
        gradeClass: profile.gradeClass || profile.grade_class,
        studentId: profile.studentId || profile.student_id,
        teacherId: profile.teacherId || profile.teacher_id
      }

      setUser(updatedUser)
      saveLocalSession(updatedUser, role)
      
      const status = profile.approvalStatus || profile.approval_status
      if (status === 'approved' && user.approvalStatus === 'pending') {
        toast.success("Your account has been approved! Redirecting...")
      } else {
        toast.info("Status updated.")
      }
    } catch (err) {
      console.error("Refresh error:", err)
      toast.error("Failed to check status. Please try again.")
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user || !auth.currentUser) return false
    
    try {
      const docRef = doc(db, "profiles", auth.currentUser.uid)
      
      const dbUpdates: any = {}
      if (updates.fullName) dbUpdates.fullName = updates.fullName
      if (updates.subjectsTaught) dbUpdates.subjectsTaught = updates.subjectsTaught
      if (updates.whatsappNumber) dbUpdates.whatsappNumber = updates.whatsappNumber
      if (updates.gradeClass) dbUpdates.gradeClass = updates.gradeClass
      if (updates.studentId) dbUpdates.studentId = updates.studentId
      if (updates.teacherId) dbUpdates.teacherId = updates.teacherId
      
      dbUpdates.updatedAt = new Date().toISOString()

      await updateDoc(docRef, dbUpdates)

      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      saveLocalSession(updatedUser, role)
      
      toast.success("Profile updated successfully!")
      return true
    } catch (err) {
      console.error("Update error:", err)
      toast.error("Failed to update profile.")
      return false
    }
  }

  const requestPasswordReset = async (email: string) => {
    setIsLoading(true)
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase())
      toast.success("Verification link sent! Please check your email.")
      return true
    } catch (err: any) {
      console.error("Reset request error:", err)
      toast.error(err.message || "Could not process reset request.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const updatePassword = async (email: string, newPass: string) => {
    if (!auth.currentUser) return false
    setIsLoading(true)
    try {
      await firebaseUpdatePassword(auth.currentUser, newPass)

      // Also update the profiles table to store the plaintext password as requested
      const docRef = doc(db, "profiles", auth.currentUser.uid)
      await updateDoc(docRef, { 
        password: newPass,
        updatedAt: new Date().toISOString()
      })
      
      toast.success("Password updated successfully! Redirecting...")
      return true
    } catch (err: any) {
      console.error("Password update error:", err)
      toast.error(err.message || "Failed to update password.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const checkEmailVerificationStatus = async () => {
    if (!auth.currentUser) return false
    try {
      await auth.currentUser.reload()
      const isVerified = auth.currentUser.emailVerified
      
      if (user) {
        const updatedUser = { ...user, emailVerified: isVerified }
        setUser(updatedUser)
        saveLocalSession(updatedUser, role)
      }
      
      if (isVerified) {
        toast.success("Email verified successfully!")
      }
      return isVerified
    } catch (err) {
      console.error("Verification check error:", err)
      return false
    }
  }

  const resendVerificationLink = async () => {
    if (!auth.currentUser) return false
    try {
      await sendEmailVerification(auth.currentUser)
      toast.success("Verification link sent! Check your inbox.")
      return true
    } catch (err: any) {
      console.error("Resend error:", err)
      toast.error(err.message || "Failed to send verification link.")
      return false
    }
  }

  const verifyWhatsApp = async (code: string): Promise<boolean> => {
    if (!auth.currentUser || !user) return false
    try {
      const docRef = doc(db, "phone_verifications", auth.currentUser.uid)
      const docSnap = await getDoc(docRef)
      
      if (!docSnap.exists()) {
        toast.error("Verification session expired. Please request a new code.")
        return false
      }

      const data = docSnap.data()
      if (data.code === code) {
        // Update profile
        await updateDoc(doc(db, "profiles", auth.currentUser.uid), {
          whatsappVerified: true,
          updatedAt: new Date().toISOString()
        })
        
        // Update local state
        const updatedUser = { ...user, whatsappVerified: true }
        setUser(updatedUser)
        saveLocalSession(updatedUser, role)
        
        toast.success("WhatsApp number verified successfully!")
        return true
      } else {
        toast.error("Invalid verification code. Please try again.")
        return false
      }
    } catch (err) {
      console.error("WhatsApp verify error:", err)
      toast.error("Verification failed.")
      return false
    }
  }

  const resendWhatsAppOTP = async (): Promise<boolean> => {
    if (!auth.currentUser || !user?.whatsappNumber) return false
    try {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
      await setDoc(doc(db, "phone_verifications", auth.currentUser.uid), {
        uid: auth.currentUser.uid,
        phoneNumber: user.whatsappNumber,
        code: otpCode,
        status: 'pending',
        createdAt: new Date().toISOString()
      })
      toast.success("A new verification code has been sent to your WhatsApp!")
      return true
    } catch (err) {
      console.error("Resend OTP error:", err)
      toast.error("Failed to resend code.")
      return false
    }
  }

  const sendPreSignupOTP = async (phone: string, email: string): Promise<boolean> => {
    try {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
      // Use combination of phone and email as doc ID for pre-signup verification
      // This allows multiple students in one home to varyify same number simultaneously
      const cleanPhone = phone.replace(/\D/g, '')
      const cleanEmail = email.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')
      const docId = `${cleanPhone}_${cleanEmail}`
      
      await setDoc(doc(db, "signup_verifications", docId), {
        phoneNumber: phone,
        email: email.trim().toLowerCase(),
        code: otpCode,
        status: 'pending',
        createdAt: new Date().toISOString()
      })
      toast.success("Verification code sent to your WhatsApp!")
      return true
    } catch (err) {
      console.error("Pre-signup OTP error:", err)
      toast.error("Failed to send code.")
      return false
    }
  }

  const verifyPreSignupOTP = async (phone: string, email: string, code: string): Promise<boolean> => {
    try {
      const cleanPhone = phone.replace(/\D/g, '')
      const cleanEmail = email.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')
      const docId = `${cleanPhone}_${cleanEmail}`
      
      const docRef = doc(db, "signup_verifications", docId)
      const docSnap = await getDoc(docRef)
      
      if (!docSnap.exists()) {
        toast.error("Verification code expired or not found.")
        return false
      }

      if (docSnap.data().code === code) {
        toast.success("WhatsApp number verified!")
        return true
      } else {
        toast.error("Invalid verification code.")
        return false
      }
    } catch (err) {
      console.error("Pre-signup verify error:", err)
      return false
    }
  }

  return (
    <AuthContext.Provider value={{
      role, setRole, user, login, signup, logout,
      refreshStatus, checkEmailVerificationStatus, updateProfile, requestPasswordReset, updatePassword, 
      resendVerificationLink, verifyWhatsApp, resendWhatsAppOTP,
      sendPreSignupOTP, verifyPreSignupOTP,
      isRecovery, isLoading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
