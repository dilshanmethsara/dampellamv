"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { ArrowLeft, Eye, EyeOff, Check, Loader2, CheckCircle2, XCircle, GraduationCap, Zap, Lock, Mail, User, Phone, BookOpen, ShieldCheck, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { motion, AnimatePresence } from "framer-motion"
import { AnimatedContainer, childVariants } from "@/components/portal/premium-card"

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
  role: UserRole
  initialTab?: "login" | "signup"
  onBack: () => void
  onSuccess: () => void
}

export function AuthForms({ role, initialTab = "login", onBack, onSuccess }: AuthFormsProps) {
  const { login, signup, isLoading, requestPasswordReset, updatePassword, isRecovery } = useAuth()
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "forgot" | "reset">(initialTab)

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

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const userData: Record<string, unknown> = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      fullName: formData.get("fullName") as string,
      role,
    }

    if (role === "student") {
      userData.gradeClass = formData.get("gradeClass") as string
      userData.studentId = formData.get("studentId") as string
    } else {
      userData.phoneNumber = formData.get("phoneNumber") as string
      userData.teacherId = formData.get("teacherId") as string
      const subjects = formData.getAll("subjects") as string[]
      
      if (subjects.length === 0) {
        toast.error("Please select at least one subject you teach.")
        return
      }
      
      userData.subjectsTaught = subjects
    }

    userData.whatsappNumber = formData.get("whatsappNumber") as string

    const success = await signup(userData as Parameters<typeof signup>[0])
    if (success) {
      sessionStorage.removeItem("student_signup_form")
      sessionStorage.removeItem("teacher_signup_form")
      onSuccess()
    }
  }

  const roleTitle = role === "student" ? t("common.student") : t("common.teacher")
  const accentColor = "rgba(99, 102, 241, 0.2)" // Indigo

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center p-16 xl:p-24 border-r border-border/50 bg-zinc-50 dark:bg-zinc-900/40 relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative z-10 max-w-lg">
          <div className="size-16 rounded-2xl bg-foreground text-background flex items-center justify-center mb-10 shadow-sm border border-border">
            <GraduationCap className="size-8" />
          </div>

          <div className="relative overflow-hidden" style={{ minHeight: '180px' }}>
            <AnimatePresence mode="wait" initial={false}>
              {activeTab === "login" ? (
                <motion.div
                  key="login-panel"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1] mb-6">
                    Welcome back<br/>
                    <span className="text-muted-foreground">to the Portal.</span>
                  </h1>
                  <p className="text-base sm:text-xl text-muted-foreground font-medium leading-relaxed">
                    Sign in to your {roleTitle.toLowerCase()} account and continue your academic journey.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="signup-panel"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1] mb-6">
                    Join the<br/>
                    <span className="text-muted-foreground">Pro-Portal.</span>
                  </h1>
                  <p className="text-base sm:text-xl text-muted-foreground font-medium leading-relaxed">
                    Create your {roleTitle.toLowerCase()} account and unlock the next-generation learning management system.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Role badge */}
          <motion.div
            layout
            className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-background/50 backdrop-blur-sm"
          >
            <div className="size-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {roleTitle} Mode Active
            </span>
          </motion.div>
        </div>
      </div>

      {/* Right Auth Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center relative bg-background p-5 sm:p-12 lg:p-16 xl:p-24">
        <div className="absolute top-8 right-8 flex items-center gap-3 z-30">
          <LanguageToggle />
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md mx-auto relative z-10">
          <AnimatedContainer className="space-y-8">
            <motion.div variants={childVariants} className="flex items-center gap-4 border-b border-border/50 pb-6 mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-10 w-10 rounded-full border border-border text-muted-foreground hover:text-foreground transition-all group"
              >
                <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
              </Button>
              <div>
                <h2 className="text-2xl font-black tracking-tight uppercase leading-none">{roleTitle} Access</h2>
                <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase mt-1">Secure Gateway</p>
              </div>
            </motion.div>

          <motion.div variants={childVariants} className="w-full">
            <div className="sleek-card p-0 overflow-hidden border-none backdrop-blur-xl relative z-10 w-full mx-auto">
              <div className="p-2 border-b border-border/50">
                <Tabs
                  value={activeTab}
                  onValueChange={(v) => setActiveTab(v as "login" | "signup")}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 p-1 bg-transparent h-14 relative">
                    <TabsTrigger 
                      value="login" 
                      className={cn(
                        "rounded-2xl py-2.5 font-bold text-[10px] uppercase tracking-[0.2em] transition-all z-10",
                        activeTab === "login" 
                          ? "!bg-primary !text-primary-foreground shadow-sm" 
                          : "!text-muted-foreground hover:!text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                      )}
                    >
                      {t("common.signIn")}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="signup" 
                      className={cn(
                        "rounded-2xl py-2.5 font-bold text-[10px] uppercase tracking-[0.2em] transition-all z-10",
                        activeTab === "signup" 
                          ? "!bg-primary !text-primary-foreground shadow-sm" 
                          : "!text-muted-foreground hover:!text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                      )}
                    >
                      {t("common.signUp")}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="p-6 sm:p-10 lg:p-14 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
                   {activeTab === 'login' ? <Lock className="size-48" /> : <ShieldCheck className="size-48" />}
                </div>
                
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: activeTab === 'signup' ? 32 : -32 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: activeTab === 'signup' ? -32 : 32 }}
                    transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ willChange: 'transform, opacity' }}
                  >
                    {activeTab === "login" ? (
                      <LoginForm 
                        onSubmit={handleLogin} 
                        isLoading={isLoading} 
                        t={t} 
                        onSwitchToSignup={() => setActiveTab("signup")}
                        onForgotPassword={() => setActiveTab("forgot")}
                      />
                    ) : activeTab === "signup" ? (
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

              {/* Secure Architecture Footer */}
              <div className="px-8 py-5 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Institutional Grade Encryption</span>
                </div>
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => <div key={i} className="size-5 rounded-full border-2 border-background bg-muted" />)}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatedContainer>
        </div>
      </div>
    </div>
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
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="space-y-5">
        <div className="space-y-2.5">
          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 ml-1" htmlFor="login-email">{t("auth.email")}</Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/30 group-focus-within:text-indigo-600 transition-colors">
              <Mail className="size-4" />
            </div>
            <Input
              id="login-email"
              name="email"
              type="email"
              placeholder="student@example.com"
              required
              autoComplete="email"
              className="sleek-input h-14 pl-11 w-full font-semibold text-sm"
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 ml-1" htmlFor="login-password">{t("auth.password")}</Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/30 group-focus-within:text-indigo-600 transition-colors">
              <Lock className="size-4" />
            </div>
            <Input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="sleek-input h-14 pl-11 w-full pr-12 font-semibold text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground/40 hover:text-indigo-600 transition-colors"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="flex justify-end pr-1">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest transition-colors"
          >
            Forgot Password?
          </button>
        </div>
      </div>

      <Button 
        type="submit" 
        className="sleek-btn w-full h-14 text-xs uppercase tracking-[0.2em] disabled:opacity-50" 
        disabled={isLoading}
      >
        {isLoading ? (
          <><Loader2 className="mr-3 size-4 animate-spin" />{t("auth.signingIn")}</>
        ) : (
          <>{t("auth.signInButton")}<ChevronRight className="ml-2 size-4" /></>
        )}
      </Button>

      <p className="text-center text-[10px] font-bold text-muted-foreground/50 mt-8 uppercase tracking-[0.2em]">
        {t("auth.noAccount")}{" "}
        <button 
          type="button" 
          onClick={onSwitchToSignup}
          className="text-indigo-600 hover:text-indigo-700 hover:underline underline-offset-4 decoration-2"
        >
          {t("common.signUp")}
        </button>
      </p>
    </form>
  )
}

