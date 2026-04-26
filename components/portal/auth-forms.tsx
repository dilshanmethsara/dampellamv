"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { Loader2, CheckCircle2, Lock, Mail } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/portal/theme-toggle"
import { LanguageToggle } from "@/components/portal/language-toggle"
import { cn } from "@/lib/utils"
import { useAuth, type UserRole } from "@/lib/portal/auth-context"
import { useI18n } from "@/lib/portal/i18n-context"
import { StudentIdInput } from "@/components/portal/student-id-input"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { AnimatedContainer, childVariants } from "@/components/portal/premium-card"
import { LMSCard } from "@/components/portal/dashboards/shared"

interface ValidStudentRecord {
  student_id: string
  full_name: string
  grade: string | null
}

const SUBJECTS = [
  "Sinhala",
  "English",
  "Science",
  "Mathematics",
  "Geography",
  "ICT",
  "Agri",
  "Home Science",
  "History",
  "Drama",
  "Music",
  "Civic Education",
  "Buddhism",
  "Test Subject",
]

interface AuthFormsProps {
  initialTab?: "login" | "signup"
  onSuccess: () => void
}

export function AuthForms({ initialTab = "login", onSuccess }: AuthFormsProps) {
  const { login, signup, isLoading, requestPasswordReset, updatePassword, isRecovery } = useAuth()
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "forgot" | "reset">(initialTab)
  const [role, setRole] = useState<UserRole>("student")

  useEffect(() => {
    if (isRecovery) {
      setActiveTab("reset")
    } else {
      const savedTab = sessionStorage.getItem("auth_active_tab")
      if (savedTab) setActiveTab(savedTab as any)
    }
  }, [isRecovery])

  useEffect(() => {
    sessionStorage.setItem("auth_active_tab", activeTab)
  }, [activeTab])

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const success = await login(email, password, role)
    if (success) onSuccess()
  }

  const handleSignup = async (userData: Record<string, unknown>) => {
    const success = await signup({ ...userData, role } as Parameters<typeof signup>[0])
    if (success) {
      sessionStorage.removeItem("student_signup_form")
      sessionStorage.removeItem("teacher_signup_form")
      onSuccess()
    }
  }

  const roleTitle = role === "student" ? t("common.student") : t("common.teacher")
  const accentColor = "rgba(99, 102, 241, 0.2)" // Indigo

  return (
    <div className="min-h-screen flex flex-col bg-surface font-body text-on-surface antialiased overflow-x-hidden">
      
      {activeTab === "login" && (
        <div className="flex-grow flex items-center justify-center p-4 academic-pattern">
          <main className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden rounded-[2rem] shadow-2xl shadow-primary/5 bg-surface-container-lowest">
            {/* Left Side: Editorial Content */}
            <div className="hidden md:flex md:col-span-7 flex-col justify-between p-12 lg:p-16 relative overflow-hidden bg-primary">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-16">
                  <div className="w-10 h-10 bg-tertiary-fixed rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary">school</span>
                  </div>
                  <span className="font-headline font-extrabold text-2xl tracking-tighter text-white">Dampella</span>
                </div>
                <h1 className="font-headline text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
                  Cultivating the <br/>
                  <span className="text-tertiary-fixed-dim">Dampella LMS</span>
                </h1>
                <p className="text-on-primary-container text-lg max-w-md leading-relaxed opacity-80">
                  Welcome to a curated ecosystem of advanced pedagogy. Navigate your curriculum with the precision of an artisan.
                </p>
              </div>
              {/* Decorative Organic Asymmetry Card */}
              <div className="relative z-10 mt-12">
                <div className="glass-panel p-6 rounded-2xl border border-white/10 max-w-xs shadow-xl backdrop-blur-md bg-white/10">
                  <p className="text-primary-fixed font-medium text-sm mb-4 italic">"Education is not the filling of a pail, but the lighting of a fire."</p>
                  <div className="flex items-center gap-3">
                    <img alt="Academic Dean Profile" className="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-y0TUC_2cRZobvC7kSlqMR4E-aWohswlMC0_CmDq00S2pgF_jmHzle6UxnRGVhYLn3xUsFeR6xwqq_QhPWd0sjeu51s_KTcvQY2KYQKkEOzNE5CrdyAIQOFvol5RYy2AAg_71bEeV4Hmjya-p8r97Mfa7pvVjFJBH_Mca8PvVmBsH3WMuPZDMU7tYjbWfku-Rukaz6sflQnoW_Dyh8tzrZ7PXkLSTyyadLkFj2OZHJimB3WOZy_-C2727ZwBnJJUlhRoE_wyaRHE"/>
                    <div>
                      <p className="text-xs font-bold text-white">Dr. Alistair Vance</p>
                      <p className="text-[10px] text-white/60 uppercase tracking-widest">Dean of Curricula</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Absolute Decorative Background Image */}
              <div className="absolute inset-0 z-0">
                <img alt="Architectural Geometry" className="w-full h-full object-cover opacity-20 mix-blend-overlay" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHIeS85yNWSWPQ0UxsFxZmCN5G3h6mzFTGt_MvYCjnHY2rjG9Bk_xklwkScct8eY_l9pLR053f0Sca55pp7JhAV5xfLlfwopAtbcU7r6k_9bVn4pa-O3RJcdJXoLqsVN780Fzb5xqeee99Dv2KopWw4pd8lWjkAr2qnMGklHUtE5idmTux43M1tyneHJZByr-A-NpxYwwz0mfPqoX63_gwgR7-XoqwLlZFlyL83zOT-bIorYDZZUmkpbMi8LY-PXiGac7Zx0MyrMg"/>
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-transparent"></div>
              </div>
            </div>
            {/* Right Side: Login Form */}
            <div className="col-span-1 md:col-span-5 flex flex-col p-8 lg:p-16 bg-white relative">
              <div className="mb-10 text-center md:text-left">
                <h2 className="font-headline text-3xl font-bold text-primary tracking-tight mb-2">Portal Entry</h2>
                <p className="text-on-surface-variant text-sm">Select your role and provide credentials.</p>
              </div>
              {/* Role Selector: Multi-role Gateway */}
              <div className="grid grid-cols-3 gap-2 mb-8">
                <button onClick={() => setRole("student")} className={cn("flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 shadow-sm", role === "student" ? "bg-surface-container-low text-secondary ring-2 ring-secondary/20 scale-[1.02]" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high")}>
                  <span className="material-symbols-outlined mb-2" style={{ fontVariationSettings: role === "student" ? "'FILL' 1" : "'FILL' 0" }}>person</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Student</span>
                </button>
                <button onClick={() => setRole("teacher")} className={cn("flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 shadow-sm", role === "teacher" ? "bg-surface-container-low text-secondary ring-2 ring-secondary/20 scale-[1.02]" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high")}>
                  <span className="material-symbols-outlined mb-2" style={{ fontVariationSettings: role === "teacher" ? "'FILL' 1" : "'FILL' 0" }}>history_edu</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Teacher</span>
                </button>
                <button onClick={() => toast.info("Admin Portal Access is currently being audited.")} className={cn("flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 shadow-sm", role === "admin" ? "bg-surface-container-low text-secondary ring-2 ring-secondary/20 scale-[1.02]" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high")}>
                  <span className="material-symbols-outlined mb-2" style={{ fontVariationSettings: role === "admin" ? "'FILL' 1" : "'FILL' 0" }}>shield_person</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Admin</span>
                </button>
              </div>

              <div>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`${activeTab}-${role}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LoginForm 
                      onSubmit={handleLogin} 
                      isLoading={isLoading} 
                      t={t} 
                      onSwitchToSignup={() => setActiveTab("signup")}
                      onForgotPassword={() => setActiveTab("forgot")}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer Links */}
              <div className="mt-auto pt-10 text-center">
                <p className="text-sm text-on-surface-variant">
                  New to the institution?{" "}
                  <button onClick={() => setActiveTab("signup")} type="button" className="text-secondary font-bold hover:underline">Request Access</button>
                </p>
                <div className="mt-8 flex justify-center gap-6">
                  <button className="text-outline-variant hover:text-on-surface-variant transition-colors text-xs font-medium">Privacy Policy</button>
                  <button className="text-outline-variant hover:text-on-surface-variant transition-colors text-xs font-medium">Terms of Use</button>
                </div>
              </div>

            </div>
          </main>
          
          {/* Floating Decorative Element (Asymmetry Rule) */}
          <div className="fixed bottom-8 right-8 hidden md:block opacity-20 hover:opacity-100 transition-opacity z-50 pointer-events-none">
            <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-4 rounded-2xl shadow-sm">
              <div className="w-12 h-1 bg-tertiary-fixed rounded-full"></div>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Institutional Integrity 2024</p>
            </div>
          </div>
        </div>
      )}
      {activeTab !== "login" && (
        <div className="flex-grow flex flex-col relative px-0 sm:px-6 items-center justify-center py-8 md:py-12">
          {/* Background Decorators */}
          <div className="fixed -top-24 -left-24 w-96 h-96 bg-primary-fixed-dim/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="fixed top-1/2 -right-48 w-[32rem] h-[32rem] bg-tertiary-fixed/10 rounded-full blur-[100px] pointer-events-none"></div>

          {/* Secure Gateway Header */}
          <div className="w-full max-w-7xl mx-auto flex justify-between items-center mb-12 relative z-50 px-6 sm:px-0">
            <div className="text-xl font-bold text-primary tracking-tighter font-headline cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab("login")}>
              Dampella LMS
            </div>
            <div className="flex items-center gap-4">
              <button className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2 hover:text-primary transition-colors">
                Support <span className="material-symbols-outlined size-5 flex items-center justify-center rounded-full border border-current text-[14px]">help</span>
              </button>
            </div>
          </div>

          <div className="w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center max-w-7xl relative z-10">
            <div className="hidden lg:block lg:col-span-5 space-y-6 lg:pr-12 order-2 lg:order-1 px-6 sm:px-0">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-high text-tertiary text-xs font-bold tracking-wider font-headline">
                SECURE VERIFICATION
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold font-headline text-primary leading-[1.1] tracking-tighter">
                Begin Your <span className="italic font-light">Academic</span> Journey.
              </h1>
              <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
                We prioritize the integrity of our student community. Verify your contact details and securely initiate your registration to access the premium learning modules.
              </p>
              <div className="pt-8 flex gap-8">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold font-headline text-primary">12k+</span>
                  <span className="text-xs text-on-surface-variant font-medium tracking-wide uppercase">Students</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold font-headline text-primary">98%</span>
                  <span className="text-xs text-on-surface-variant font-medium tracking-wide uppercase">Completion</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 flex justify-end order-1 lg:order-2 w-full">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full glass-panel p-6 sm:p-8 lg:p-12 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl shadow-indigo-900/5 relative !bg-surface-container-lowest"
              >
                <div className="md:hidden flex flex-col gap-2 mb-8">
                  <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant">
                    <span>REGISTRATION</span>
                    <span>SECURE GATEWAY</span>
                  </div>
                  <div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-tertiary"></div>
                  </div>
                </div>

                <div className="max-h-[85vh] lg:max-h-[60vh] overflow-y-auto no-scrollbar pb-8 pr-2">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={`${activeTab}-${role}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {activeTab === "signup" ? (
                        role === "student" ? (
                          <StudentSignupForm 
                            onSubmit={handleSignup} 
                            isLoading={isLoading} 
                            t={t} 
                            onSwitchToLogin={() => setActiveTab("login")}
                          />
                        ) : (
                          <TeacherSignupForm 
                            onSubmit={handleSignup} 
                            isLoading={isLoading} 
                            t={t} 
                            onSwitchToLogin={() => setActiveTab("login")}
                          />
                        )
                      ) : activeTab === "forgot" ? (
                        <ForgotPasswordForm
                          isLoading={isLoading}
                          t={t}
                          onBack={() => setActiveTab("login")}
                          onRequestReset={requestPasswordReset}
                        />
                      ) : (
                        <ResetPasswordForm
                          isLoading={isLoading}
                          t={t}
                          onUpdatePassword={updatePassword}
                          onBack={() => setActiveTab("login")}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}


function RoleTabButton({ isActive, icon, label, onClick }: { isActive: boolean, icon: string, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-6 rounded-[2rem] transition-all duration-700 gap-3 border-none",
        isActive 
          ? "bg-surface-low text-primary shadow-sm scale-105" 
          : "bg-surface-container-lowest text-muted-foreground/20 hover:bg-surface-container/30 hover:text-foreground"
      )}
    >
      <span className={cn(
        "material-symbols-outlined text-2xl transition-all duration-700",
        isActive ? "rotate-12 scale-110" : ""
      )} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
        {icon}
      </span>
      <span className="text-[9px] font-black uppercase tracking-[0.25em]">{label}</span>
    </button>
  )
}


function LoginForm({
  onSubmit,
  isLoading,
  t,
  onSwitchToSignup,
  onForgotPassword,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  t: (k: string) => string
  onSwitchToSignup: () => void
  onForgotPassword: () => void
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      {/* Email Field */}
      <div className="space-y-2 text-left">
        <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest px-1 block" htmlFor="email">
          Email Address
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline group-focus-within:text-secondary transition-colors">
            <span className="material-symbols-outlined text-lg">mail</span>
          </div>
          <input
            className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-secondary/20 focus:bg-white text-on-surface transition-all placeholder:text-outline-variant outline-none"
            id="email"
            name="email"
            placeholder="e.g. curator@lms.edu"
            type="email"
            required
            autoComplete="email"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-2 text-left">
        <div className="flex justify-between items-center px-1">
          <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest" htmlFor="password">
            Access Key
          </label>
          <button type="button" onClick={onForgotPassword} className="text-[11px] font-bold text-secondary hover:text-primary transition-colors uppercase tracking-widest">
            Forgot Password?
          </button>
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline group-focus-within:text-secondary transition-colors">
            <span className="material-symbols-outlined text-lg">lock</span>
          </div>
          <input
            className="w-full pl-12 pr-12 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-secondary/20 focus:bg-white text-on-surface transition-all placeholder:text-outline-variant outline-none"
            id="password"
            name="password"
            placeholder="••••••••••••"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-4 flex items-center text-outline-variant hover:text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-lg">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
      </div>

      {/* Sign In Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 mt-4 bg-gradient-to-br from-primary to-secondary text-white font-headline font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isLoading ? (
          <><Loader2 className="size-5 animate-spin" /> Authenticating</>
        ) : (
          <>
            <span>Sign In</span>
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </>
        )}
      </button>
    </form>
  )
}


function StudentSignupForm({
  onSubmit,
  isLoading,
  t,
  onSwitchToLogin,
}: {
  onSubmit: (data: Record<string, unknown>) => void
  isLoading: boolean
  t: (k: string) => string
  onSwitchToLogin: () => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [studentId, setStudentId] = useState("")
  const [gradeClass, setGradeClass] = useState("")
  
  // WhatsApp Verification State
  const { sendPreSignupOTP, verifyPreSignupOTP } = useAuth()
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [isWhatsAppVerified, setIsWhatsAppVerified] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [countdown, setCountdown] = useState(0)
  const otpTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Student ID lookup state
  const [idRecord, setIdRecord] = useState<ValidStudentRecord | null>(null)
  const [idStatus, setIdStatus] = useState<"idle" | "loading" | "found" | "not_found">("idle")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [step, setStep] = useState(1)

  useEffect(() => {
    const saved = sessionStorage.getItem("student_signup_form")
    if (saved) {
      try {
        const { data, timestamp } = JSON.parse(saved)
        if (Date.now() - timestamp < 60000) {
          if (data.fullName) setFullName(data.fullName)
          if (data.email) setEmail(data.email)
          if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber)
          if (data.studentId) setStudentId(data.studentId)
          if (data.gradeClass) setGradeClass(data.gradeClass)
          if (data.isWhatsAppVerified) setIsWhatsAppVerified(data.isWhatsAppVerified)
          if (data.step) setStep(data.step)
        } else {
          sessionStorage.removeItem("student_signup_form")
        }
      } catch (e) {
        console.error("Error parsing saved student state", e)
      }
    }
  }, [])

  useEffect(() => {
    const data = { fullName, email, whatsappNumber, studentId, gradeClass, isWhatsAppVerified, step }
    const packet = { data, timestamp: Date.now() }
    sessionStorage.setItem("student_signup_form", JSON.stringify(packet))
  }, [fullName, email, whatsappNumber, studentId, gradeClass, isWhatsAppVerified, step])

  useEffect(() => {
    if (countdown > 0) {
      otpTimeoutRef.current = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => {
      if (otpTimeoutRef.current) clearTimeout(otpTimeoutRef.current)
    }
  }, [countdown])

  const handleSendOTP = async () => {
    if (!whatsappNumber || whatsappNumber.length < 9) {
      toast.error("Please enter a valid WhatsApp number")
      return
    }
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email address first")
      return
    }
    setIsSendingCode(true)
    const success = await sendPreSignupOTP(whatsappNumber, email)
    if (success) {
      setOtpSent(true)
      setCountdown(60)
    }
    setIsSendingCode(false)
  }

  const handleVerifyOTP = async () => {
    if (verificationCode.length !== 6) {
      toast.error("Please enter the 6-digit code")
      return
    }
    const success = await verifyPreSignupOTP(whatsappNumber, email, verificationCode)
    if (success) {
      setIsWhatsAppVerified(true)
      setTimeout(() => setStep(2), 1000)
    }
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (studentId.length !== 4) {
      setIdRecord(null)
      setIdStatus("idle")
      return
    }
    setIdStatus("loading")
    debounceRef.current = setTimeout(async () => {
      try {
        const validStudentsRef = collection(db, "valid_students")
        const q = query(validStudentsRef, where("student_id", "==", studentId))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
          setIdRecord(null)
          setIdStatus("not_found")
        } else {
          const docData = querySnapshot.docs[0].data()
          setIdRecord({ 
            student_id: querySnapshot.docs[0].id, 
            full_name: docData.full_name,
            grade: docData.grade
          } as ValidStudentRecord)
          setIdStatus("found")
          if (docData.grade) {
            // Normalize: "Grade 7" -> "07", "7" -> "07"
            const normalized = docData.grade.toString().replace(/[^0-9]/g, "").padStart(2, "0");
            setGradeClass(normalized)
          }
        }
      } catch (err) {
        console.error("Error verifying ID:", err)
        setIdRecord(null)
        setIdStatus("not_found")
      }
    }, 400)
  }, [studentId])

  const nameMatches = idRecord && fullName.trim().length > 2
    ? idRecord.full_name.toLowerCase().includes(fullName.trim().toLowerCase()) || 
      fullName.trim().toLowerCase().split(/\s+/).some(part => 
        part.length > 2 && idRecord.full_name.toLowerCase().includes(part)
      )
    : null

  const gradeMatches = idRecord && gradeClass
    ? idRecord.grade?.toLowerCase() === gradeClass.toLowerCase()
    : null

  const isIdVerified = idStatus === "found" && nameMatches !== false && gradeMatches !== false

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (password !== confirmPassword) {
       toast.error("Passwords do not match")
       return
    }
    onSubmit({
      email,
      password,
      fullName,
      whatsappNumber,
      studentId,
      gradeClass,
    })
  }

  const slideVariants = {
    initial: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
      transition: { duration: 0.3 }
    })
  }

  const [direction, setDirection] = useState(0)
  const paginate = (newStep: number) => {
    setDirection(newStep > step ? 1 : -1)
    setStep(newStep)
  }

  return (
    <div className="space-y-8">
      {/* Premium Step Indicator */}
      <div className="flex items-center justify-between mt-4 mb-12 px-4 max-w-md overflow-visible">
        {[1, 2, 3].map((s) => {
          const isActive = step === s
          const isCompleted = step > s
          return (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div 
                className={cn(
                  "!w-10 !h-10 flex-none aspect-square rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 relative z-10",
                  isActive 
                    ? "bg-primary text-white shadow-xl shadow-primary/20 scale-110" 
                    : isCompleted
                      ? "bg-primary text-white shadow-lg shadow-primary/10 scale-100"
                      : "bg-surface-container-high text-on-surface-variant/40"
                )}
              >
                {isCompleted ? (
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                ) : (
                  <span>{s}</span>
                )}
              </div>
              {s < 3 && (
                <div className="flex-1 h-0.5 bg-surface-container-high mx-2 relative overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 bg-primary origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isCompleted ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="relative min-h-[400px]">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              <div className="space-y-2">
                 <h3 className="text-2xl font-black tracking-tight uppercase leading-none">Frequency Sync</h3>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Step 01: Secure WhatsApp Verification</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Institutional Email</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/30 group-focus-within:text-secondary transition-colors">
                      <span className="material-symbols-outlined text-lg">mail</span>
                    </div>
                    <Input
                      name="email"
                      type="email"
                      placeholder="curator@lms.edu"
                      required
                      className="sleek-input h-14 pl-12 w-full font-bold text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">WhatsApp Number</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative group flex-1">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/30 group-focus-within:text-secondary transition-colors">
                        <span className="material-symbols-outlined text-lg">phone_iphone</span>
                      </div>
                      <Input
                        name="whatsappNumber"
                        type="tel"
                        placeholder="+94"
                        required
                        className={cn(
                          "sleek-input h-14 pl-12 w-full font-bold text-sm",
                          isWhatsAppVerified && "border-emerald-500 bg-emerald-50 text-emerald-600"
                        )}
                        value={whatsappNumber}
                        onChange={(e) => {
                          setWhatsappNumber(e.target.value)
                          if (otpSent) setOtpSent(false)
                          if (isWhatsAppVerified) setIsWhatsAppVerified(false)
                        }}
                        disabled={isWhatsAppVerified || isSendingCode}
                      />
                    </div>
                    {!isWhatsAppVerified && (
                      <button 
                        type="button"
                        onClick={handleSendOTP}
                        disabled={isSendingCode || countdown > 0 || !whatsappNumber}
                        className="h-14 px-6 rounded-2xl bg-secondary text-secondary-foreground font-black text-[10px] uppercase tracking-wider transition-all disabled:opacity-50 w-full sm:w-auto"
                      >
                        {isSendingCode ? <Loader2 className="size-4 animate-spin" /> : countdown > 0 ? `${countdown}s` : "Send OTP"}
                      </button>
                    )}
                  </div>
                </div>

                {otpSent && !isWhatsAppVerified && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    <label className="text-[11px] font-black text-secondary uppercase tracking-[0.2em] px-1">Transmission Key</label>
                    <div className="flex gap-3">
                       <Input
                         placeholder="6-Digit Secret"
                         maxLength={6}
                         className="sleek-input h-14 flex-1 font-bold tracking-[0.8em] text-center"
                         value={verificationCode}
                         onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                       />
                       <button type="button" onClick={handleVerifyOTP} className="h-14 px-8 rounded-2xl bg-emerald-600 text-white font-black text-[10px] uppercase">Verify</button>
                    </div>
                  </motion.div>
                )}
              </div>

              {isWhatsAppVerified && (
                <Button className="w-full h-14 lms-btn-primary" onClick={() => paginate(2)}>Next Step: Identity Link</Button>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
            >
              {/* Institutional Identity Column */}
              <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-secondary/60 uppercase font-headline">Step 02 of 03</span>
                    <h2 className="text-4xl font-extrabold font-headline tracking-tighter text-primary leading-tight">
                      Institutional <br />
                      Identity
                    </h2>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed text-sm max-w-sm">
                    To verify your enrollment, please provide your unique institutional identifier.
                  </p>
                </div>

                {/* Status Bar Indicator */}
                <div className="flex gap-1.5">
                  <div className="h-1 flex-1 bg-primary rounded-full"></div>
                  <div className="h-1 flex-1 bg-primary rounded-full"></div>
                  <div className="h-1 flex-1 bg-surface-container-highest rounded-full"></div>
                </div>

                {/* Secure Verification Context Card */}
                <div className="p-5 rounded-3xl bg-surface-container-low/50 border border-white/40 space-y-3">
                  <div className="flex items-center gap-3 text-emerald-600">
                    <span className="material-symbols-outlined text-lg">verified_user</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Secure Verification</span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant leading-relaxed font-medium">
                    Your 4-digit ID is validated against the school's master whitelist. This ensures only authorized students gain access to the Dampella LMS.
                  </p>
                </div>
              </div>

              {/* Input & Form Column */}
              <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-sm border border-slate-50 relative overflow-hidden">
                  <div className="space-y-8 relative z-10">
                    <div className="text-center space-y-6">
                      <h3 className="text-xs font-bold tracking-[0.15em] text-primary/40 uppercase">Enter 4-Digit Student ID</h3>
                      
                      <StudentIdInput value={studentId} onChange={setStudentId} length={4} status={idStatus} />
                      
                      <button type="button" className="text-[11px] text-secondary font-bold hover:underline underline-offset-4 opacity-70 hover:opacity-100 transition-opacity">
                        Can't find your ID? Check your registration email or contact the <span className="font-black">Registrar Office</span>.
                      </button>
                    </div>

                    <div className="space-y-4 pt-4">
                      <Button 
                        type="button"
                        className="w-full h-14 lms-btn-primary" 
                        disabled={idStatus !== 'found'} 
                        onClick={() => paginate(3)}
                      >
                        Verify & Continue
                      </Button>
                      
                      <button 
                        type="button" 
                        onClick={() => paginate(1)} 
                        className="w-full text-center text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] hover:text-secondary transition-colors"
                      >
                        ← Go back to account details
                      </button>
                    </div>
                  </div>

                  {/* Validated Identity State Overlay (Optional context) */}
                  {idStatus === 'found' && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4">
                      <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="size-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-emerald-600/60 tracking-widest">Validated Identity</p>
                        <h4 className="text-lg font-bold text-emerald-950">{idRecord?.full_name}</h4>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Promotional Banner Card */}
                <div className="rounded-[2rem] bg-indigo-950 h-32 relative overflow-hidden flex items-center px-10 group cursor-pointer hover:shadow-2xl hover:shadow-indigo-900/20 transition-all duration-500">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                  <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-indigo-500/20 to-transparent"></div>
                  
                  <div className="relative z-10 flex items-center gap-6">
                    <div className="size-14 rounded-full border border-white/10 flex items-center justify-center text-white/40 group-hover:text-white group-hover:border-white/30 transition-all">
                       <span className="material-symbols-outlined text-3xl">account_balance</span>
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-bold tracking-[0.2em] uppercase mb-1">Institutional Access</h4>
                      <p className="text-indigo-300 text-[10px] font-medium tracking-wide">Dampella LMS Digital Commons</p>
                    </div>
                  </div>
                  
                  <div className="absolute right-10 flex items-center gap-2 text-white/20 group-hover:text-white transition-all">
                    <span className="text-[9px] font-black uppercase tracking-widest">Explore</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
            >
              {/* Left Panel - Editorial / progress */}
              <div className="hidden lg:flex flex-col justify-between h-full min-h-[420px]">
                <div className="space-y-6">
                  {/* Brand */}
                  <div>
                    <p className="font-headline font-extrabold text-sm tracking-tight text-primary">Dampella LMS</p>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50">Dampella LMS</p>
                  </div>

                  {/* Headline */}
                  <div>
                    <h2 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface leading-tight">
                      Finalize Your<br/>
                      <span className="text-primary">Academic Identity.</span>
                    </h2>
                    <p className="text-sm text-on-surface-variant leading-relaxed mt-3 max-w-xs">
                      You're one step away from joining a global community of elite learners. Set your credentials and select your academic level.
                    </p>
                  </div>

                  {/* Step checklist */}
                  <div className="space-y-3 pt-2">
                    {[
                      { label: "Account Creation", sub: "Personal details secured", done: true },
                      { label: "Verification", sub: "Email authenticated", done: true },
                      { label: "Profile Setup", sub: "Courses only", done: false, active: true },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-black",
                          item.done ? "bg-emerald-600 text-white" : item.active ? "bg-primary text-white" : "bg-surface-container-high text-on-surface-variant/40"
                        )}>
                          {item.done ? (
                            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                          ) : (
                            <span>{i + 1}</span>
                          )}
                        </div>
                        <div>
                          <p className={cn("text-xs font-bold", item.done ? "text-emerald-600" : item.active ? "text-primary" : "text-on-surface-variant/40")}>{item.label}</p>
                          <p className="text-[10px] text-on-surface-variant/50">{item.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Testimonial */}
                <div className="flex items-center gap-3 pt-8">
                  <div className="w-9 h-9 rounded-full bg-surface-container-high overflow-hidden shrink-0">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSdHiWe6zCXqjPOiCL0IKmSFUlXkDN0RarhTXcyqjHFaAmXFX3ZsU3ghm7ycFvr9OnYOalU3VcRhPrqpmz2cO9cYbedQgkv1ustERTehuevrMq6ErAQFU3XdWNSmf4_t_a54uE1wwfNB4hK61tYjHb5PmFrzEOD-vGFdoxrRkEz27InX54iP0wTvpJX9TDsFMTcvw-8qi89LeMYthfqlmAXJR9-1utva9UO7atWSFCxdjur5nO4slSodxM8XLtX82uCJikxZLh1ss"
                      alt="Student testimonial"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[11px] text-on-surface-variant italic leading-relaxed">
                    "The LMS transformed my approach to study." — <span className="font-bold not-italic">Julian V.</span>
                  </p>
                </div>
              </div>

              {/* Right Panel - Form */}
              <div className="space-y-6">
                {/* Full name */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.15em] px-1">Full Name</label>
                  <Input
                    name="fullName"
                    placeholder="Provide full legal name"
                    required
                    className="sleek-input h-12 w-full font-bold text-sm"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                {/* Grade selector */}
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.15em] px-1">Select Your Grade Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { grade: "06", label: "Lower Secondary" },
                      { grade: "07", label: "Lower Secondary" },
                      { grade: "08", label: "Lower Secondary" },
                      { grade: "09", label: "Upper Secondary" },
                      { grade: "10", label: "Upper Secondary" },
                      { grade: "11", label: "Final Scholars" },
                    ].map(({ grade, label }) => {
                      const isSelected = gradeClass === grade
                      return (
                        <button
                          key={grade}
                          type="button"
                          onClick={() => {
                            setGradeClass(grade)
                            
                            // Normalization helper: extracts digits and pads (e.g. "Grade 7" -> "07")
                            const normalize = (g: string) => g.replace(/[^0-9]/g, "").padStart(2, "0");
                            
                            if (idRecord && idRecord.grade) {
                              const normalizedOfficial = normalize(idRecord.grade);
                              const normalizedSelected = normalize(grade);
                              
                              if (normalizedOfficial !== normalizedSelected) {
                                toast.error(`Your Student ID is verified for ${idRecord.grade.includes('Grade') ? idRecord.grade : 'Grade ' + idRecord.grade}. Please select the correct grade level to continue.`, {
                                  icon: '🛡️',
                                  duration: 4000
                                })
                              }
                            }
                          }}
                          className={cn(
                            "rounded-xl p-3 flex flex-col items-center justify-center gap-0.5 border-2 transition-all duration-200",
                            isSelected
                              ? "bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-[1.03]"
                              : "bg-surface-container-low border-transparent text-on-surface hover:bg-surface-container-high hover:border-outline/20"
                          )}
                        >
                          <span className="text-xl font-extrabold font-headline leading-none">{grade}</span>
                          <span className="text-[8px] font-black uppercase tracking-wider opacity-70">{label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Security Credentials */}
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.15em] px-1">Security Credentials</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-on-surface-variant/60 uppercase tracking-wider px-1">Create Password</p>
                      <div className="relative">
                        <Input
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          required
                          className="sleek-input h-11 w-full font-bold pr-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-3 flex items-center text-on-surface-variant/40 hover:text-on-surface-variant transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-on-surface-variant/60 uppercase tracking-wider px-1">Confirm Password</p>
                      <div className="relative">
                        <Input
                          name="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          required
                          className="sleek-input h-11 w-full font-bold pr-10"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-3 flex items-center text-on-surface-variant/40 hover:text-on-surface-variant transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password strength indicators */}
                  <div className="flex gap-3 px-1">
                    {[
                      { label: "8+ Characters", met: password.length >= 8 },
                      { label: "1 Number", met: /\d/.test(password) },
                      { label: "Special Symbol", met: /[^a-zA-Z0-9]/.test(password) },
                    ].map(({ label, met }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <div className={cn(
                          "w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all",
                          met ? "bg-emerald-500 border-emerald-500" : "border-on-surface-variant/30"
                        )}>
                          {met && <span className="material-symbols-outlined text-white text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
                        </div>
                        <span className={cn("text-[9px] font-bold", met ? "text-emerald-600" : "text-on-surface-variant/50")}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <div className="space-y-3 pt-1">
                  <button
                    type="submit"
                    disabled={isLoading || password !== confirmPassword || password.length < 6 || !gradeClass || !isIdVerified}
                    className="w-full h-13 py-3.5 bg-primary text-white rounded-xl font-headline font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin size-4" />
                    ) : (
                      <>Complete Registration <span className="material-symbols-outlined text-[16px]">arrow_forward</span></>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-on-surface-variant/60 leading-relaxed">
                    By completing registration, you agree to the{" "}
                    <span className="text-primary font-bold cursor-pointer hover:underline">Terms of Service</span>
                    {" "}and{" "}
                    <span className="text-primary font-bold cursor-pointer hover:underline">Honor Code</span>.
                  </p>
                </div>

                {/* Back button (mobile / compact) */}
                <Button type="button" variant="ghost" className="w-full h-10 rounded-xl text-[10px] font-black uppercase text-on-surface-variant/50" onClick={() => paginate(2)}>
                  ← Previous Step
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <p className="text-center text-sm font-medium text-muted-foreground mt-8">
        Already part of the institution?{" "}
        <button type="button" onClick={onSwitchToLogin} className="text-secondary font-black hover:underline decoration-2">
          {t("common.signIn")}
        </button>
      </p>
    </div>
  )
}

function TeacherSignupForm({
  onSubmit,
  isLoading,
  t,
  onSwitchToLogin,
}: {
  onSubmit: (data: Record<string, unknown>) => void
  isLoading: boolean
  t: (k: string) => string
  onSwitchToLogin: () => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [step, setStep] = useState(1)

  // WhatsApp Verification State
  const { sendPreSignupOTP, verifyPreSignupOTP } = useAuth()
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [isWhatsAppVerified, setIsWhatsAppVerified] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [countdown, setCountdown] = useState(0)
  const otpTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const saved = sessionStorage.getItem("teacher_signup_form")
    if (saved) {
      try {
        const { data, timestamp } = JSON.parse(saved)
        if (Date.now() - timestamp < 60000) {
          if (data.fullName) setFullName(data.fullName)
          if (data.email) setEmail(data.email)
          if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber)
          if (data.selectedSubjects) setSelectedSubjects(data.selectedSubjects)
          if (data.isWhatsAppVerified) setIsWhatsAppVerified(data.isWhatsAppVerified)
          if (data.step) setStep(data.step)
        } else {
          sessionStorage.removeItem("teacher_signup_form")
        }
      } catch (e) {
        console.error("Error parsing saved teacher state", e)
      }
    }
  }, [])

  useEffect(() => {
    const data = { fullName, email, whatsappNumber, selectedSubjects, isWhatsAppVerified, step }
    const packet = { data, timestamp: Date.now() }
    sessionStorage.setItem("teacher_signup_form", JSON.stringify(packet))
  }, [fullName, email, whatsappNumber, selectedSubjects, isWhatsAppVerified, step])

  useEffect(() => {
    if (countdown > 0) {
      otpTimeoutRef.current = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => {
      if (otpTimeoutRef.current) clearTimeout(otpTimeoutRef.current)
    }
  }, [countdown])

  const handleSendOTP = async () => {
    if (!whatsappNumber || whatsappNumber.length < 9) {
      toast.error("Please enter a valid WhatsApp number")
      return
    }
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email address first")
      return
    }
    setIsSendingCode(true)
    const success = await sendPreSignupOTP(whatsappNumber, email)
    if (success) {
      setOtpSent(true)
      setCountdown(60)
    }
    setIsSendingCode(false)
  }

  const handleVerifyOTP = async () => {
    if (verificationCode.length !== 6) {
      toast.error("Please enter the 6-digit code")
      return
    }
    const success = await verifyPreSignupOTP(whatsappNumber, email, verificationCode)
    if (success) {
      setIsWhatsAppVerified(true)
      setTimeout(() => setStep(2), 1000)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (selectedSubjects.length === 0) {
      toast.error("Please select at least one subject you teach.")
      return
    }
    onSubmit({
      email,
      password,
      fullName,
      whatsappNumber,
      subjectsTaught: selectedSubjects,
    })
  }

  const slideVariants = {
    initial: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
      transition: { duration: 0.3 }
    })
  }

  const [direction, setDirection] = useState(0)
  const paginate = (newStep: number) => {
    setDirection(newStep > step ? 1 : -1)
    setStep(newStep)
  }

  return (
    <div className="space-y-8">
      {/* Premium Step Indicator */}
      <div className="flex items-center justify-between mt-4 mb-12 px-4 max-w-md overflow-visible">
        {[1, 2, 3].map((s) => {
          const isActive = step === s
          const isCompleted = step > s
          return (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div 
                className={cn(
                  "!w-10 !h-10 flex-none aspect-square rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 relative z-10",
                  isActive 
                    ? "bg-primary text-white shadow-xl shadow-primary/20 scale-110" 
                    : isCompleted
                      ? "bg-primary text-white shadow-lg shadow-primary/10 scale-100"
                      : "bg-surface-container-high text-on-surface-variant/40"
                )}
              >
                {isCompleted ? (
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                ) : (
                  <span>{s}</span>
                )}
              </div>
              {s < 3 && (
                <div className="flex-1 h-0.5 bg-surface-container-high mx-2 relative overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 bg-primary origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isCompleted ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="relative min-h-[450px]">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              <div className="mb-10 text-center md:text-left">
                <h1 className="text-2xl font-bold font-headline text-on-surface mb-2">Verification Detail</h1>
                <p className="text-on-surface-variant leading-relaxed text-sm">To ensure the integrity of our educator community, please verify your contact information to begin your teaching journey.</p>
              </div>

              <div className="space-y-8">
                {/* Professional Email Input */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold tracking-[0.05em] text-on-surface-variant font-label uppercase">Professional Email</label>
                  <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 z-10 pointer-events-none text-[20px]">mail</span>
                    <Input
                      name="email"
                      type="email"
                      placeholder="faculty@lms.edu"
                      required
                      className="w-full h-14 bg-surface-container-high border-none rounded-xl py-4 pl-[46px] pr-5 shadow-none focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-lowest transition-all font-medium text-on-surface placeholder:text-outline-variant text-[15px]"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Phone Input Group */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold tracking-[0.05em] text-on-surface-variant font-label uppercase">WhatsApp Matrix</label>
                  <div className="flex gap-3">
                    <div className="relative group">
                      <div className="flex items-center justify-center gap-2 bg-surface-container-high px-3 sm:px-4 h-14 rounded-xl cursor-default transition-all">
                        <span className="text-lg">🇱🇰</span>
                        <span className="font-semibold text-on-surface">+94</span>
                      </div>
                    </div>
                    {/* Main Number Field */}
                    <div className="flex-1 relative">
                      <Input 
                        name="whatsappNumber"
                        className={cn("w-full h-14 bg-surface-container-high border-none rounded-xl px-5 shadow-none focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-lowest transition-all font-medium text-on-surface placeholder:text-outline-variant text-[15px]", isWhatsAppVerified && "bg-emerald-50 text-emerald-700")}
                        placeholder="77 123 4567" 
                        type="tel"
                        required
                        value={whatsappNumber}
                        onChange={(e) => {
                          setWhatsappNumber(e.target.value)
                          if (otpSent) setOtpSent(false)
                          if (isWhatsAppVerified) setIsWhatsAppVerified(false)
                        }}
                        disabled={isWhatsAppVerified || isSendingCode}
                      />
                    </div>
                  </div>
                </div>

                {/* Primary Action / OTP Handling */}
                {otpSent && !isWhatsAppVerified ? (
                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                      <label className="block text-[10px] font-bold tracking-[0.05em] text-secondary font-label uppercase">Transmission Key</label>
                      <div className="flex gap-3">
                         <Input
                           placeholder="6-Digit Secret"
                           maxLength={6}
                           className="w-full h-14 bg-surface-container-high tracking-[0.8em] text-center border-none rounded-xl px-5 focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-lowest transition-all font-bold text-on-surface shadow-none text-lg"
                           value={verificationCode}
                           onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                         />
                         <button type="button" onClick={handleVerifyOTP} className="h-14 px-8 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white font-bold tracking-widest text-[11px] uppercase shadow-lg shadow-emerald-500/20 transition-all">
                           Verify
                         </button>
                      </div>
                   </motion.div>
                ) : (
                  <div className="space-y-4 pt-2">
                    {!isWhatsAppVerified ? (
                      <button 
                        type="button"
                        onClick={handleSendOTP}
                        disabled={isSendingCode || countdown > 0 || !whatsappNumber}
                        className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-4 h-14 rounded-xl font-bold font-headline text-[15px] shadow-xl shadow-primary/10 hover:shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 relative overflow-hidden"
                      >
                         <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                           <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.63 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
                         </svg>
                         {isSendingCode ? "Transmitting..." : countdown > 0 ? `Retry in ${countdown}s` : "Send OTP via WhatsApp"}
                      </button>
                    ) : (
                      <button type="button" onClick={() => paginate(2)} className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-4 h-14 rounded-xl font-bold font-headline text-[15px] shadow-xl shadow-primary/10 hover:shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                         Continue Registration <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Helper Footer */}
              <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col items-center gap-6 justify-between opacity-80 sm:flex-row">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-dim shrink-0">
                    <img alt="Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSdHiWe6zCXqjPOiCL0IKmSFUlXkDN0RarhTXcyqjHFaAmXFX3ZsU3ghm7ycFvr9OnYOalU3VcRhPrqpmz2cO9cYbedQgkv1ustERTehuevrMq6ErAQFU3XdWNSmf4_t_a54uE1wwfNB4hK61tYjHb5PmFrzEOD-vGFdoxrRkEz27InX54iP0wTvpJX9TDsFMTcvw-8qi89LeMYthfqlmAXJR9-1utva9UO7atWSFCxdjur5nO4slSodxM8XLtX82uCJikxZLh1ss"/>
                  </div>
                  <p className="text-xs text-on-surface-variant max-w-[180px] leading-relaxed">Need help? Ask our educator support team.</p>
                </div>
                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-on-surface-variant/40">lock</span>
                  <span className="material-symbols-outlined text-on-surface-variant/40">verified_user</span>
                  <span className="material-symbols-outlined text-on-surface-variant/40">shield_with_heart</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-8"
            >
              <div className="space-y-2">
                 <h3 className="text-2xl font-black tracking-tight uppercase leading-none">Pedagogical Linkage</h3>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Step 02: Select Your Teaching Subjects</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Curriculum Expertise</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SUBJECTS.map((subject) => {
                      const isSelected = selectedSubjects.includes(subject)
                      return (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedSubjects(selectedSubjects.filter(s => s !== subject))
                            } else {
                              setSelectedSubjects([...selectedSubjects, subject])
                            }
                          }}
                          className={cn(
                            "h-12 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all duration-300",
                            isSelected ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-surface-container-low text-muted-foreground hover:bg-surface-container-highest"
                          )}
                        >
                          {subject}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                 <Button type="button" variant="ghost" className="h-14 rounded-2xl flex-1 text-[10px] font-black uppercase" onClick={() => paginate(1)}>Go Back</Button>
                 <Button type="button" className="h-14 flex-1 lms-btn-primary" disabled={selectedSubjects.length === 0} onClick={() => paginate(3)}>Next Step</Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-8"
            >
              <div className="space-y-2">
                 <h3 className="text-2xl font-black tracking-tight uppercase leading-none">Security Matrix</h3>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Step 03: Professional Identity Setup</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Full Academic Name</label>
                  <Input
                    name="fullName"
                    placeholder="Provide full legal name"
                    required
                    className="sleek-input h-14 w-full font-bold text-sm"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Set Access Key</label>
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      className="sleek-input h-14 w-full font-bold"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Confirm Key</label>
                    <Input
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      className="sleek-input h-14 w-full font-bold"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                 <Button type="button" variant="ghost" className="h-14 rounded-2xl flex-1 text-[10px] font-black uppercase" onClick={() => paginate(2)}>Previous</Button>
                 <button type="submit" className="h-14 flex-[2] bg-foreground text-background rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl disabled:opacity-50" disabled={isLoading || password !== confirmPassword}>
                    {isLoading ? <Loader2 className="animate-spin size-4 mx-auto" /> : "Complete Affiliation"}
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <p className="text-center text-sm font-medium text-muted-foreground mt-8">
        Already part of the faculty?{" "}
        <button type="button" onClick={onSwitchToLogin} className="text-secondary font-black hover:underline decoration-2">
          {t("common.signIn")}
        </button>
      </p>
    </div>
  )
}

function ForgotPasswordForm({
  isLoading,
  t,
  onBack,
  onRequestReset,
}: {
  isLoading: boolean
  t: (k: string) => string
  onBack: () => void
  onRequestReset: (email: string) => Promise<boolean>
}) {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)

  const handleRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const success = await onRequestReset(email)
    if (success) {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="space-y-8 text-center py-8">
        <div className="flex justify-center">
          <div className="size-24 rounded-[2.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-600 animate-in zoom-in duration-700 shadow-xl shadow-emerald-500/5">
             <span className="material-symbols-outlined text-5xl font-black fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-headline text-3xl font-black text-foreground tracking-tight">Transmission Sent</h3>
          <p className="text-sm font-medium leading-relaxed text-muted-foreground px-4">
            A secure recovery link has been dispatched to <span className="text-foreground font-black">{email}</span>. Please verify your inbox.
          </p>
        </div>
        <button 
          onClick={onBack} 
          className="w-full h-14 bg-accent text-accent-foreground font-bold rounded-2xl transition-all hover:bg-accent/80 active:scale-[0.98] uppercase tracking-widest text-[10px]"
        >
          Return to Portal
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleRequest} className="space-y-8">
      <div className="space-y-6">
        <div>
          <h3 className="font-headline text-2xl font-black text-foreground tracking-tight mb-2">Key Recovery</h3>
          <p className="text-sm font-medium text-muted-foreground">
            Enter your registered email to receive a secure recovery link.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Email Address</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/30 group-focus-within:text-secondary transition-colors">
              <span className="material-symbols-outlined text-lg">mail</span>
            </div>
            <Input
              type="email"
              placeholder="curator@lms.edu"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="sleek-input h-14 pl-12 w-full font-bold text-sm"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <button 
          type="submit" 
          className="w-full h-14 bg-gradient-to-br from-primary to-secondary text-white font-headline font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all transform active:scale-[0.98]" 
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="size-4 animate-spin" />
              <span>Transmitting...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm uppercase tracking-[0.1em]">Send Recovery Link</span>
              <span className="material-symbols-outlined text-lg">send</span>
            </div>
          )}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full text-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] hover:text-secondary transition-colors"
        >
          ← Back to Portal Entry
        </button>
      </div>
    </form>
  )
}

function ResetPasswordForm({
  isLoading,
  t,
  onUpdatePassword,
  onBack,
}: {
  isLoading: boolean
  t: (k: string) => string
  onUpdatePassword: (email: string, pass: string) => Promise<boolean>
  onBack: () => void
}) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    const success = await onUpdatePassword("", password)
    if (success) {
      onBack()
    }
  }

  return (
    <form onSubmit={handleReset} className="space-y-8">
      <div className="space-y-6">
        <div>
          <h3 className="font-headline text-2xl font-black text-foreground tracking-tight mb-2">Secure New Key</h3>
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-600">
            <span className="material-symbols-outlined text-lg fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <p className="text-[10px] font-black uppercase tracking-widest">Identity Verified via Recovery Link</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">New Access Key</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/30 group-focus-within:text-secondary transition-colors">
                <span className="material-symbols-outlined text-lg">lock</span>
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="sleek-input h-14 pl-12 w-full pr-12 font-bold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground/40 hover:text-secondary transition-colors"
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Confirm New Key</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/30 group-focus-within:text-secondary transition-colors">
                <span className="material-symbols-outlined text-lg">lock_reset</span>
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(
                  "sleek-input h-14 pl-12 w-full pr-12 font-bold transition-all",
                  confirmPassword && password !== confirmPassword && "border-destructive bg-destructive/5 focus:ring-destructive/20"
                )}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <button 
          type="submit" 
          className="w-full h-14 bg-gradient-to-br from-primary to-secondary text-white font-headline font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all transform active:scale-[0.98]" 
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="size-4 animate-spin" />
              <span>Updating...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm uppercase tracking-[0.1em]">Update Access Key</span>
              <span className="material-symbols-outlined text-lg">security</span>
            </div>
          )}
        </button>
      </div>
    </form>
  )
}

