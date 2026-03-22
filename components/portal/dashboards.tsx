"use client"

import { useState, useEffect } from "react"

import {
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  LogOut,
  Settings,
  TrendingUp,
  Users,
  FileText,
  MessageSquare,
  Bell,
  BarChart3,
  Download,
  CheckCircle,
  PlusCircle,
  InboxIcon,
  ExternalLink,
  Loader2,
  ArrowLeft,
  RefreshCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StudentAIChat } from "@/components/portal/student-ai-chat"
import { ThemeToggle } from "@/components/portal/theme-toggle"
import { LanguageToggle } from "@/components/portal/language-toggle"
import { useI18n } from "@/lib/portal/i18n-context"
import { useAuth, type User } from "@/lib/portal/auth-context"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase"

interface DashboardProps {
  user: User
  onLogout: () => void
  onBackToWebsite?: () => void
}

const EMOJIS = ["👋", "🌟", "🚀", "✨", "🎉", "🔥", "💪", "😎", "🎓", "📚"]

// ─── Stat Card Component ─────────────────────────────────────────────────────
function StatCard({ title, value, icon: Icon, trend, colorClass = "bg-primary/10 text-primary" }: { title: string, value: string, icon: React.ComponentType<{ className?: string }>, trend: string, colorClass?: string }) {
  return (
    <Card className="glass-card border-none shadow-sm overflow-hidden relative group">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("p-2 rounded-xl transition-all duration-300 group-hover:scale-110", colorClass)}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{trend}</p>
        <div className="absolute -bottom-2 -right-2 h-16 w-16 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
      </CardContent>
    </Card>
  )
}

// ─── Empty State Component ───────────────────────────────────────────────────
function EmptyState({ icon: Icon, message, sub }: { icon: React.ComponentType<{ className?: string }>, message: string, sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
      <Icon className="size-10 text-muted-foreground/30" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
      {sub && <p className="text-xs text-muted-foreground/70">{sub}</p>}
    </div>
  )
}

