"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { ArrowLeft, Eye, EyeOff, Check, Loader2, CheckCircle2, XCircle, GraduationCap } from "lucide-react"
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
import { createClient } from "@/lib/supabase"

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
  "Buddhism",
  "Test Subject",
]

interface AuthFormsProps {
  role: UserRole
  onBack: () => void
  onSuccess: () => void
}

export function AuthForms({ role, onBack, onSuccess }: AuthFormsProps) {
  const { login, signup, isLoading } = useAuth()
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    await login(email, password, role)
    onSuccess()
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
    if (success) onSuccess()
  }

  const roleTitle = role === "student" ? t("common.student") : t("common.teacher")
  const roleColor = role === "student" ? "from-blue-500/20" : "from-emerald-500/20"

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div
          className={cn(
            "absolute -inset-20 pointer-events-none opacity-30 mix-blend-multiply transition-all duration-1000",
            "bg-gradient-to-b to-transparent blur-3xl",
            roleColor
          )}
        />

        <div className="bg-background/80 backdrop-blur-xl border rounded-2xl shadow-2xl overflow-hidden">
          <header className="flex items-center gap-4 px-6 py-6 border-b bg-muted/30">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="shrink-0 h-9 w-9 rounded-full"
              aria-label={t("common.cancel")}
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{roleTitle}</h1>
              <p className="text-sm text-muted-foreground">
                {activeTab === "login" ? t("auth.enterDetails") : t("auth.enterDetailsSignup")}
              </p>
            </div>
          </header>

          <div className="p-6 md:p-8">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "login" | "signup")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-muted/50 rounded-xl">
                <TabsTrigger value="login" className="rounded-lg py-2.5 transition-all">
                  {t("common.signIn")}
                </TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg py-2.5 transition-all">
                  {t("common.signUp")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-0 animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
                <LoginForm onSubmit={handleLogin} isLoading={isLoading} t={t} />
              </TabsContent>

              <TabsContent value="signup" className="mt-0 animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
                {role === "student" ? (
                  <StudentSignupForm onSubmit={handleSignup} isLoading={isLoading} t={t} />
                ) : (
                  <TeacherSignupForm onSubmit={handleSignup} isLoading={isLoading} t={t} />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoginForm({
  onSubmit,
  isLoading,
  t,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  t: (k: string) => string
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="login-email">{t("auth.email")}</FieldLabel>
          <Input
            id="login-email"
            name="email"
            type="email"
            placeholder="student@example.com"
            required
            autoComplete="email"
            className="h-11 rounded-xl"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="login-password">{t("auth.password")}</FieldLabel>
          <div className="relative">
            <Input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="pr-11 h-11 rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </Field>
      </FieldGroup>

      <Button type="submit" className="w-full h-11 rounded-xl text-base font-semibold transition-all hover:shadow-lg active:scale-[0.98]" disabled={isLoading}>
        {isLoading ? (
          <>
            <Spinner className="mr-2" />
            {t("auth.signingIn")}
          </>
        ) : (
          t("auth.signInButton")
        )}
      </Button>
    </form>
  )
}

function StudentSignupForm({
  onSubmit,
  isLoading,
  t,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  t: (k: string) => string
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [studentId, setStudentId] = useState("")
  const [gradeClass, setGradeClass] = useState("")
  const [fullName, setFullName] = useState("")

  // Live ID validation state
  const [idRecord, setIdRecord] = useState<ValidStudentRecord | null>(null)
  const [idStatus, setIdStatus] = useState<"idle" | "loading" | "found" | "not_found">("idle")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Whenever all 4 digits are entered, look up from DB
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
        const supabase = createClient()
        const { data, error } = await supabase
          .from("valid_students")
          .select("student_id, full_name, grade")
          .eq("student_id", studentId)
          .single()

        if (error || !data) {
          setIdRecord(null)
          setIdStatus("not_found")
        } else {
          setIdRecord(data)
          setIdStatus("found")
        }
      } catch {
        setIdRecord(null)
        setIdStatus("not_found")
      }
    }, 400)
  }, [studentId])

  // Check if the entered name matches any significant part of the record (more flexible)
  const nameMatches = idRecord && fullName.trim().length > 2
    ? fullName.trim().toLowerCase().split(/\s+/).some(part => 
        part.length > 2 && idRecord.full_name.toLowerCase().includes(part)
      )
    : null

  // Check if grade matches
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
    onSubmit(e)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="student-fullName">{t("auth.fullName")}</FieldLabel>
          <Input
            id="student-fullName"
            name="fullName"
            type="text"
            placeholder="John Doe"
            required
            autoComplete="name"
            className="h-11 rounded-xl"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="student-email">{t("auth.email")}</FieldLabel>
          <Input
            id="student-email"
            name="email"
            type="email"
            placeholder="john@example.com"
            required
            autoComplete="email"
            className="h-11 rounded-xl"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="student-whatsapp">{t("auth.whatsappNumber")}</FieldLabel>
          <Input
            id="student-whatsapp"
            name="whatsappNumber"
            type="tel"
            placeholder="07X XXX XXXX"
            required
            className="h-11 rounded-xl"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="student-password">{t("auth.password")}</FieldLabel>
          <div className="relative">
            <Input
              id="student-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className="pr-11 h-11 rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="student-gradeClass">{t("auth.gradeClass")}</FieldLabel>
          <Select name="gradeClass" required value={gradeClass} onValueChange={setGradeClass}>
            <SelectTrigger id="student-gradeClass" className="h-11 rounded-xl">
              <SelectValue placeholder={t("auth.gradeClass")} />
            </SelectTrigger>
            <SelectContent>
              {["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"].map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <div className="flex justify-between items-center mb-1">
            <FieldLabel htmlFor="student-id">{t("auth.studentId")}</FieldLabel>
            <span className="text-[10px] font-medium text-primary/70 uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
              4 Digits
            </span>
          </div>
          <StudentIdInput
            value={studentId}
            onChange={setStudentId}
            length={4}
            disabled={isLoading}
            status={idStatus}
          />

          {/* Lookup status feedback */}
          <div className="mt-3 transition-all duration-300">
            {idStatus === "loading" && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center py-2">
                <Loader2 className="size-3.5 animate-spin" />
                <span>Checking ID...</span>
              </div>
            )}

            {idStatus === "not_found" && (
              <div className="flex items-center gap-2 text-xs text-destructive justify-center py-2 bg-destructive/5 rounded-xl border border-destructive/20 px-3">
                <XCircle className="size-3.5 shrink-0" />
                <span>This ID is not in our system. Contact your school admin.</span>
              </div>
            )}

            {idStatus === "found" && idRecord && (
              <div className={cn(
                "rounded-xl border px-4 py-3 text-sm transition-all duration-300",
                nameMatches === false || gradeMatches === false
                  ? "bg-destructive/5 border-destructive/20"
                  : "bg-emerald-500/5 border-emerald-500/20"
              )}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-primary/10">
                    <GraduationCap className="size-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{idRecord.full_name}</p>
                    {idRecord.grade && (
                      <p className="text-xs text-muted-foreground mt-0.5">{idRecord.grade}</p>
                    )}
                    <div className="mt-2 space-y-1">
                      {fullName.trim().length > 2 && (
                        <div className={cn(
                          "flex items-center gap-1.5 text-xs",
                          nameMatches ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                        )}>
                          {nameMatches ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                          <span>{nameMatches ? "Name matches" : "Name doesn't match the record"}</span>
                        </div>
                      )}
                      {gradeClass && (
                        <div className={cn(
                          "flex items-center gap-1.5 text-xs",
                          gradeMatches ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                        )}>
                          {gradeMatches ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                          <span>{gradeMatches ? "Grade matches" : `Grade should be ${idRecord.grade ?? "unknown"}`}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {isIdVerified && (
                    <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                  )}
                </div>
              </div>
            )}
          </div>
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        className="w-full h-11 rounded-xl text-base font-semibold transition-all hover:shadow-lg active:scale-[0.98]"
        disabled={isLoading || idStatus === "loading" || idStatus === "not_found"}
      >
        {isLoading ? (
          <>
            <Spinner className="mr-2" />
            {t("auth.signingUp")}
          </>
        ) : (
          t("auth.signUpButton")
        )}
      </Button>
    </form>
  )
}

function TeacherSignupForm({
  onSubmit,
  isLoading,
  t,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  t: (k: string) => string
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FieldGroup className="gap-5">
        <Field>
          <FieldLabel htmlFor="teacher-fullName">{t("auth.fullName")}</FieldLabel>
          <Input
            id="teacher-fullName"
            name="fullName"
            type="text"
            placeholder="Dr. Jane Smith"
            required
            autoComplete="name"
            className="h-11 rounded-xl"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="teacher-email">{t("auth.email")}</FieldLabel>
          <Input
            id="teacher-email"
            name="email"
            type="email"
            placeholder="jane@example.com"
            required
            autoComplete="email"
            className="h-11 rounded-xl"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="teacher-whatsapp">{t("auth.whatsappNumber")}</FieldLabel>
          <Input
            id="teacher-whatsapp"
            name="whatsappNumber"
            type="tel"
            placeholder="07X XXX XXXX"
            required
            className="h-11 rounded-xl"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="teacher-password">{t("auth.password")}</FieldLabel>
          <div className="relative">
            <Input
              id="teacher-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className="pr-11 h-11 rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </Field>

        <Field>
          <FieldLabel>{t("auth.subjectsTaught")}</FieldLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {SUBJECTS.map((subject) => {
              const isSelected = selectedSubjects.includes(subject)
              return (
                <label
                  key={subject}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all border",
                    isSelected
                      ? "bg-primary/10 border-primary text-primary font-medium"
                      : "bg-muted/30 border-transparent hover:border-muted-foreground/30"
                  )}
                >
                  <input
                    type="checkbox"
                    name="subjects"
                    value={subject}
                    checked={isSelected}
                    onChange={() => toggleSubject(subject)}
                    className="sr-only"
                  />
                  <div className={cn(
                    "size-4 rounded border flex items-center justify-center transition-colors",
                    isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                  )}>
                    {isSelected && <Check className="size-3 text-white" />}
                  </div>
                  {t(`subjects.${subject}`)}
                </label>
              )
            })}
          </div>
        </Field>
      </FieldGroup>

      <Button type="submit" className="w-full h-11 rounded-xl text-base font-semibold transition-all hover:shadow-lg active:scale-[0.98]" disabled={isLoading}>
        {isLoading ? (
          <>
            <Spinner className="mr-2" />
            {t("auth.signingUp")}
          </>
        ) : (
          t("auth.signUpButton")
        )}
      </Button>
    </form>
  )
}

