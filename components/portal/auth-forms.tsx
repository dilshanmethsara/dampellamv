"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ArrowLeft, Eye, EyeOff, Check } from "lucide-react"
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

  return (
    <form onSubmit={onSubmit} className="space-y-5">
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
          <Select name="gradeClass" required>
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
          <FieldLabel htmlFor="student-id">{t("auth.studentId")}</FieldLabel>
          <Input
            id="student-id"
            name="studentId"
            type="text"
            placeholder="e.g. STU-2024-001"
            required
            className="h-11 rounded-xl font-mono tracking-wider"
          />
          <p className="text-xs text-muted-foreground">{t("auth.studentIdHint")}</p>
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