// ─── Past Papers Section (Supabase) ─────────────────────────────────────────
function PastPapersSection({ gradeClass, t }: { gradeClass?: string; t: (k: string) => string }) {
  const [papers, setPapers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!gradeClass) { setIsLoading(false); return }
    supabase
      .from('past_papers')
      .select('*')
      .eq('grade', gradeClass)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setPapers(data || [])
        setIsLoading(false)
      })
  }, [gradeClass])

  const byTerm: Record<string, any[]> = {
    "Term 1": papers.filter(p => p.term === "Term 1"),
    "Term 2": papers.filter(p => p.term === "Term 2"),
    "Term 3": papers.filter(p => p.term === "Term 3"),
    "Other": papers.filter(p => !p.term),
  }
  const activeTabs = Object.entries(byTerm).filter(([, v]) => v.length > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{gradeClass || "Your Grade"} — {t("dashboard.pastPapers")}</span>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!gradeClass ? (
          <EmptyState icon={FileText} message="Grade not set" sub="Update your profile to see your past papers" />
        ) : isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : papers.length === 0 ? (
          <EmptyState
            icon={Download}
            message="No past papers uploaded yet"
            sub="Papers will appear here once the school uploads them for your grade"
          />
        ) : (
          <Tabs defaultValue={activeTabs[0]?.[0] || "Term 1"} className="w-full">
            <TabsList className="w-full mb-4">
              {activeTabs.map(([term]) => (
                <TabsTrigger key={term} value={term} className="flex-1">{term}</TabsTrigger>
              ))}
            </TabsList>
            {activeTabs.map(([term, termPapers]) => (
              <TabsContent key={term} value={term} className="space-y-2">
                {termPapers.map(paper => (
                  <div key={paper.id} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/50 transition-colors">
                    <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{paper.title}</p>
                      <p className="text-xs text-muted-foreground">{paper.subject}{paper.year ? ` · ${paper.year}` : ""}</p>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1.5 shrink-0 rounded-lg"
                      onClick={() => window.open(paper.file_url, '_blank')}>
                      <ExternalLink className="h-3.5 w-3.5" /> Open
                    </Button>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

// ─── My Marks Section (Student) ──────────────────────────────────────────────
function MyMarksSection({ userEmail, t }: { userEmail: string; t: (k: string) => string }) {
  const [marks, setMarks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('marks')
      .select('*')
      .eq('student_email', userEmail.toLowerCase())
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setMarks(data || [])
        setIsLoading(false)
      })
  }, [userEmail])

  const getGrade = (score: number) => {
    if (score >= 90) return { label: 'A+', color: 'text-emerald-600' }
    if (score >= 80) return { label: 'A', color: 'text-emerald-500' }
    if (score >= 70) return { label: 'B', color: 'text-blue-500' }
    if (score >= 60) return { label: 'C', color: 'text-amber-500' }
    if (score >= 50) return { label: 'S', color: 'text-orange-500' }
    return { label: 'F', color: 'text-red-500' }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('dashboard.recentMarks')}</span>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : marks.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            message="No marks recorded yet"
            sub="Your marks will appear here once entered by your teacher"
          />
        ) : (
          <div className="space-y-3">
            {marks.map(mark => {
              const grade = getGrade(mark.score)
              return (
                <div key={mark.id} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/50 transition-colors">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 bg-muted ${grade.color}`}>
                    {grade.label}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{mark.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {mark.term ? `${mark.term} · ` : ''}{new Date(mark.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xl font-bold ${grade.color}`}>{mark.score}</p>
                    <p className="text-xs text-muted-foreground">/ 100</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Submitted Marks Section (Teacher) ───────────────────────────────────────
function SubmittedMarksSection({ teacherEmail, t }: { teacherEmail: string; t: (k: string) => string }) {
  const [marks, setMarks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('marks')
      .select('*')
      .eq('teacher_email', teacherEmail.toLowerCase())
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setMarks(data || [])
        setIsLoading(false)
      })
  }, [teacherEmail])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>{t('dashboard.submittedMarks')}</span>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : marks.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            message="No marks submitted yet"
            sub="Marks you enter for students will appear here"
          />
        ) : (
          <Tabs defaultValue="recent" className="space-y-4">
            <TabsList className="grid grid-cols-4 h-9 w-full max-w-[480px]">
              <TabsTrigger value="recent" className="text-xs">Recent</TabsTrigger>
              <TabsTrigger value="grade" className="text-xs">Grade</TabsTrigger>
              <TabsTrigger value="subject" className="text-xs">Subject</TabsTrigger>
              <TabsTrigger value="term" className="text-xs">Term</TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="space-y-3 pt-1">
              {marks.slice(0, 10).map(mark => (
                <MarkItem key={mark.id} mark={mark} />
              ))}
            </TabsContent>

            <TabsContent value="grade" className="space-y-4 pt-1">
              {[...new Set(marks.map(m => m.grade))].sort().map(grade => (
                <div key={grade} className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">{grade}</h4>
                  {marks.filter(m => m.grade === grade).map(mark => (
                    <MarkItem key={mark.id} mark={mark} showGrade={false} />
                  ))}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="subject" className="space-y-4 pt-1">
              {[...new Set(marks.map(m => m.subject))].sort().map(subj => (
                <div key={subj} className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                    {t(`subjects.${subj}`) || subj}
                  </h4>
                  {marks.filter(m => m.subject === subj).map(mark => (
                    <MarkItem key={mark.id} mark={mark} showSubject={false} />
                  ))}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="term" className="space-y-4 pt-1">
              {["Term 1", "Term 2", "Term 3"].filter(t => marks.some(m => m.term === t)).map(term => (
                <div key={term} className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">{term}</h4>
                  {marks.filter(m => m.term === term).map(mark => (
                    <MarkItem key={mark.id} mark={mark} />
                  ))}
                </div>
              ))}
              {marks.some(m => !m.term) && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Other</h4>
                  {marks.filter(m => !m.term).map(mark => (
                    <MarkItem key={mark.id} mark={mark} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

function MarkItem({ mark, showGrade = true, showSubject = true }: { mark: any, showGrade?: boolean, showSubject?: boolean }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/30 transition-colors">
      <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center font-bold text-primary shrink-0 text-sm">
        {mark.score}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{mark.student_name}</p>
        <p className="text-xs text-muted-foreground">
          {showSubject && mark.subject} {mark.term && `· ${mark.term}`} {showGrade && `· ${mark.grade}`}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-muted-foreground font-medium">
          {new Date(mark.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      </div>
    </div>
  )
}

// ─── Student Dashboard ────────────────────────────────────────────────────────
export function StudentDashboard({ user, onLogout, onBackToWebsite }: DashboardProps) {
  const { t } = useI18n()
  const [emoji, setEmoji] = useState("")

  useEffect(() => {
    setEmoji(EMOJIS[Math.floor(Math.random() * EMOJIS.length)])
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} onLogout={onLogout} onBackToWebsite={onBackToWebsite} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            {t("dashboard.welcomeBack")}, {user.fullName.split(" ")[0]} {emoji}
          </h1>
          <p className="text-muted-foreground">{t("dashboard.studentSubtitle")}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="glass-card border-none shadow-sm overflow-hidden relative group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.enrolledClasses")}</CardTitle>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                <BookOpen className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">--</div>
              <p className="text-xs text-muted-foreground mt-1">{t("dashboard.noDataYet")}</p>
              <div className="absolute -bottom-2 -right-2 h-16 w-16 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
            </CardContent>
          </Card>

          <Card className="glass-card border-none shadow-sm overflow-hidden relative group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.assignmentsDue")}</CardTitle>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                <FileText className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">--</div>
              <p className="text-xs text-muted-foreground mt-1">{t("dashboard.noDataYet")}</p>
              <div className="absolute -bottom-2 -right-2 h-16 w-16 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all" />
            </CardContent>
          </Card>

          <Card className="glass-card border-none shadow-sm overflow-hidden relative group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.averageGrade")}</CardTitle>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                <TrendingUp className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">--</div>
              <p className="text-xs text-muted-foreground mt-1">{t("dashboard.noDataYet")}</p>
              <div className="absolute -bottom-2 -right-2 h-16 w-16 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
            </CardContent>
          </Card>

          <Card className="glass-card border-none shadow-sm overflow-hidden relative group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.attendance")}</CardTitle>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                <Calendar className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">--</div>
              <p className="text-xs text-muted-foreground mt-1">{t("dashboard.noDataYet")}</p>
              <div className="absolute -bottom-2 -right-2 h-16 w-16 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Assignments */}
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.upcomingAssignments")}</CardTitle>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={CheckCircle}
                  message="No upcoming assignments"
                  sub="Your teacher hasn't assigned anything yet"
                />
              </CardContent>
            </Card>

            {/* Past Papers — Supabase powered, grade-filtered */}
            <PastPapersSection gradeClass={user.gradeClass} t={t} />

            {/* My Marks — live from Supabase */}
            <MyMarksSection userEmail={user.email} t={t} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.todaysSchedule")}</CardTitle>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={Clock}
                  message="No schedule available"
                  sub="Your timetable will appear here"
                />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card border-none shadow-sm overflow-hidden group">
              <CardHeader>
                <CardTitle>{t("dashboard.quickActions")}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Button variant="outline" className="justify-start border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-medium h-11 transition-all group overflow-hidden relative">
                  <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-all" />
                  <BarChart3 className="mr-2 size-4 group-hover:scale-110 transition-transform" />
                  {t("dashboard.recentMarks")}
                </Button>
                
                <Button variant="outline" className="justify-start border-rose-200 hover:bg-rose-50 text-rose-700 font-medium h-11 transition-all group overflow-hidden relative">
                  <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/5 transition-all" />
                  <FileText className="mr-2 size-4 group-hover:scale-110 transition-transform" />
                  {t("dashboard.pastPapers")}
                </Button>

                <Button variant="outline" className="justify-start border-orange-200 hover:bg-orange-50 text-orange-700 font-medium h-11 transition-all group overflow-hidden relative">
                  <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/5 transition-all" />
                  <Clock className="mr-2 size-4 group-hover:scale-110 transition-transform" />
                  {t("dashboard.todaysSchedule")}
                </Button>

                <Button variant="outline" className="justify-start border-blue-200 hover:bg-blue-50 text-blue-700 font-medium h-11 transition-all group overflow-hidden relative" asChild>
                  <Link href="/portal?update=profile">
                    <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-all" />
                    <Settings className="mr-2 size-4 group-hover:scale-110 transition-transform" />
                    {t("dashboard.manageSubjects") || "Update My Profile"}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Announcements */}
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.recentAnnouncements")}</CardTitle>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={Bell}
                  message="No announcements yet"
                  sub="School announcements will appear here"
                />
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="mt-12 pt-4 pb-4 px-6 border rounded-2xl bg-white backdrop-blur-sm shadow-sm inline-block mx-auto">
          <p className="text-sm font-bold text-black text-center">
            Designed and developed by <span className="underline underline-offset-4 decoration-black/20">Dilshan Methsara</span>
          </p>
        </div>
      </main>

      {/* AI Assistant */}
      <StudentAIChat user={user} />
    </div>
  )
}

// ─── Enter Marks Dialog (Teacher) ────────────────────────────────────────────
function EnterMarksDialog({ user, t }: { user: any; t: (k: string) => string }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [subject, setSubject] = useState("")
  const [term, setTerm] = useState("")
  const [score, setScore] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const supabase = createClient()

  // Live search students as teacher types
  useEffect(() => {
    if (!query || query.length < 1) { setSuggestions([]); setShowDropdown(false); return }
    setIsSearching(true)
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, email, grade_class')
        .eq('role', 'student')
        .ilike('full_name', `%${query}%`)
        .limit(8)
      setSuggestions(data || [])
      setShowDropdown(true)
      setIsSearching(false)
    }, 150)
    return () => clearTimeout(timer)
  }, [query])

  const selectStudent = (student: any) => {
    setSelectedStudent(student)
    setQuery(student.full_name)
    setShowDropdown(false)
    setSuggestions([])
  }

  const handleSave = async () => {
    if (!selectedStudent || !subject || !score) return
    setIsSaving(true)
    try {
      const { error } = await supabase.from('marks').insert({
        student_email: selectedStudent.email,
        student_name: selectedStudent.full_name,
        grade: selectedStudent.grade_class,
        subject,
        term: term || null,
        score: parseInt(score),
        teacher_email: user.email,
      })
      if (error) throw error
      const { toast } = await import('sonner')
      toast.success(`Marks saved for ${selectedStudent.full_name}!`)
      setOpen(false)
      resetForm()
    } catch (err) {
      const { toast } = await import('sonner')
      toast.error('Failed to save marks')
    } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => {
    setQuery(""); setSelectedStudent(null); setSubject(""); setTerm(""); setScore("")
    setSuggestions([]); setShowDropdown(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="justify-start border-orange-200 hover:bg-orange-50 text-orange-700 font-medium h-11 transition-all group overflow-hidden relative">
          <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/5 transition-all" />
          <GraduationCap className="mr-2 size-4 group-hover:scale-110 transition-transform" />
          {t('dashboard.enterMarks')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{t('dashboard.enterMarks')}</DialogTitle>
          <DialogDescription>Search for a student and enter their marks.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          {/* Student Search */}
          <div className="space-y-2">
            <Label>{t('dashboard.selectStudent')}</Label>
            <div className="relative">
              <Input
                placeholder="Type student name..."
                value={query}
                onChange={e => { setQuery(e.target.value); setSelectedStudent(null) }}
                className="h-11 rounded-xl pr-8"
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              />
              {isSearching && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />}

              {/* Dropdown */}
              {showDropdown && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-popover border rounded-xl shadow-lg overflow-hidden">
                  {suggestions.map(s => (
                    <button
                      key={s.email}
                      type="button"
                      onClick={() => selectStudent(s)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted text-left transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {s.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{s.full_name}</p>
                        <p className="text-xs text-muted-foreground">{s.grade_class} · {s.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showDropdown && suggestions.length === 0 && !isSearching && query.length >= 2 && (
                <div className="absolute z-50 w-full mt-1 bg-popover border rounded-xl shadow-lg p-4 text-center text-sm text-muted-foreground">
                  No students found matching "{query}"
                </div>
              )}
            </div>
            {selectedStudent && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/20">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                  {selectedStudent.full_name.charAt(0)}
                </div>
                <span className="text-sm font-medium">{selectedStudent.full_name}</span>
                <Badge variant="secondary" className="ml-auto">{selectedStudent.grade_class}</Badge>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t('common.subject')}</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {(user.subjectsTaught && user.subjectsTaught.length > 0
                    ? user.subjectsTaught
                    : ['Sinhala','English','Science','Mathematics','Geography','ICT','Agri','Home Science','History','Drama','Music','Buddhism','Test Subject']
                  ).map((s: string) => (
                    <SelectItem key={s} value={s}>{t(`subjects.${s}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Term</Label>
              <Select value={term} onValueChange={setTerm}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  {['Term 1','Term 2','Term 3'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('dashboard.score')} <span className="text-muted-foreground text-xs">(out of 100)</span></Label>
            <Input
              type="number" min="0" max="100"
              placeholder="e.g. 85"
              value={score}
              onChange={e => setScore(e.target.value)}
              className="h-11 rounded-xl text-lg font-bold"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!selectedStudent || !subject || !score || isSaving}>
            {isSaving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : t('dashboard.saveMarks')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Teacher Dashboard ────────────────────────────────────────────────────────
export function TeacherDashboard({ user, onLogout, onBackToWebsite }: DashboardProps) {
  const { t } = useI18n()
  const { updateProfile } = useAuth()
  const [emoji, setEmoji] = useState("")

  useEffect(() => {
    setEmoji(EMOJIS[Math.floor(Math.random() * EMOJIS.length)])
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} onLogout={onLogout} onBackToWebsite={onBackToWebsite} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            {t("dashboard.welcomeBack")}, {user.fullName} {emoji}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <p className="text-muted-foreground mr-2">{t("dashboard.teacherSubtitle")}</p>
            {user.subjectsTaught && Array.isArray(user.subjectsTaught) && user.subjectsTaught.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {user.subjectsTaught.map((subj: string) => (
                  <Badge key={subj} variant="secondary" className="bg-primary/5 text-primary border-primary/20 text-xs px-2 py-0.5 font-medium">
                    {t(`subjects.${subj}`) || subj}
                  </Badge>
                ))}
              </div>
            ) : (
              <Badge variant="destructive" className="animate-pulse">Profile Incomplete - Missing Subjects</Badge>
            )}
          </div>
        </div>

        {/* Nudge for new subjects */}
        {user.subjectsTaught && Array.isArray(user.subjectsTaught) && user.subjectsTaught.length < 13 && (
          <div className="mb-8 p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-700">
              <BookOpen className="size-4" />
              <span className="text-sm font-medium">New subjects are available! Update your profile to add them.</span>
            </div>
            <Button variant="ghost" size="sm" className="text-blue-700 hover:bg-blue-100" asChild>
              <Link href="/portal?update=profile">Manage Subjects</Link>
            </Button>
          </div>
        )}
        {/* Warning for old users if they somehow bypass the screen */}
        {(!user.subjectsTaught || !Array.isArray(user.subjectsTaught) || user.subjectsTaught.length === 0) && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-full text-amber-600">
                <Settings className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900">Action Required: Update Your Profile</h3>
                <p className="text-sm text-amber-700">Please select your subjects to unlock all features.</p>
              </div>
            </div>
            <Button variant="outline" className="bg-white border-amber-200 hover:bg-amber-100" asChild>
              <Link href="/portal?update=profile">Update Now</Link>
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="glass-card border-none shadow-sm overflow-hidden relative group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.activeClasses")}</CardTitle>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                <BookOpen className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">--</div>
              <p className="text-xs text-muted-foreground mt-1">{t("dashboard.noDataYet")}</p>
              <div className="absolute -bottom-2 -right-2 h-16 w-16 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
            </CardContent>
          </Card>

          <Card className="glass-card border-none shadow-sm overflow-hidden relative group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.totalStudents")}</CardTitle>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">--</div>
              <p className="text-xs text-muted-foreground mt-1">{t("dashboard.noDataYet")}</p>
              <div className="absolute -bottom-2 -right-2 h-16 w-16 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all" />
            </CardContent>
          </Card>

          <Card className="glass-card border-none shadow-sm overflow-hidden relative group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.assignments")}</CardTitle>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                <FileText className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">--</div>
              <p className="text-xs text-muted-foreground mt-1">{t("dashboard.noDataYet")}</p>
              <div className="absolute -bottom-2 -right-2 h-16 w-16 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
            </CardContent>
          </Card>

          <Card className="glass-card border-none shadow-sm overflow-hidden relative group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.classAverage")}</CardTitle>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                <BarChart3 className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">--</div>
              <p className="text-xs text-muted-foreground mt-1">{t("dashboard.noDataYet")}</p>
              <div className="absolute -bottom-2 -right-2 h-16 w-16 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Your Classes */}
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.yourClasses")}</CardTitle>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={BookOpen}
                  message="No classes assigned yet"
                  sub="Your classes will appear here once set up"
                />
              </CardContent>
            </Card>

            {/* Assignments to Review */}
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.assignmentsToReview")}</CardTitle>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={InboxIcon}
                  message="No submissions to review"
                  sub="Student homework submissions will appear here"
                />
              </CardContent>
            </Card>

            {/* Submitted Marks Section — Teacher's history */}
            <SubmittedMarksSection teacherEmail={user.email} t={t} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.todaysSchedule")}</CardTitle>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={Clock}
                  message="No schedule available"
                  sub="Your timetable will appear here"
                />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.quickActions")}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="justify-start border-blue-200 hover:bg-blue-50 text-blue-700 font-medium h-11 transition-all group overflow-hidden relative">
                      <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-all" />
                      <PlusCircle className="mr-2 size-4 group-hover:scale-110 transition-transform" />
                      {t("dashboard.createAssignment")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{t("dashboard.createAssignment")}</DialogTitle>
                      <DialogDescription>
                        Assign new homework to a specific grade.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">{t("dashboard.homeworkTitle")}</Label>
                        <Input id="title" placeholder="e.g. Algebra Worksheet" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="grade">{t("common.grade")}</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder={t("common.grade")} />
                          </SelectTrigger>
                          <SelectContent>
                            {["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"].map(g => (
                              <SelectItem key={g} value={g}>{g}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">{t("common.subject")}</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder={t("common.subject")} />
                          </SelectTrigger>
                          <SelectContent>
                            {(user.subjectsTaught && user.subjectsTaught.length > 0
                              ? user.subjectsTaught
                              : ["Sinhala", "English", "Science", "Mathematics", "Geography", "ICT", "Agri", "Home Science", "History", "Drama", "Music", "Buddhism", "Test Subject"]
                            ).map(s => (
                              <SelectItem key={s} value={s}>{t(`subjects.${s}`)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="desc">{t("dashboard.instructions")}</Label>
                        <Textarea id="desc" placeholder="Details about the homework..." />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button">{t("dashboard.assignHomework")}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" className="justify-start border-purple-200 hover:bg-purple-50 text-purple-700 font-medium h-11 transition-all group overflow-hidden relative">
                  <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/5 transition-all" />
                  <MessageSquare className="mr-2 size-4 group-hover:scale-110 transition-transform" />
                  {t("dashboard.sendAnnouncement")}
                </Button>

                <Button variant="outline" className="justify-start border-emerald-200 hover:bg-emerald-50 text-emerald-700 font-medium h-11 transition-all group overflow-hidden relative">
                  <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-all" />
                  <BarChart3 className="mr-2 size-4 group-hover:scale-110 transition-transform" />
                  {t("dashboard.viewReports")}
                </Button>

                <Button variant="outline" className="justify-start border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-medium h-11 transition-all group overflow-hidden relative" asChild>
                  <Link href="/portal?update=profile">
                    <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-all" />
                    <Settings className="mr-2 size-4 group-hover:scale-110 transition-transform" />
                    Manage My Subjects
                  </Link>
                </Button>

                <EnterMarksDialog user={user} t={t} />
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="mt-12 pt-4 pb-4 px-6 border rounded-2xl bg-white backdrop-blur-sm shadow-sm inline-block mx-auto">
          <p className="text-sm font-bold text-black text-center">
            Designed and developed by <span className="underline underline-offset-4 decoration-black/20">Dilshan Methsara</span>
          </p>
        </div>
      </main>
    </div>
  )
}

// ─── Pending Approval ─────────────────────────────────────────────────────────
export function PendingApprovalScreen({ user, onLogout, onBackToWebsite }: DashboardProps) {
  const { t } = useI18n()
  const { refreshStatus } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Auto-refresh status every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshStatus()
    }, 30000)
    return () => clearInterval(interval)
  }, [refreshStatus])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshStatus()
    setIsRefreshing(false)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="size-6" />
            <span className="font-semibold">EduPortal</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onBackToWebsite}>
              <ArrowLeft className="mr-2 size-4" />
              Back to Website
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="mr-2 size-4" />
              {t("common.signOut")}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="size-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
              <Clock className="size-10 text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">{t("auth.pendingTitle")}</h1>
            <p className="text-muted-foreground mb-6">
              {t("auth.pendingDesc")} {user.fullName}.
            </p>
            <div className="rounded-lg border border-border bg-secondary/30 p-4 text-left mb-6">
              <h3 className="font-medium mb-2">{t("auth.pendingNext")}</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="size-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  {t("auth.pendingTeam")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="size-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  {t("auth.pendingEmail")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="size-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  {t("auth.pendingTime")}
                </li>
              </ul>
            </div>

            <Button 
              className="w-full rounded-xl" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCcw className={cn("mr-2 size-4", isRefreshing && "animate-spin")} />
              {isRefreshing ? "Checking..." : "Check Approval Status"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

// ─── Profile Completion (For Old Accounts) ───────────────────────────────────
export function ProfileCompletionScreen({ user, onLogout }: { user: User; onLogout: () => void }) {
  const { t } = useI18n()
  const { updateProfile } = useAuth()
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [isUpdating, setIsUpdating] = useState(false)

  const toggleSubject = (s: string) => {
    setSelectedSubjects(prev => 
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  const handleSave = async () => {
    if (selectedSubjects.length === 0) {
      const { toast } = await import('sonner')
      toast.error("Please select at least one subject.")
      return
    }
    setIsUpdating(true)
    await updateProfile({ subjectsTaught: selectedSubjects })
    setIsUpdating(false)
  }

  const allSubjects = ['Sinhala','English','Science','Mathematics','Geography','ICT','Agri','Home Science','History','Drama','Music','Buddhism']

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="size-6" />
            <span className="font-semibold">EduPortal</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="mr-2 size-4" />
            {t("common.signOut")}
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="size-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
            <p className="text-muted-foreground">
              Welcome back, {user.fullName}! We've added new subject-specific features. Please select the subjects you teach to continue.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {allSubjects.map(s => (
                <button
                  key={s}
                  onClick={() => toggleSubject(s)}
                  className={cn(
                    "px-3 py-2 rounded-xl border text-sm transition-all text-center",
                    selectedSubjects.includes(s) 
                      ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20" 
                      : "bg-background border-border hover:border-primary/50"
                  )}
                >
                  {t(`subjects.${s}`)}
                </button>
              ))}
            </div>
            
            <Button 
              className="w-full h-12 rounded-xl text-lg font-medium"
              onClick={handleSave}
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="mr-2 animate-spin" /> : <CheckCircle className="mr-2" />}
              Save and Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

// ─── Shared Components ────────────────────────────────────────────────────────
function DashboardHeader({ user, onLogout, onBackToWebsite }: { user: User; onLogout: () => void; onBackToWebsite?: () => void }) {
  const { t } = useI18n()
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="size-6" />
          <span className="font-semibold">EduPortal</span>
          <Badge variant="secondary" className="ml-2 capitalize">
            {t(`common.${user.role}`)}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBackToWebsite} className="hidden md:flex">
            <ArrowLeft className="mr-2 size-4" />
            Back to Website
          </Button>
          <LanguageToggle />
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="size-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Settings">
            <Settings className="size-5" />
          </Button>
          <div className="h-8 w-px bg-border" />
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarFallback>
                {user.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-none">{user.fullName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="size-4" />
            <span className="sr-only sm:not-sr-only sm:ml-2">{t("common.signOut")}</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