function StudentSignupForm({
  onSubmit,
  isLoading,
  t,
  onSwitchToLogin,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  t: (k: string) => string
  onSwitchToLogin: () => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [studentId, setStudentId] = useState("")
  const [gradeClass, setGradeClass] = useState("")
  const [email, setEmail] = useState("")

  // Live ID validation state
  const [idRecord, setIdRecord] = useState<ValidStudentRecord | null>(null)
  const [idStatus, setIdStatus] = useState<"idle" | "loading" | "found" | "not_found">("idle")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    const saved = sessionStorage.getItem("student_signup_form")
    if (saved) {
      try {
        const { data, timestamp } = JSON.parse(saved)
        // Only load if data is less than 1 minute old
        if (Date.now() - timestamp < 60000) {
          if (data.fullName) setFullName(data.fullName)
          if (data.email) setEmail(data.email)
          if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber)
          if (data.studentId) setStudentId(data.studentId)
          if (data.gradeClass) setGradeClass(data.gradeClass)
          if (data.isWhatsAppVerified) setIsWhatsAppVerified(data.isWhatsAppVerified)
        } else {
          sessionStorage.removeItem("student_signup_form")
        }
      } catch (e) {
        console.error("Error parsing saved student state", e)
      }
    }
  }, [])

  useEffect(() => {
    const data = { fullName, email, whatsappNumber, studentId, gradeClass, isWhatsAppVerified }
    const packet = { data, timestamp: Date.now() }
    sessionStorage.setItem("student_signup_form", JSON.stringify(packet))
  }, [fullName, email, whatsappNumber, studentId, gradeClass, isWhatsAppVerified])

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
    if (studentId.length !== 4) {
      toast.error("Please enter your 4-digit Student ID")
      return
    }
    if (idStatus === "not_found") {
      toast.error("This Student ID is not registered. Contact your school administrator.")
      return
    }
    if (idStatus === "loading") {
      toast.error("Please wait while we verify your ID...")
      return
    }
    if (nameMatches === false) {
      toast.error("Your name doesn't match our records for this Student ID.")
      return
    }
    if (gradeMatches === false) {
      toast.error("Your grade doesn't match our records for this Student ID.")
      return
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    onSubmit(e)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">{t("auth.fullName")}</Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/30 group-focus-within:text-indigo-600 transition-colors">
              <User className="size-4" />
            </div>
            <Input
              name="fullName"
              placeholder="Full Name"
              required
              className="sleek-input h-14 pl-11 w-full font-semibold text-sm"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t("auth.email")}</Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/50 group-focus-within:text-primary transition-colors">
              <Mail className="size-4" />
            </div>
            <Input
              name="email"
              type="email"
              placeholder="Email Address"
              required
              className="sleek-input h-14 pl-11 w-full font-bold"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t("auth.whatsappNumber")}</Label>
          <div className="flex gap-2">
            <div className="relative group flex-1">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/50 group-focus-within:text-primary transition-colors">
                <Phone className="size-4" />
              </div>
              <Input
                name="whatsappNumber"
                type="tel"
                placeholder="WhatsApp Number"
                required
                className={cn(
                  "sleek-input h-14 pl-11 w-full font-bold",
                  isWhatsAppVerified && "border-emerald-500/50 bg-emerald-500/5"
                )}
                value={whatsappNumber}
                onChange={(e) => {
                  setWhatsappNumber(e.target.value)
                  if (otpSent) setOtpSent(false)
                  if (isWhatsAppVerified) setIsWhatsAppVerified(false)
                }}
                disabled={isWhatsAppVerified || isSendingCode}
              />
              {isWhatsAppVerified && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <CheckCircle2 className="size-5 text-emerald-500" />
                </div>
              )}
            </div>
            {!isWhatsAppVerified && (
              <Button 
                type="button"
                onClick={handleSendOTP}
                disabled={isSendingCode || countdown > 0 || !whatsappNumber}
                className="h-14 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-wider transition-all disabled:opacity-50"
              >
                {isSendingCode ? <Loader2 className="size-4 animate-spin" /> : countdown > 0 ? `${countdown}s` : otpSent ? "Resend" : "Get Code"}
              </Button>
            )}
          </div>
        </div>

        {otpSent && !isWhatsAppVerified && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 ml-1">Enter Verification Code</Label>
            <div className="flex gap-2">
              <div className="relative group flex-1">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/50 group-focus-within:text-indigo-600 transition-colors">
                  <ShieldCheck className="size-4" />
                </div>
                <Input
                  type="text"
                  placeholder="6-digit code"
                  maxLength={6}
                  className="sleek-input h-14 pl-11 w-full font-bold tracking-[0.5em] text-center"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <Button 
                type="button"
                onClick={handleVerifyOTP}
                disabled={verificationCode.length !== 6}
                className="h-14 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20"
              >
                Verify
              </Button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t("auth.password")}</Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/50 group-focus-within:text-primary transition-colors">
                <Lock className="size-4" />
              </div>
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create Password"
                required
                className="sleek-input h-14 pl-11 w-full pr-12 font-bold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-primary transition-colors">
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Confirm Password</Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/50 group-focus-within:text-primary transition-colors">
                <Lock className="size-4" />
              </div>
              <Input
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                required
                className={cn(
                  "sleek-input h-14 pl-11 w-full pr-12 font-bold transition-all",
                  confirmPassword && password !== confirmPassword && "border-red-500 bg-red-500/5 focus:ring-red-500/20"
                )}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">{t("auth.gradeClass")}</Label>
            <Select name="gradeClass" required value={gradeClass} onValueChange={setGradeClass}>
              <SelectTrigger className="h-14 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 px-4 focus:ring-indigo-500/30 font-semibold text-sm transition-all">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl">
                {["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"].map((grade) => (
                  <SelectItem key={grade} value={grade} className="rounded-xl focus:bg-indigo-500/10 focus:text-indigo-600">{grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">{t("auth.studentId")}</Label>
            <StudentIdInput value={studentId} onChange={setStudentId} length={4} disabled={isLoading} status={idStatus} />
          </div>
        </div>

        {/* Verification Hub */}
        <AnimatePresence>
          {idStatus !== 'idle' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className={cn(
                "mt-2 p-6 rounded-[2rem] border transition-all duration-700 relative group/verify",
                idStatus === "not_found" ? "bg-red-500/5 border-red-500/10" : 
                isIdVerified ? "bg-indigo-500/5 border-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.05)]" : "bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-100 dark:border-zinc-800"
              )}>
                 {idStatus === "loading" ? (
                   <div className="flex items-center justify-center gap-3 py-2 text-indigo-600 font-bold text-[10px] uppercase tracking-widest">
                     <Loader2 className="size-3.5 animate-spin" />
                     Authenticating Signature...
                   </div>
                 ) : idStatus === "not_found" ? (
                   <div className="flex items-start gap-4">
                      <div className="size-10 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0">
                        <XCircle className="size-5 text-red-500" />
                      </div>
                      <p className="text-[10px] font-bold text-red-500/80 leading-relaxed uppercase tracking-widest">Identity Record Not Found</p>
                   </div>
                 ) : idRecord && (
                   <div className="flex items-start gap-4">
                      <div className={cn(
                        "size-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all duration-700",
                        isIdVerified ? "bg-indigo-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-indigo-600"
                      )}>
                        <GraduationCap className="size-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <h4 className="font-black text-base tracking-tighter truncate uppercase leading-none mb-1 text-zinc-900 dark:text-white">{idRecord.full_name}</h4>
                         <p className="text-[9px] font-bold tracking-widest text-muted-foreground/60 uppercase mb-3">{idRecord.grade || 'Architecture Link'}</p>
                         
                         <div className="flex flex-wrap gap-2">
                            {fullName.trim().length > 2 && (
                              <Badge variant="outline" className={cn("rounded-full px-3 py-0.5 border-none", nameMatches ? "bg-indigo-500/10 text-indigo-600" : "bg-red-500/10 text-red-500")}>
                                {nameMatches ? <CheckCircle2 className="size-3 mr-1.5" /> : <XCircle className="size-3 mr-1.5" />}
                                <span className="text-[8px] font-bold uppercase tracking-widest">Signature {nameMatches ? 'Matched' : 'Mismatch'}</span>
                              </Badge>
                            )}
                            {gradeClass && (
                              <Badge variant="outline" className={cn("rounded-full px-3 py-0.5 border-none", gradeMatches ? "bg-indigo-500/10 text-indigo-600" : "bg-red-500/10 text-red-500")}>
                                {gradeMatches ? <CheckCircle2 className="size-3 mr-1.5" /> : <XCircle className="size-3 mr-1.5" />}
                                <span className="text-[8px] font-bold uppercase tracking-widest">Grade {gradeMatches ? 'Aligned' : 'Mismatch'}</span>
                              </Badge>
                            )}
                         </div>
                      </div>
                   </div>
                 )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Button
        type="submit"
        className="sleek-btn w-full h-14 text-[10px] uppercase tracking-[0.2em] disabled:opacity-50"
        disabled={isLoading || idStatus === "loading" || idStatus === "not_found" || (idStatus === 'found' && !isIdVerified)}
      >
        {isLoading ? (
          <><Loader2 className="mr-3 size-4 animate-spin" />{t("auth.signingUp")}</>
        ) : (
          <>{t("auth.signUpButton")}<ChevronRight className="ml-2 size-4" /></>
        )}
      </Button>

      <p className="text-center text-[10px] font-bold text-muted-foreground/50 mt-8 uppercase tracking-[0.2em]">
        {t("auth.haveAccount")}{" "}
        <button 
          type="button" 
          onClick={onSwitchToLogin}
          className="text-indigo-600 hover:text-indigo-700 hover:underline underline-offset-4 decoration-2"
        >
          {t("auth.signInButton")}
        </button>
      </p>
    </form>
  )
}

function TeacherSignupForm({
  onSubmit,
  isLoading,
  t,
  onSwitchToLogin,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
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
  const [teacherId, setTeacherId] = useState("")

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
        // Only load if data is less than 1 minute old
        if (Date.now() - timestamp < 60000) {
          if (data.fullName) setFullName(data.fullName)
          if (data.email) setEmail(data.email)
          if (data.teacherId) setTeacherId(data.teacherId)
          if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber)
          if (data.selectedSubjects) setSelectedSubjects(data.selectedSubjects)
          if (data.isWhatsAppVerified) setIsWhatsAppVerified(data.isWhatsAppVerified)
        } else {
          sessionStorage.removeItem("teacher_signup_form")
        }
      } catch (e) {
        console.error("Error parsing saved teacher state", e)
      }
    }
  }, [])

  useEffect(() => {
    const data = { fullName, email, teacherId, whatsappNumber, selectedSubjects, isWhatsAppVerified }
    const packet = { data, timestamp: Date.now() }
    sessionStorage.setItem("teacher_signup_form", JSON.stringify(packet))
  }, [fullName, email, teacherId, whatsappNumber, selectedSubjects, isWhatsAppVerified])

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
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (!isWhatsAppVerified) {
      toast.error("Please verify your WhatsApp number first")
      return
    }
    onSubmit(e)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-5">
        <div className="space-y-2.5">
          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">{t("auth.fullName")}</Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/30 group-focus-within:text-indigo-600 transition-colors">
              <User className="size-4" />
            </div>
            <Input
              name="fullName"
              placeholder="Full Name"
              required
              className="sleek-input h-14 pl-11 w-full font-semibold text-sm"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">{t("auth.email")}</Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/30 group-focus-within:text-indigo-600 transition-colors">
              <Mail className="size-4" />
            </div>
            <Input
              name="email"
              type="email"
              placeholder="Email Address"
              required
              className="sleek-input h-14 pl-11 w-full font-semibold text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <div className="space-y-2.5">
            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">{t("auth.whatsappNumber")}</Label>
            <div className="flex gap-2">
              <div className="relative group flex-1">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/30 group-focus-within:text-indigo-600 transition-colors">
                  <Phone className="size-4" />
                </div>
                <Input
                  name="whatsappNumber"
                  type="tel"
                  placeholder="WhatsApp Number"
                  required
                  className={cn(
                    "sleek-input h-14 pl-11 w-full font-semibold text-sm",
                    isWhatsAppVerified && "border-emerald-500/50 bg-emerald-500/5 text-emerald-600"
                  )}
                  value={whatsappNumber}
                  onChange={(e) => {
                    setWhatsappNumber(e.target.value)
                    if (otpSent) setOtpSent(false)
                    if (isWhatsAppVerified) setIsWhatsAppVerified(false)
                  }}
                  disabled={isWhatsAppVerified || isSendingCode}
                />
                {isWhatsAppVerified && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  </div>
                )}
              </div>
              {!isWhatsAppVerified && (
                <Button 
                  type="button"
                  onClick={handleSendOTP}
                  disabled={isSendingCode || countdown > 0 || !whatsappNumber}
                  className="h-14 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {isSendingCode ? <Loader2 className="size-4 animate-spin" /> : countdown > 0 ? `${countdown}s` : otpSent ? "Resend" : "Get Code"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {otpSent && !isWhatsAppVerified && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-2.5"
          >
            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 ml-1">SMS Verification Code</Label>
            <div className="flex gap-2">
              <div className="relative group flex-1">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/30 group-focus-within:text-indigo-600 transition-colors">
                  <ShieldCheck className="size-4" />
                </div>
                <Input
                  type="text"
                  placeholder="6-digit code"
                  maxLength={6}
                  className="sleek-input h-14 pl-11 w-full font-bold tracking-[0.6em] text-center"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <Button 
                type="button"
                onClick={handleVerifyOTP}
                disabled={verificationCode.length !== 6}
                className="h-14 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20"
              >
                Verify
              </Button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2.5">
            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">{t("auth.password")}</Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/30 group-focus-within:text-indigo-600 transition-colors">
                <Lock className="size-4" />
              </div>
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create Password"
                required
                className="sleek-input h-14 pl-11 w-full pr-12 font-semibold text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground/40 hover:text-indigo-600 transition-colors">
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2.5">
            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">Confirm Password</Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/30 group-focus-within:text-indigo-600 transition-colors">
                <Lock className="size-4" />
              </div>
              <Input
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                required
                className={cn(
                  "sleek-input h-14 pl-11 w-full pr-12 font-semibold text-sm transition-all",
                  confirmPassword && password !== confirmPassword && "border-red-500 bg-red-500/5 focus:ring-red-500/20"
                )}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">{t("auth.subjectsTaught")}</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-1">
            {SUBJECTS.map((subject) => {
              const isSelected = selectedSubjects.includes(subject)
              return (
                <label
                  key={subject}
                  className={cn(
                    "relative flex items-center justify-center h-14 rounded-2xl border transition-all cursor-pointer group/subject",
                    isSelected
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20"
                      : "bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 text-muted-foreground hover:border-indigo-500/50 hover:text-indigo-600"
                  )}
                >
                  <input type="checkbox" name="subjects" value={subject} checked={isSelected} onChange={() => toggleSubject(subject)} className="sr-only" />
                  <span className="font-bold text-[9px] uppercase tracking-widest">{t(`subjects.${subject}`)}</span>
                  {isSelected && (
                    <div className="absolute top-1 right-2">
                      <Check className="size-2.5" />
                    </div>
                  )}
                </label>
              )
            })}
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        className="sleek-btn w-full h-14 text-[10px] uppercase tracking-[0.2em] disabled:opacity-50" 
        disabled={isLoading || selectedSubjects.length === 0}
      >
        {isLoading ? (
          <><Loader2 className="mr-3 size-4 animate-spin" />{t("auth.signingUp")}</>
        ) : (
          <>{t("auth.signUpButton")}<ChevronRight className="ml-2 size-4" /></>
        )}
      </Button>

      <p className="text-center text-[10px] font-bold text-muted-foreground/50 mt-8 uppercase tracking-[0.2em]">
        {t("auth.haveAccount")}{" "}
        <button 
          type="button" 
          onClick={onSwitchToLogin}
          className="text-indigo-600 hover:text-indigo-700 hover:underline underline-offset-4 decoration-2"
        >
          {t("auth.signInButton")}
        </button>
      </p>
    </form>
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
      <div className="space-y-8 text-center py-4">
        <div className="flex justify-center">
          <div className="size-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 animate-in zoom-in duration-500">
            <CheckCircle2 className="size-10" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black uppercase tracking-tight">Check your email</h3>
          <p className="text-[10px] font-bold leading-relaxed text-muted-foreground uppercase tracking-widest px-4">
            We've sent a recovery link to <strong>{email}</strong>. Click the link in the email to reset your password.
          </p>
        </div>
        <Button onClick={onBack} variant="outline" className="sleek-btn w-full h-14 text-xs uppercase tracking-[0.2em]">
          Return to login
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleRequest} className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Password Recovery</h3>
          <p className="text-[10px] font-bold leading-relaxed text-muted-foreground uppercase tracking-widest">
            Enter your registered email to receive a secure recovery link.
          </p>
        </div>

        <div className="space-y-2.5">
          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">Email Address</Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/30 group-focus-within:text-indigo-600 transition-colors">
              <Mail className="size-4" />
            </div>
            <Input
              type="email"
              placeholder="student@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="sleek-input h-14 pl-11 w-full font-semibold text-sm"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <Button type="submit" className="sleek-btn w-full h-14 text-xs uppercase tracking-[0.2em]" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-3 size-4 animate-spin" /> : "Send Reset Link"}
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="w-full text-center text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors"
        >
          ← Back to Sign In
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
    // Note: Email isn't actually needed for Supabase's updateUser password flow
    const success = await onUpdatePassword("", password)
    if (success) {
      onBack()
    }
  }

  return (
    <form onSubmit={handleReset} className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Secure New Credentials</h3>
          <p className="text-[10px] font-bold leading-relaxed text-emerald-600 uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="size-3" /> Identity Verified via Recovery Link
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2.5">
            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">New Password</Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/30 group-focus-within:text-indigo-600 transition-colors">
                <Lock className="size-4" />
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="sleek-input h-14 pl-11 w-full pr-12 font-semibold text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground/40 hover:text-indigo-600 transition-colors"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">Confirm New Password</Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/30 group-focus-within:text-indigo-600 transition-colors">
                <Lock className="size-4" />
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(
                  "sleek-input h-14 pl-11 w-full font-semibold text-sm transition-all",
                  confirmPassword && password !== confirmPassword && "border-red-500 bg-red-500/5 focus:ring-red-500/20"
                )}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <Button type="submit" className="sleek-btn w-full h-14 text-xs uppercase tracking-[0.2em]" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-3 size-4 animate-spin" /> : "Update Password"}
        </Button>
      </div>
    </form>
  )
}
