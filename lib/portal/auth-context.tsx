"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"

export type UserRole = "student" | "teacher" | "admin" | null

export interface User {
  email: string
  fullName: string
  role: string
  gradeClass?: string
  approvalStatus?: string
  whatsappNumber?: string
  subjectsTaught?: string[]
}

interface AuthContextType {
  role: UserRole
  setRole: (role: UserRole) => void
  user: User | null
  login: (email: string, pass: string, role: UserRole) => Promise<void>
  signup: (userData: any) => Promise<boolean>
  logout: () => void
  refreshStatus: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<boolean>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Start as true during session check
  const supabase = createClient()

  const SESSION_KEY = "portal_auth_session"
  const EXPIRY_DAYS = 3

  // Load session on mount
  React.useEffect(() => {
    const startTime = Date.now()
    const savedSession = localStorage.getItem(SESSION_KEY)
    if (savedSession) {
      try {
        const { user: savedUser, role: savedRole, timestamp } = JSON.parse(savedSession)
        const now = Date.now()
        const diff = now - timestamp
        const expiryMs = EXPIRY_DAYS * 24 * 60 * 60 * 1000

        if (diff < expiryMs) {
          setUser(savedUser)
          setRole(savedRole)
          
          // Re-fetch profile to ensure session is in sync with latest DB changes
          const supabase = createClient()
          supabase.from('profiles').select('*').eq('email', savedUser.email).single()
            .then(({ data: profile }) => {
              if (profile) {
                const refreshed = {
                  ...savedUser,
                  approvalStatus: profile.approval_status,
                  subjectsTaught: profile.subjects_taught,
                  gradeClass: profile.grade_class,
                }
                setUser(refreshed)
                const session = { user: refreshed, role: savedRole, timestamp: Date.now() }
                localStorage.setItem("portal_auth_session", JSON.stringify(session))
              }
            })

          // Only enforce the 5s wait if we ARE restoring a session
          const elapsedTime = Date.now() - startTime
          const waitTime = Math.max(0, 5000 - elapsedTime)
          setTimeout(() => setIsLoading(false), waitTime)
          return // Exit early as we've handled loading
        } else {
          localStorage.removeItem(SESSION_KEY)
        }
      } catch (e) {
        console.error("Failed to parse session", e)
        localStorage.removeItem(SESSION_KEY)
      }
    }

    // If no session or expired, load instantly
    setIsLoading(false)
  }, [])

  const saveSession = (userData: User, userRole: UserRole) => {
    const session = {
      user: userData,
      role: userRole,
      timestamp: Date.now()
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }

  const login = async (email: string, pass: string, newRole: UserRole) => {
    setIsLoading(true)
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .single()

      if (error || !profile) {
        toast.error("Invalid login credentials. Please check your email, password, and portal type.")
        return
      }

      // Check password
      if (profile.password && profile.password !== pass) {
        toast.error("Invalid login credentials. Please check your email, password, and portal type.")
        return
      }

      // Enforce role matching
      if (profile.role !== newRole) {
        toast.error("Invalid login credentials. Please check your email, password, and portal type.")
        return
      }

      const userData = {
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role,
        gradeClass: profile.grade_class,   // ← grade loaded from DB
        approvalStatus: profile.approval_status,
        subjectsTaught: profile.subjects_taught
      }
      
      setRole(profile.role as UserRole)
      setUser(userData)
      saveSession(userData, profile.role as UserRole)
      toast.success("Welcome back, " + profile.full_name.split(" ")[0] + "!")
    } catch (err) {
      console.error("Login error:", err)
      toast.error("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (userData: any): Promise<boolean> => {
    setIsLoading(true)
    try {
      // For students, validate their ID against the whitelist
      if (userData.role === 'student') {
        const { data: valid, error: validErr } = await supabase
          .from('valid_students')
          .select('student_id')
          .eq('student_id', userData.studentId?.trim().toUpperCase())
          .single()

        if (validErr || !valid) {
          toast.error("Invalid Student ID. Please check your ID and try again.")
          return false
        }
      }
      // Check if email already registered
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userData.email.trim().toLowerCase())
        .single()

      if (existing) {
        toast.error("An account with this email already exists.")
        return false
      }

      // Check if Student ID or Teacher ID already registered
      if (userData.role === 'student' && userData.studentId) {
        const { data: existingId } = await supabase
          .from('profiles')
          .select('id')
          .eq('student_id', userData.studentId.trim().toUpperCase())
          .single()

        if (existingId) {
          toast.error("This Student ID is already registered with another account.")
          return false
        }
      } else if (userData.role === 'teacher' && userData.teacherId) {
        const { data: existingId } = await supabase
          .from('profiles')
          .select('id')
          .eq('teacher_id', userData.teacherId.trim())
          .single()

        if (existingId) {
          toast.error("This Teacher ID is already registered with another account.")
          return false
        }
      }

      const { error } = await supabase
        .from('profiles')
        .insert({
          email: userData.email.trim().toLowerCase(),
          full_name: userData.fullName,
          role: userData.role,
          grade_class: userData.gradeClass,      // ← grade saved to DB
          teacher_id: userData.teacherId,
          student_id: userData.studentId?.trim().toUpperCase(),
          whatsapp_number: userData.whatsappNumber,
          subjects_taught: userData.subjectsTaught,
          password: userData.password,            // ← password saved (plaintext for demo)
          approval_status: userData.role === 'teacher' ? 'pending' : 'approved'
        })

      if (error) throw error

      const userDataObj = {
        email: userData.email.trim().toLowerCase(),
        fullName: userData.fullName,
        role: userData.role,
        gradeClass: userData.gradeClass,          // ← grade set in state immediately
        approvalStatus: userData.role === 'teacher' ? 'pending' : 'approved',
        whatsappNumber: userData.whatsappNumber,
        subjectsTaught: userData.subjectsTaught
      }

      setRole(userData.role)
      setUser(userDataObj)
      saveSession(userDataObj, userData.role)
      toast.success("Account created successfully!")
      return true
    } catch (err) {
      console.error("Signup error:", err)
      toast.error("Failed to create account")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setRole(null)
    setUser(null)
    localStorage.removeItem("portal_auth_session")
  }

  const refreshStatus = async () => {
    if (!user) return
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email)
        .single()

      if (error || !profile) throw new Error("Could not refresh status")

      const updatedUser = {
        ...user,
        approvalStatus: profile.approval_status,
        fullName: profile.full_name,
        subjectsTaught: profile.subjects_taught,
        gradeClass: profile.grade_class
      }

      setUser(updatedUser)
      saveSession(updatedUser, role)
      
      if (profile.approval_status === 'approved' && user.approvalStatus === 'pending') {
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
    if (!user) return false
    
    try {
      // Map frontend fields to DB fields
      const dbUpdates: any = {}
      if (updates.fullName) dbUpdates.full_name = updates.fullName
      if (updates.subjectsTaught) dbUpdates.subjects_taught = updates.subjectsTaught
      if (updates.whatsappNumber) dbUpdates.whatsapp_number = updates.whatsappNumber
      if (updates.gradeClass) dbUpdates.grade_class = updates.gradeClass

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('email', user.email)

      if (error) throw error

      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      saveSession(updatedUser, role)
      
      toast.success("Profile updated successfully!")
      return true
    } catch (err) {
      console.error("Update error:", err)
      toast.error("Failed to update profile.")
      return false
    }
  }

  return (
    <AuthContext.Provider value={{ role, setRole, user, login, signup, logout, refreshStatus, updateProfile, isLoading }}>
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
