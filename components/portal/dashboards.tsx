"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

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
  CheckCircle2,
  ChevronRight,
  PlusCircle,
  Plus,
  InboxIcon,
  ExternalLink,
  Loader2,
  ArrowLeft,
  RefreshCcw,
  Search,
  Trash,
  X,
  Menu,
  Trophy,
  Library,
  Award,
  Activity,
  Zap,
  ShieldCheck,
  Stars,
  Rocket,
  Send,
  ShieldAlert,
  Check,
  Eye,
  EyeOff,
  Lock,
  Microscope,
  Box,
  Sparkles,
  FileUp,
  Wand2
} from "lucide-react"
import { useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PremiumCard, AnimatedContainer, childVariants } from "@/components/portal/premium-card"
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
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { StudentAIChat } from "@/components/portal/student-ai-chat"
import { ProSidebarLayout } from "@/components/portal/sidebar-layout"
import { VirtualLabViewer } from "@/components/portal/virtual-lab-viewer"
import { ThemeToggle } from "@/components/portal/theme-toggle"
import { LanguageToggle } from "@/components/portal/language-toggle"
import { useI18n } from "@/lib/portal/i18n-context"
import { useAuth, type User } from "@/lib/portal/auth-context"
import { cn } from "@/lib/utils"
import { db } from "@/lib/firebase"
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  addDoc, 
  deleteDoc,
  onSnapshot
} from "firebase/firestore"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DashboardProps {
  user: User
  onLogout: () => void
  onBackToWebsite?: () => void
}

const EMOJIS = ["👋", "🌟", "🚀", "✨", "🎉", "🔥", "💪", "😎", "🎓", "📚"]

// ─── Stat Card Component ─────────────────────────────────────────────────────
function StatCard({ title, value, icon: Icon, trend, colorClass = "bg-indigo-50 dark:bg-zinc-800 text-indigo-600", isComingSoon = false }: { title: string, value: string, icon: React.ComponentType<{ className?: string }>, trend: string, colorClass?: string, isComingSoon?: boolean }) {
  return (
    <PremiumCard className="relative group overflow-hidden cursor-default p-6 sm:p-8" variants={childVariants}>
      <div className="flex flex-row items-center justify-between gap-4 mb-6">
        <div className={cn("size-12 rounded-2xl flex items-center justify-center transition-all duration-700 ease-out group-hover:scale-110 group-hover:rotate-6 shadow-sm", colorClass)}>
          <Icon className="size-6" />
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">{title}</p>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white leading-none">
            {isComingSoon ? <span className="text-[10px] bg-indigo-600/10 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-tighter">Coming Soon</span> : value}
          </div>
        </div>
      </div>
      
      <div className={cn("flex items-center gap-2 transition-opacity", isComingSoon && "opacity-20 grayscale")}>
        <div className="h-[2px] w-8 bg-indigo-500 rounded-full" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600/70">{trend}</span>
      </div>
      
      {/* Precision Background Blur */}
      <div className={cn(
        "absolute -bottom-8 -right-8 h-32 w-32 rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity duration-1000",
        colorClass.includes("indigo") || colorClass.includes("primary") ? "bg-indigo-500" : 
        colorClass.includes("purple") ? "bg-purple-500" : 
        colorClass.includes("amber") ? "bg-amber-500" : "bg-emerald-500"
      )} />
    </PremiumCard>
  )
}

// ─── Empty State Component ───────────────────────────────────────────────────
function EmptyState({ icon: Icon, message, sub }: { icon: any; message: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-zinc-50/10 dark:bg-zinc-800/5 rounded-[3rem] border border-dashed border-zinc-100 dark:border-zinc-800/50">
      <div className="size-20 rounded-[2rem] bg-white dark:bg-zinc-800 flex items-center justify-center mb-8 shadow-sm">
        <Icon className="size-8 text-zinc-300 dark:text-zinc-600" />
      </div>
      <h3 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white uppercase mb-2">{message}</h3>
      {sub && (
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/40 max-w-[240px] leading-relaxed">
          {sub}
        </p>
      )}
    </div>
  )
}

// ─── Submission Dialog (Student) ───────────────────────────────────────────
function SubmissionDialog({ assignment, user, t }: { assignment: any; user: User; t: (k: string) => string }) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingSubmission, setExistingSubmission] = useState<any>(null)

  useEffect(() => {
    if (open) {
      const submissionsRef = collection(db, 'assignment_submissions')
      const q = query(
        submissionsRef, 
        where('assignment_id', '==', assignment.id), 
        where('student_email', '==', user.email.toLowerCase())
      )
      getDocs(q).then((querySnapshot) => {
        if (!querySnapshot.empty) {
          const d = querySnapshot.docs[0]
          setExistingSubmission({ id: d.id, ...d.data() })
          setContent(d.data().content || "")
        }
      })
    }
  }, [open, assignment.id, user.email])

  const handleSubmit = async () => {
    if (!content.trim()) return
    setIsSubmitting(true)
    try {
      const payload: any = {
        assignment_id: assignment.id,
        student_email: user.email.toLowerCase(),
        student_name: user.fullName,
        content: content,
        status: 'submitted',
        updated_at: new Date().toISOString(),
      }

      if (!existingSubmission) {
        payload.created_at = new Date().toISOString()
      }

      if (existingSubmission) {
        const docRef = doc(db, 'assignment_submissions', existingSubmission.id)
        await updateDoc(docRef, payload)
      } else {
        await addDoc(collection(db, 'assignment_submissions'), payload)
      }
      const { toast } = await import('sonner')
      toast.success("Assignment submitted successfully!")
      setOpen(false)
    } catch (err) {
      const { toast } = await import('sonner')
      toast.error("Failed to submit assignment")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={existingSubmission ? "outline" : "ghost"} className={cn(
          "rounded-xl font-black text-[10px] uppercase tracking-widest transition-all px-4 h-9",
          existingSubmission 
            ? "text-emerald-600 border-emerald-100 hover:bg-emerald-50 dark:hover:bg-emerald-500/10" 
            : "text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/5"
        )}>
          {existingSubmission ? "View Work" : "Begin task"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] border-none shadow-aura bg-white dark:bg-zinc-900 p-8">
        <DialogHeader className="mb-8">
          <DialogTitle className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white mb-2">{assignment.title}</DialogTitle>
          <div className="flex items-center gap-3">
             <Badge className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 border-none px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
               {assignment.subject}
             </Badge>
             <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50 flex items-center gap-1.5">
               <Clock className="size-3" /> Due {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No date'}
             </span>
          </div>
        </DialogHeader>
        <div className="space-y-8">
          <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white mb-4">Task Instructions</p>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed whitespace-pre-wrap">{assignment.description || "No specific instructions provided for this task."}</p>
          </div>
          <div className="space-y-4">
            <Label htmlFor="submission" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white px-1">Your response</Label>
            <Textarea
              id="submission"
              placeholder="Paste relevant links or type your response here..."
              className="min-h-[200px] rounded-[1.5rem] bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-100 dark:border-zinc-800 focus:ring-indigo-600 p-6 text-sm font-medium"
              value={content}
              onChange={e => setContent(e.target.value)}
              disabled={existingSubmission?.status === 'graded'}
            />
          </div>
          {existingSubmission?.status === 'graded' && (
            <div className="bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 p-6 rounded-[1.5rem] space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Academic Feedback</p>
                <p className="text-xl font-black text-emerald-600">{existingSubmission.score} <span className="text-xs opacity-50">/ 100</span></p>
              </div>
              <p className="text-sm font-medium text-emerald-700 leading-relaxed italic opacity-80">"{existingSubmission.feedback}"</p>
            </div>
          )}
        </div>
        <DialogFooter className="mt-10 gap-2">
          <Button variant="ghost" className="rounded-xl font-bold text-xs uppercase tracking-widest text-muted-foreground" onClick={() => setOpen(false)}>Dismiss</Button>
          {existingSubmission?.status !== 'graded' && (
            <Button onClick={handleSubmit} className="rounded-xl px-8 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20" disabled={isSubmitting || !content.trim()}>
              {isSubmitting ? <Loader2 className="animate-spin mr-3 size-4" /> : null}
              {existingSubmission ? "Sync Changes" : "Submit Progress"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Teacher Assignments Review ───────────────────────────────────────────
function TeacherAssignmentsReview({ user, t }: { user: User; t: (k: string) => string }) {
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadAssignments = async () => {
    setLoading(true)
    try {
      const assignmentsRef = collection(db, 'assignments')
      const q = query(
        assignmentsRef, 
        where('teacher_email', '==', user.email.toLowerCase()),
        orderBy('created_at', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setAssignments(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAssignments() }, [user.email])

  const handleDeleteAssignment = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this assignment? Students will no longer be able to see it.")) return
    
    try {
      const { toast } = await import('sonner')
      await deleteDoc(doc(db, 'assignments', id))
      setAssignments(prev => prev.filter(a => a.id !== id))
      toast.success("Assignment deleted permanently.")
    } catch (err) {
      console.error("Delete error:", err)
    }
  }

  return (
    <PremiumCard className="p-0 border-none overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-black tracking-tight text-zinc-900 dark:text-white uppercase flex items-center gap-3">
          <FileText className="size-5 text-indigo-600" /> Current Assignments
        </h3>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />}
      </div>
      <div className="p-6 sm:p-8">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
        ) : assignments.length === 0 ? (
          <EmptyState icon={InboxIcon} message="All clear" sub="No assignments have been created yet." />
        ) : (
          <div className="space-y-4">
            {assignments.map(a => (
              <TeacherAssignmentItem key={a.id} assignment={a} t={t} onDelete={() => setAssignments(prev => prev.filter(item => item.id !== a.id))} />
            ))}
          </div>
        )}
      </div>
    </PremiumCard>
  )
}

function TeacherAssignmentItem({ assignment, t, onDelete }: { assignment: any; t: (k: string) => string; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const loadSubmissions = async () => {
    setLoading(true)
    try {
      const submissionsRef = collection(db, 'assignment_submissions')
      const q = query(
        submissionsRef, 
        where('assignment_id', '==', assignment.id)
      )
      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }))
      
      // Sort in-memory to avoid needing to create composite indexes for 'assignment_id' + 'updated_at'
      data.sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at || 0).getTime()
        const dateB = new Date(b.updated_at || b.created_at || 0).getTime()
        return dateB - dateA
      })

      setSubmissions(data)
    } catch (err: any) {
      console.error("Error loading submissions:", err)
      const { toast } = await import('sonner')
      toast.error(`Failed to load submissions: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) loadSubmissions() }}>
      <DialogTrigger asChild>
        <div className="group flex items-center justify-between p-4 sm:p-5 rounded-3xl border border-zinc-50 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-2xl hover:shadow-zinc-200/50 dark:hover:shadow-black/20 transition-all duration-500 cursor-pointer">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="size-12 sm:size-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <FileText className="size-6 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base text-zinc-900 dark:text-white truncate tracking-tight">{assignment.title}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mt-1.5 opacity-60">
                {assignment.grade} • {assignment.subject}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-10 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              onClick={(e) => { e.stopPropagation(); if(confirm("Delete this assignment?")) { deleteDoc(doc(db, 'assignments', assignment.id)); onDelete(); } }}
            >
              <Trash className="size-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="rounded-xl h-9 px-4 font-black text-[10px] uppercase tracking-widest text-indigo-600 border-indigo-100 dark:border-indigo-500/20 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
            >
              Review Work
            </Button>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[800px] max-h-[90vh] flex flex-col rounded-[2rem] sm:rounded-[2.5rem] border-none shadow-aura bg-white dark:bg-zinc-900 p-6 sm:p-8">
        <DialogHeader className="mb-8">
          <DialogTitle className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white mb-2">Review Submissions</DialogTitle>
          <div className="flex items-center gap-3">
             <Badge className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-none px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
               {assignment.title}
             </Badge>
             <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50 opacity-60">
               {assignment.grade} • {assignment.subject}
             </span>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-2 space-y-6 pr-2 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-indigo-600" /></div>
          ) : submissions.length === 0 ? (
            <EmptyState icon={InboxIcon} message="Silence" sub="No student has submitted work for this task yet." />
          ) : (
            submissions.map(s => (
              <div key={s.id} className="p-8 rounded-[2rem] border border-zinc-50 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/20 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-2xl bg-white dark:bg-zinc-700 flex items-center justify-center shadow-sm">
                       <p className="text-[10px] font-black">{s.student_name[0]}</p>
                    </div>
                    <div>
                      <p className="font-black text-sm text-zinc-900 dark:text-white tracking-tight">{s.student_name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">{s.student_email}</p>
                    </div>
                  </div>
                  <Badge className={cn(
                    "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-none",
                    s.status === 'graded' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600" : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600"
                  )}>
                    {s.status === 'graded' ? `ACADEMIC SCORE: ${s.score}/100` : 'WAITING FOR REVIEW'}
                  </Badge>
                </div>
                <div className="bg-white dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-50 dark:border-zinc-800 text-sm font-medium text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {s.content}
                </div>
                <GradingForm submission={s} onUpdate={loadSubmissions} assignmentTitle={assignment.title} />
              </div>
            ))
          )}
        </div>
        <DialogFooter className="mt-8">
           <Button variant="ghost" className="w-full rounded-xl font-black text-[10px] uppercase tracking-widest text-muted-foreground" onClick={() => setOpen(false)}>Close Review</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function GradingForm({ submission, onUpdate, assignmentTitle }: { submission: any; onUpdate: () => void; assignmentTitle?: string }) {
  const [score, setScore] = useState(submission.score?.toString() || "")
  const [feedback, setFeedback] = useState(submission.feedback || "")
  const [isSaving, setIsSaving] = useState(false)
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const docRef = doc(db, 'assignment_submissions', submission.id)
      await updateDoc(docRef, {
        score: parseInt(score),
        feedback,
        status: 'graded',
        updated_at: new Date().toISOString()
      })

      // Create notification for student
      await addDoc(collection(db, 'notifications'), {
        user_email: submission.student_email.toLowerCase(),
        title: "Academic Grade Released",
        content: `Your submission for "${assignmentTitle || 'Assignment'}" has been reviewed and graded. Score: ${score}/100`,
        type: 'quiz',
        is_read: false,
        created_at: new Date().toISOString()
      })
      
      const { toast } = await import('sonner')
      toast.success("Grade saved!")
      onUpdate()
    } catch (err) {
      console.error("Error saving grade:", err)
      const { toast } = await import('sonner')
      toast.error("Failed to save grade")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-800">
      <div className="sm:col-span-1 space-y-2">
        <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/60 px-1">Score</Label>
        <Input 
          type="number" 
          placeholder="0-100" 
          value={score} 
          onChange={e => setScore(e.target.value)}
          className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none font-black text-center"
        />
      </div>
      <div className="sm:col-span-2 space-y-2">
        <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/60 px-1">Feedback</Label>
        <Input 
          placeholder="Excellent progress..." 
          value={feedback} 
          onChange={e => setFeedback(e.target.value)}
          className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-4 font-bold text-sm"
        />
      </div>
      <div className="flex items-end">
        <Button onClick={handleSave} className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20" disabled={isSaving || !score}>
          {isSaving ? <Loader2 className="animate-spin size-4" /> : "Award Marks"}
        </Button>
      </div>
    </div>
  )
}


// ─── Past Papers Section (Supabase) ─────────────────────────────────────────
function PastPapersSection({ gradeClass, t }: { gradeClass?: string; t: (k: string) => string }) {
  const [papers, setPapers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { language } = useI18n()
  useEffect(() => {
    if (!gradeClass) { setIsLoading(false); return }
    const papersRef = collection(db, 'past_papers')
    const q = query(
      papersRef, 
      where('grade', '==', gradeClass),
      orderBy('created_at', 'desc')
    )
    getDocs(q).then((querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setPapers(data)
      setIsLoading(false)
    }).catch(err => {
      console.error("Error fetching papers:", err)
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
    <PremiumCard className="p-0 border-none overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
          {gradeClass || "Your Grade"} — {t("dashboard.pastPapers")}
        </h3>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />}
      </div>
      <div className="p-6 sm:p-8">
        {!gradeClass ? (
          <EmptyState icon={FileText} message="Grade not set" sub="Update your profile to see your past papers" />
        ) : isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
        ) : papers.length === 0 ? (
          <EmptyState
            icon={Download}
            message="No past papers uploaded yet"
            sub="Papers will appear here once the school uploads them for your grade"
          />
        ) : (
          <Tabs defaultValue={activeTabs[0]?.[0] || "Term 1"} className="w-full">
            <TabsList className="w-full mb-8 flex overflow-x-auto justify-start border-b border-zinc-100 dark:border-zinc-800 bg-transparent rounded-none h-12 p-0">
              {activeTabs.map(([term]) => (
                <TabsTrigger 
                  key={term} 
                  value={term} 
                  className="px-8 font-bold text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none transition-all"
                >
                  {term}
                </TabsTrigger>
              ))}
            </TabsList>
            {activeTabs.map(([term, termPapers]) => (
              <TabsContent key={term} value={term} className="space-y-3 mt-0">
                {termPapers.map(paper => (
                  <div key={paper.id} className="group flex items-center gap-4 p-4 rounded-2xl border border-zinc-50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-800/30 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-black/20 transition-all duration-500">
                    <div className="size-12 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <FileText className="size-6 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-zinc-900 dark:text-white truncate">{paper.title}</p>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">{paper.subject}{paper.year ? ` · ${paper.year}` : ""}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="gap-2 px-4 rounded-full font-bold text-[10px] uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
                      onClick={() => window.open(paper.file_url, '_blank')}
                    >
                      <ExternalLink className="size-3.5" /> 
                      {language === 'en' ? 'Open' : 'විවෘත කරන්න'}
                    </Button>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </PremiumCard>
  )
}

// ─── My Marks Section (Student) ──────────────────────────────────────────────
function MyMarksSection({ user, t }: { user: any; t: (k: string) => string }) {
  const [marks, setMarks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    if (!user?.studentId) {
      setIsLoading(false)
      return
    }
    const marksRef = collection(db, 'marks')
    const q = query(
      marksRef, 
      where('student_id', '==', user.studentId),
      orderBy('created_at', 'desc')
    )
    getDocs(q).then((querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setMarks(data)
      setIsLoading(false)
    }).catch(err => {
      console.error("Error fetching marks:", err)
      setIsLoading(false)
    })
  }, [user?.studentId])

  const getGrade = (score: number) => {
    if (score >= 90) return { label: 'A+', color: 'text-emerald-600' }
    if (score >= 80) return { label: 'A', color: 'text-emerald-500' }
    if (score >= 70) return { label: 'B', color: 'text-blue-500' }
    if (score >= 60) return { label: 'C', color: 'text-amber-500' }
    if (score >= 50) return { label: 'S', color: 'text-orange-500' }
    return { label: 'F', color: 'text-red-500' }
  }

  return (
    <PremiumCard className="p-0 border-none overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
          {t('dashboard.recentMarks')}
        </h3>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />}
      </div>
      <div className="p-6 sm:p-8">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
        ) : marks.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            message="No marks recorded yet"
            sub="Your marks will appear here once entered by your teacher"
          />
        ) : (
          <div className="space-y-4">
            {marks.map(mark => {
              const grade = getGrade(mark.score)
              return (
                <div key={mark.id} className="group flex items-center gap-5 p-4 rounded-2xl border border-zinc-50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-800/30 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-black/20 transition-all duration-500">
                  <div className={cn(
                    "size-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 transition-transform group-hover:scale-110 shadow-sm",
                    "bg-white dark:bg-zinc-700",
                    grade.color
                  )}>
                    {grade.label}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base text-zinc-900 dark:text-white">{mark.subject}</p>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 mt-1">
                      {mark.term ? `${mark.term} · ` : ''}{new Date(mark.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn("text-3xl font-black tracking-tight", grade.color)}>{mark.score}</p>
                    <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">/ 100</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PremiumCard>
  )
}

// ─── Submitted Marks Section (Teacher) ───────────────────────────────────────
function SubmittedMarksSection({ teacherEmail, t }: { teacherEmail: string; t: (k: string) => string }) {
  const [marks, setMarks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!teacherEmail) {
      setIsLoading(false)
      return
    }

    const marksRef = collection(db, 'marks')
    const q = query(
      marksRef, 
      where('teacher_email', '==', teacherEmail.toLowerCase().trim()),
      orderBy('created_at', 'desc')
    )
    getDocs(q).then((querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setMarks(data)
      setIsLoading(false)
    }).catch(err => {
      console.error("Error fetching marks:", err)
      setIsLoading(false)
    })
  }, [teacherEmail])

  return (
    <PremiumCard className="p-0 border-none overflow-hidden">
      <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white uppercase flex items-center gap-3">
          <BarChart3 className="size-5 text-indigo-600" /> {t('dashboard.submittedMarks')}
        </h3>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />}
      </div>
      <div className="p-8">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
        ) : marks.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            message="No records found"
            sub="Marks you enter for students will appear here in your ledger."
          />
        ) : (
          <Tabs defaultValue="recent" className="space-y-8">
            <TabsList className="w-full flex overflow-x-auto justify-start border-b border-zinc-100 dark:border-zinc-800 bg-transparent rounded-none h-12 p-0">
               <TabsTrigger value="recent" className="px-6 font-bold text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none transition-all">Recent</TabsTrigger>
               <TabsTrigger value="grade" className="px-6 font-bold text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none transition-all">Grade</TabsTrigger>
               <TabsTrigger value="subject" className="px-6 font-bold text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none transition-all">Subject</TabsTrigger>
               <TabsTrigger value="term" className="px-6 font-bold text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none transition-all">Term</TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="space-y-4 mt-0">
              {marks.slice(0, 10).map(mark => (
                <MarkItem key={mark.id} mark={mark} />
              ))}
            </TabsContent>

            <TabsContent value="grade" className="space-y-8 mt-0">
              {[...new Set(marks.map(m => m.grade))].sort().map(grade => (
                <div key={grade} className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 px-1">{grade}</h4>
                  <div className="space-y-3">
                    {marks.filter(m => m.grade === grade).map(mark => (
                      <MarkItem key={mark.id} mark={mark} showGrade={false} />
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="subject" className="space-y-8 mt-0">
              {[...new Set(marks.map(m => m.subject))].sort().map(subj => (
                <div key={subj} className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 px-1">
                    {t(`subjects.${subj}`) || subj}
                  </h4>
                  <div className="space-y-3">
                    {marks.filter(m => m.subject === subj).map(mark => (
                      <MarkItem key={mark.id} mark={mark} showSubject={false} />
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="term" className="space-y-8 mt-0">
              {["Term 1", "Term 2", "Term 3"].filter(term => marks.some(m => m.term === term)).map(term => (
                <div key={term} className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 px-1">{term}</h4>
                  <div className="space-y-3">
                    {marks.filter(m => m.term === term).map(mark => (
                      <MarkItem key={mark.id} mark={mark} />
                    ))}
                  </div>
                </div>
              ))}
              {marks.some(m => !m.term) && (
                <div key="other" className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 px-1">Other</h4>
                  <div className="space-y-3">
                    {marks.filter(m => !m.term).map(mark => (
                      <MarkItem key={mark.id} mark={mark} />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PremiumCard>
  )
}

function MarkItem({ mark, showGrade = true, showSubject = true }: { mark: any, showGrade?: boolean, showSubject?: boolean }) {
  return (
    <div className="group flex items-center justify-between p-4 rounded-[1.5rem] border border-zinc-50 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-black/20 transition-all duration-500">
      <div className="flex items-center gap-4">
        <div className="size-12 rounded-xl bg-white dark:bg-zinc-700 flex items-center justify-center font-black text-indigo-600 shadow-sm border border-zinc-100 dark:border-zinc-800 group-hover:scale-110 transition-transform">
          {mark.score}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-zinc-900 dark:text-white truncate tracking-tight">{mark.student_name}</p>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1 opacity-60">
            {showSubject && mark.subject} {mark.term && `· ${mark.term}`} {showGrade && `· ${mark.grade}`}
          </p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
          {new Date(mark.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      </div>
    </div>
  )
}

// ─── Quiz Module (Interactive MCQ) ──────────────────────────────────────────
function QuizCreator({ user, t, onQuizCreated }: { user: User; t: (k: string) => string; onQuizCreated?: () => void }) {
  const { language: portalLang } = useI18n()
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [grade, setGrade] = useState("")
  const [subject, setSubject] = useState("")
  const [editorLang, setEditorLang] = useState<"en" | "si">("en")
  const [questions, setQuestions] = useState<any[]>([{
    question_text: "", question_text_si: "",
    options: ["", "", "", ""], options_si: ["", "", "", ""],
    correct_option_index: 0, points: 1
  }])

  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiFile, setAiFile] = useState<File | null>(null)
  const [numAiQuestions, setNumAiQuestions] = useState(10)
  const [showAiPanel, setShowAiPanel] = useState(false)

  const handleAIGenerate = async () => {
    if (!aiFile) {
      const { toast } = await import('sonner')
      toast.error("Please upload a PDF first.")
      return
    }
    
    setIsGeneratingAI(true)
    try {
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string
          resolve(result.split(',')[1])
        }
        reader.onerror = reject
        reader.readAsDataURL(aiFile)
      })
      
      const pdfBase64 = await base64Promise
      
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64,
          numQuestions: numAiQuestions,
          subject,
          grade,
          language: editorLang
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "AI Synthesis failed")
      }
      
      // Map the AI results to our question structure.
      // We always populate question_text and options as the primary/fallback fields,
      // and also populate the _si fields if the user requested Sinhala.
      const mappedQuestions = data.questions.map((q: any) => ({
        question_text: q.question_text || "(Empty Question)",
        question_text_si: editorLang === "si" ? (q.question_text || "(Empty Question)") : "",
        options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ["(None)", "(None)", "(None)", "(None)"],
        options_si: editorLang === "si" ? (Array.isArray(q.options) && q.options.length === 4 ? q.options : ["(None)", "(None)", "(None)", "(None)"]) : ["", "", "", ""],
        correct_option_index: q.correct_option_index,
        points: q.points || 1
      }))

      setQuestions(mappedQuestions)
      setShowAiPanel(false)
      setAiFile(null)
      
      const { toast } = await import('sonner')
      toast.success(`Generated ${data.questions.length} questions from context.`)
    } catch (err: any) {
      console.error(err)
      const { toast } = await import('sonner')
      toast.error(err.message || "Failed to process lesson context")
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const addQuestion = () => setQuestions([...questions, {
    question_text: "", question_text_si: "",
    options: ["", "", "", ""], options_si: ["", "", "", ""],
    correct_option_index: 0, points: 1
  }])
  const removeQuestion = (idx: number) => setQuestions(questions.filter((_, i) => i !== idx))

  const updateQuestion = (idx: number, field: string, value: any) => {
    const newQuestions = [...questions]
    newQuestions[idx] = { ...newQuestions[idx], [field]: value }
    setQuestions(newQuestions)
  }

  const updateOption = (qIdx: number, oIdx: number, value: string, lang: "en" | "si") => {
    const newQuestions = [...questions]
    if (lang === "si") {
      const newOpts = [...newQuestions[qIdx].options_si]
      newOpts[oIdx] = value
      newQuestions[qIdx] = { ...newQuestions[qIdx], options_si: newOpts }
    } else {
      const newOpts = [...newQuestions[qIdx].options]
      newOpts[oIdx] = value
      newQuestions[qIdx] = { ...newQuestions[qIdx], options: newOpts }
    }
    setQuestions(newQuestions)
  }

  const handleCreate = async () => {
    const questionsValid = questions.every(q => {
      const hasEn = q.question_text?.trim() && q.options.every(o => o.trim())
      const hasSi = q.question_text_si?.trim() && q.options_si.every(o => o.trim())
      return hasEn || hasSi
    })

    if (!title || !grade || !subject || !questionsValid) {
      const { toast } = await import('sonner')
      toast.error("Validation Failed: Ensure Title, Grade, Subject are set, and every question is complete in at least one language.")
      return
    }

    setIsSaving(true)
    try {
      const quizRef = await addDoc(collection(db, 'quizzes'), {
        title,
        description,
        grade,
        subject,
        teacher_email: user.email.toLowerCase(),
        has_sinhala: questions.some(q => q.question_text_si?.trim()),
        created_at: new Date().toISOString()
      })

      const questionsRef = collection(db, 'quizzes', quizRef.id, 'questions')
      for (const q of questions) {
        await addDoc(questionsRef, q)
      }

      const { toast } = await import('sonner')
      toast.success("Academic assessment published.")
      setOpen(false)
      setTitle(""); setDescription(""); setEditorLang("en")
      setQuestions([{ question_text: "", question_text_si: "", options: ["", "", "", ""], options_si: ["", "", "", ""], correct_option_index: 0, points: 1 }])
      if (onQuizCreated) onQuizCreated()
    } catch (err) {
      console.error("Error creating quiz:", err)
      const { toast } = await import('sonner')
      toast.error("Failed to publish quiz.")
    } finally {
      setIsSaving(false)
    }
  }

  const grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "Grade 13"]
  const subjects = ['Sinhala', 'English', 'Science', 'Mathematics', 'Geography', 'ICT', 'Agri', 'Home Science', 'History', 'Drama', 'Music', 'Civic Education', 'Buddhism']

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2">
          <PlusCircle className="size-4" /> {t('dashboard.quiz.builder')}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[800px] max-h-[90vh] flex flex-col rounded-[1.5rem] sm:rounded-[2.5rem] border-none shadow-aura bg-white dark:bg-zinc-900 p-5 sm:p-8">
        <DialogHeader className="mb-8">
          <DialogTitle className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white mb-2">{t('dashboard.quiz.builder')}</DialogTitle>
          <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Configure assessment settings and define bilingual MCQ patterns.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-0 sm:pr-4 space-y-8 sm:space-y-10 py-4 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white px-1">Internal Title</Label>
              <Input placeholder="Ex. Unit 4: Vector Analysis" value={title} onChange={e => setTitle(e.target.value)} className="h-14 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 px-6 font-bold text-sm" />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white px-1">Academic Department</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="h-14 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 px-6 font-bold text-sm"><SelectValue placeholder="Department..." /></SelectTrigger>
                <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-aura">{subjects.map(s => <SelectItem key={s} value={s} className="rounded-xl font-bold py-2.5">{t(`subjects.${s}`)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white px-1">Target Grade</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger className="h-14 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 px-6 font-bold text-sm"><SelectValue placeholder="Student Grade..." /></SelectTrigger>
                <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-aura">{grades.map(g => <SelectItem key={g} value={g} className="rounded-xl font-bold py-2.5">{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white px-1">Context / Instructions</Label>
              <Input placeholder="Ex. Open book allowed, 20 mins strict." value={description} onChange={e => setDescription(e.target.value)} className="h-14 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 px-6 font-bold text-sm" />
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 gap-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600">Defined Question Chain</h3>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Bilingual Editor Language Toggle */}
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setEditorLang("en")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                      editorLang === "en" ? "bg-white dark:bg-zinc-700 text-indigo-600 shadow-sm" : "text-muted-foreground"
                    )}
                  >🇬🇧 EN</button>
                  <button
                    type="button"
                    onClick={() => setEditorLang("si")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                      editorLang === "si" ? "bg-white dark:bg-zinc-700 text-amber-600 shadow-sm" : "text-muted-foreground"
                    )}
                  >🇱🇰 සිං</button>
                </div>
                <Button size="sm" variant="outline" onClick={addQuestion} className="rounded-xl h-9 px-4 font-black text-[9px] uppercase tracking-widest text-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/5 border-none"><PlusCircle className="size-3.5 mr-2" /> Append Pattern</Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowAiPanel(!showAiPanel)} 
                  className={cn(
                    "rounded-xl h-9 px-4 font-black text-[9px] uppercase tracking-widest border-none transition-all",
                    showAiPanel ? "bg-indigo-600 text-white shadow-lg" : "bg-emerald-50/50 dark:bg-emerald-500/5 text-emerald-600"
                  )}
                >
                  <Sparkles className="size-3.5 mr-2" /> Generate with AI
                </Button>
              </div>
            </div>

            {/* AI Generation Panel */}
            <AnimatePresence>
              {showAiPanel && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-500/5 space-y-6 sm:space-y-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                          <Wand2 className="size-4" /> AI Question Synthesis
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-medium mt-1">Upload a lesson PDF to automatically generate assessment items.</p>
                      </div>
                      <Badge className="bg-emerald-600 text-white border-none px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                        Gemini 2.5 Flash
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white px-1">Lesson Context (PDF)</Label>
                        <div 
                          className={cn(
                            "relative aspect-video rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 cursor-pointer group",
                            aiFile ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10" : "border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 hover:bg-emerald-50/30"
                          )}
                          onClick={() => document.getElementById('ai-pdf-upload')?.click()}
                        >
                          <input 
                            id="ai-pdf-upload" 
                            type="file" 
                            accept="application/pdf" 
                            className="hidden" 
                            onChange={(e) => setAiFile(e.target.files?.[0] || null)}
                          />
                          {aiFile ? (
                            <>
                              <div className="size-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white">
                                <FileText className="size-6" />
                              </div>
                              <div className="text-center px-6">
                                <p className="text-sm font-bold text-emerald-600 truncate max-w-[200px]">{aiFile.name}</p>
                                <p className="text-[10px] text-muted-foreground font-medium">Click to replace file</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="size-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <FileUp className="size-6" />
                              </div>
                              <div className="text-center px-6">
                                <p className="text-sm font-bold text-zinc-900 dark:text-white">Upload Lesson Materials</p>
                                <p className="text-[10px] text-muted-foreground font-medium">Drag & drop or click to select PDF</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center px-1">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white">Question Count</Label>
                            <span className="text-xs font-black text-emerald-600">{numAiQuestions} Items</span>
                          </div>
                          <Slider 
                            value={[numAiQuestions]} 
                            min={5} 
                            max={20} 
                            step={1} 
                            onValueChange={(v) => setNumAiQuestions(v[0])}
                            className="py-4"
                          />
                          <div className="flex justify-between text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest">
                            <span>5 Questions</span>
                            <span>20 Questions</span>
                          </div>
                        </div>

                        <div className="pt-2">
                          <Button 
                            className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 transition-all gap-3"
                            disabled={!aiFile || isGeneratingAI}
                            onClick={handleAIGenerate}
                          >
                            {isGeneratingAI ? (
                              <>
                                <Loader2 className="size-4 animate-spin" />
                                Processing Model...
                              </>
                            ) : (
                              <>
                                <Rocket className="size-4" />
                                Execute AI Generation
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Language context hint */}
            <div className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest",
              editorLang === "si"
                ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20"
                : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20"
            )}>
              <span>{editorLang === "si" ? "🇱🇰" : "🇬🇧"}</span>
              <span>{editorLang === "si" ? "Entering Sinhala (සිංහල) — English fields are saved separately" : "Entering English — toggle above to also add Sinhala translation"}</span>
            </div>

            <div className="space-y-8">
              {questions.map((q, qIdx) => (
                <div key={qIdx} className="p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-zinc-50 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/20 space-y-5 sm:space-y-6 relative group/card">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white px-1">Question {qIdx + 1}</Label>
                        {q.question_text_si?.trim() && (
                          <span className="text-[8px] font-black uppercase tracking-widest bg-amber-50 dark:bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-500/20">
                            🇱🇰 {t('dashboard.quiz.sinhalaReady')} ✓
                          </span>
                        )}
                      </div>
                      <Textarea
                        placeholder={editorLang === "si" ? "ප්‍රශ්නය සිංහලෙන් ලියන්න..." : "Define the problem statement..."}
                        value={editorLang === "si" ? (q.question_text_si || "") : q.question_text}
                        onChange={e => updateQuestion(qIdx, editorLang === "si" ? 'question_text_si' : 'question_text', e.target.value)}
                        className="min-h-[100px] rounded-2xl bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-800 p-4 font-medium text-sm"
                      />
                    </div>
                    {questions.length > 1 && (
                      <Button size="icon" variant="ghost" className="size-10 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover/card:opacity-100 transition-all" onClick={() => removeQuestion(qIdx)}><Trash className="size-4" /></Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {(editorLang === "si" ? q.options_si : q.options).map((opt: string, oIdx: number) => (
                      <div key={oIdx} className="relative flex items-center gap-3 bg-white dark:bg-zinc-800 p-2 pl-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                        <input
                          type="radio"
                          name={`correct-${qIdx}`}
                          checked={q.correct_option_index === oIdx}
                          onChange={() => updateQuestion(qIdx, 'correct_option_index', oIdx)}
                          className="size-4 accent-indigo-600 cursor-pointer"
                        />
                        <Input
                          placeholder={editorLang === "si" ? `විකල්පය ${oIdx + 1}` : `Option ${oIdx + 1}`}
                          value={opt}
                          onChange={e => updateOption(qIdx, oIdx, e.target.value, editorLang)}
                          className="h-10 border-none px-0 font-medium text-sm focus:ring-0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="mt-8 gap-3">
          <Button variant="ghost" className="rounded-xl font-black text-xs uppercase tracking-widest text-muted-foreground" onClick={() => setOpen(false)}>Discard</Button>
          <Button onClick={handleCreate} disabled={isSaving} className="rounded-xl px-10 h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20">
            {isSaving ? <Loader2 className="animate-spin size-4 mr-3" /> : <ShieldCheck className="size-4 mr-3 text-indigo-200" />}
            {t('dashboard.quiz.publish')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function QuizTakeDialog({ quiz, user, t }: { quiz: any; user: User; t: (k: string) => string }) {
  const { language } = useI18n()
  // Returns the Sinhala version if available and language is 'si', else falls back to English
  const getLang = (en: string, si?: string) => language === 'si' && si?.trim() ? si : en
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [step, setStep] = useState<'intro' | 'active' | 'result'>('intro')
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open && user.role === 'student') {
      const attemptsRef = collection(db, 'quiz_attempts')
      const q = query(
        attemptsRef, 
        where('quiz_id', '==', quiz.id),
        where('student_email', '==', user.email.toLowerCase())
      )
      getDocs(q).then((querySnapshot) => {
        if (!querySnapshot.empty) {
          const d = querySnapshot.docs[0].data()
          setScore(d.score)
          setTotal(d.total_points)
          setAnswers(d.answers)
          setStep('result')
        }
      })
    }
  }, [open, quiz.id, user.email, user.role])

  const loadQuestions = async () => {
    setLoading(true)
    const questionsRef = collection(db, 'quizzes', quiz.id, 'questions')
    const querySnapshot = await getDocs(questionsRef)
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    setQuestions(data)
    setLoading(false)
    setStep('active')
  }

  const handleFinish = async () => {
    let currentScore = 0
    let maxPoints = 0
    questions.forEach(q => {
      maxPoints += (q.points || 1)
      if (answers[q.id] === q.correct_option_index) {
        currentScore += (q.points || 1)
      }
    })

    setScore(currentScore)
    setTotal(maxPoints)
    setIsSubmitting(true)

    try {
      await addDoc(collection(db, 'quiz_attempts'), {
        quiz_id: quiz.id,
        student_email: user.email.toLowerCase(),
        student_name: user.fullName,
        score: currentScore,
        total_points: maxPoints,
        answers: answers,
        language: language,
        created_at: new Date().toISOString()
      })
      setStep('result')
    } catch (err) {
      console.error("Error submitting attempt:", err)
      const { toast } = await import('sonner')
      toast.error("Network synchronization failed.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="rounded-xl h-9 px-4 font-black text-[10px] uppercase tracking-widest text-indigo-600 border-indigo-100 dark:border-indigo-500/20 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all">Begin Assessment</Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[700px] max-h-[90vh] flex flex-col rounded-[1.5rem] sm:rounded-[2.5rem] border-none shadow-aura bg-white dark:bg-zinc-900 p-5 sm:p-8">
        <DialogHeader className="mb-8">
          <DialogTitle className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white mb-2">{quiz.title}</DialogTitle>
          <div className="flex items-center gap-3 flex-wrap">
             <Badge className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 border-none px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
               {quiz.subject}
             </Badge>
             <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50 opacity-60">
               {quiz.grade}
             </span>
             <Badge className={cn(
               "border-none px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
               language === 'si' ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
             )}>
               {language === 'si' ? '🇱🇰 සිංහල' : '🇬🇧 English'}
             </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          {step === 'intro' && (
            <div className="space-y-10 text-center py-12">
              <div className="size-24 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mx-auto shadow-sm">
                <GraduationCap className="size-10 text-indigo-600" />
              </div>
              <div className="space-y-3">
                <p className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">Ready for Certification?</p>
                <p className="text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed">{quiz.description || "Take this verified assessment to validate your understanding of this course module."}</p>
              </div>
              <Button onClick={loadQuestions} className="rounded-2xl h-14 px-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all" disabled={loading}>
                {loading ? <Loader2 className="animate-spin size-5 mr-3" /> : "Initiate Protocol"}
              </Button>
            </div>
          )}

          {step === 'active' && (
            <div className="space-y-12 pb-10">
              {questions.map((q, idx) => {
                const questionText = getLang(q.question_text, q.question_text_si)
                const hasSinhala = q.question_text_si?.trim()
                return (
                  <div key={q.id} className="p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-zinc-50 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/20 space-y-6 sm:space-y-8">
                    <div className="flex gap-4">
                      <span className="text-2xl font-black text-indigo-600 opacity-20">0{idx + 1}</span>
                      <div className="flex-1">
                        <p className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight">
                          {questionText}
                        </p>
                        {language === 'si' && !hasSinhala && (
                          <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mt-2 opacity-80">
                            ⚠ {t('dashboard.quiz.fallbackNotice')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-3">
                      {(q.options || []).map((opt: string, oIdx: number) => {
                        const displayOpt = getLang(opt, q.options_si?.[oIdx])
                        return (
                          <button
                            key={oIdx}
                            onClick={() => setAnswers({ ...answers, [q.id]: oIdx })}
                            className={cn(
                              "group w-full text-left p-4 sm:p-6 rounded-2xl border transition-all duration-500 flex items-center gap-4",
                              answers[q.id] === oIdx
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20"
                                : "bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-800 hover:border-indigo-600/50 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                            )}
                          >
                            <div className={cn(
                              "size-8 rounded-xl flex items-center justify-center font-black text-xs transition-colors",
                              answers[q.id] === oIdx ? "bg-white/20 text-white" : "bg-zinc-50 dark:bg-zinc-700 text-muted-foreground group-hover:text-indigo-600"
                            )}>
                              {String.fromCharCode(65 + oIdx)}
                            </div>
                            <span className="font-bold tracking-tight">{displayOpt}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
              <Button onClick={handleFinish} className="w-full h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg uppercase tracking-widest shadow-2xl shadow-indigo-600/30 transition-all" disabled={isSubmitting || Object.keys(answers).length < questions.length}>
                {isSubmitting ? <Loader2 className="animate-spin size-5 mr-3" /> : <Rocket className="size-6 mr-3 text-indigo-300" />}
                {t('dashboard.quiz.submitQuiz')}
              </Button>
            </div>
          )}

          {step === 'result' && (
            <div className="space-y-12 text-center py-12">
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Performance Certification</p>
                <div className="relative inline-block">
                    <div className="text-[6rem] sm:text-[8rem] font-black text-zinc-900 dark:text-white leading-none tracking-tighter">
                      {score}<span className="text-muted-foreground text-2xl sm:text-4xl font-black">/{total}</span>
                    </div>
                </div>
                <div className={cn(
                   "inline-flex items-center gap-2 px-6 py-2 rounded-full font-black uppercase tracking-[0.2em] text-[10px]",
                   score/total >= 0.8 ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" : 
                   score/total >= 0.5 ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10"
                )}>
                  {score/total >= 0.8 ? t('dashboard.quiz.excellent') : score/total >= 0.5 ? t('dashboard.quiz.passed') : t('dashboard.quiz.retry')}
                </div>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 text-left space-y-4 max-w-sm mx-auto">
                <p className="font-black text-xs uppercase tracking-widest flex items-center gap-3 text-emerald-600">
                  <ShieldCheck className="size-5" /> 
                  Decentralized Grading Proof
                </p>
                <p className="text-muted-foreground font-medium text-xs leading-relaxed opacity-70 italic">Assessment records have been synchronized with your educator's primary ledger.</p>
              </div>
              <Button variant="ghost" className="rounded-xl font-black text-xs uppercase tracking-widest text-muted-foreground" onClick={() => setOpen(false)}>Close Module</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function QuizResultsDialog({ quiz, t }: { quiz: any; t: (k: string) => string }) {
  const [open, setOpen] = useState(false)
  const [attempts, setAttempts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const loadAttempts = async () => {
    setLoading(true)
    try {
      const attemptsRef = collection(db, 'quiz_attempts')
      const q = query(
        attemptsRef, 
        where('quiz_id', '==', quiz.id)
      )
      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }))
      
      // Sort in-memory to avoid needing a composite index for 'quiz_id' + 'created_at'
      data.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime()
        const dateB = new Date(b.created_at || 0).getTime()
        return dateB - dateA
      })

      setAttempts(data)
    } catch (err: any) {
      console.error("Error fetching attempts:", err)
      const { toast } = await import('sonner')
      toast.error(`Failed to load results: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) loadAttempts() }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="rounded-xl h-9 px-4 font-black text-[10px] uppercase tracking-widest text-emerald-600 border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all">Review Results</Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[700px] max-h-[85vh] flex flex-col rounded-[1.5rem] sm:rounded-[2.5rem] border-none shadow-aura bg-white dark:bg-zinc-900 p-5 sm:p-8">
        <DialogHeader className="mb-8">
          <DialogTitle className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white mb-2">Performance Ledger</DialogTitle>
          <div className="flex items-center gap-3">
             <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-none px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
               {quiz.title}
             </Badge>
             <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50 opacity-60">
               Cohort Analytics
             </span>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2 pr-1 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-indigo-600" /></div>
          ) : attempts.length === 0 ? (
            <EmptyState icon={InboxIcon} message="No Data" sub="Students haven't synchronized their attempts yet." />
          ) : (
            <div className="space-y-3">
              {attempts.map(a => {
                const pct = a.total_points > 0 ? Math.round((a.score / a.total_points) * 100) : 0
                return (
                  <div key={a.id} className="p-4 rounded-2xl border bg-muted/20 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {a.student_name ? a.student_name.charAt(0) : '?'}
                        </div>
                        <div>
                          <p className="font-bold text-sm tracking-tight">{a.student_name || 'Anonymous'}</p>
                          <p className="text-[10px] text-muted-foreground">{a.student_email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {a.language && (
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                            a.language === 'si' ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          )}>
                            {a.language === 'si' ? '🇱🇰 සිං' : '🇬🇧 EN'}
                          </span>
                        )}
                        <div className="text-right">
                          <p className="font-bold text-lg leading-none">{a.score}<span className="text-xs text-muted-foreground">/{a.total_points}</span></p>
                          <p className="text-[10px] text-muted-foreground uppercase font-medium">{pct}%</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground italic bg-background px-2 py-1 rounded-md border">
                          {new Date(a.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {/* Score progress bar */}
                    <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-700", pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-indigo-500" : "bg-rose-500")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function QuizzesSection({ user, role, t }: { user: User; role: 'student' | 'teacher'; t: (k: string) => string }) {
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const quizzesRef = collection(db, 'quizzes')
      let q = query(quizzesRef, orderBy('created_at', 'desc'))

      if (role === 'teacher') {
        q = query(quizzesRef, where('teacher_email', '==', user.email.toLowerCase()), orderBy('created_at', 'desc'))
      } else if (user.gradeClass) {
        q = query(quizzesRef, where('grade', '==', user.gradeClass), orderBy('created_at', 'desc'))
      }

      const querySnapshot = await getDocs(q)
      const data = await Promise.all(querySnapshot.docs.map(async docSnapshot => {
        const quizData: any = { id: docSnapshot.id, ...docSnapshot.data() }
        
        // Fetch attempts count for this quiz
        const attemptsRef = collection(db, 'quiz_attempts')
        let aq = query(attemptsRef, where('quiz_id', '==', docSnapshot.id))
        
        if (role === 'student') {
          aq = query(aq, where('student_email', '==', user.email.toLowerCase()))
        }
        
        const aSnap = await getDocs(aq)
        quizData.quiz_attempts = [{ count: aSnap.size }]
        return quizData
      }))

      setQuizzes(data)
      setLoading(false)
    } catch (err: any) {
      console.error("Error loading quizzes:", err)
      setLoading(false)
      const { toast } = await import('sonner')
      toast.error(`Quizzes Error: ${err.message}`)
    }
  }

  const handleDeleteQuiz = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this quiz? Students will lose access to it immediately.")) return
    
    try {
      const { toast } = await import('sonner')
      await deleteDoc(doc(db, 'quizzes', id))
      setQuizzes(prev => prev.filter(q => q.id !== id))
      toast.success("Quiz deleted successfully.")
    } catch (err) {
      console.error("Quiz delete error:", err)
    }
  }

  useEffect(() => { loadData() }, [user.gradeClass, user.email, role])

  return (
    <PremiumCard className="p-0 border-none overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-black tracking-tight text-zinc-900 dark:text-white uppercase flex items-center gap-3">
          <BookOpen className="size-5 text-indigo-600" /> Quizzes & Tests
        </h3>
        {role === 'teacher' && <QuizCreator user={user} t={t} onQuizCreated={loadData} />}
      </div>
      <div className="p-6 sm:p-8">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
        ) : quizzes.length === 0 ? (
          <EmptyState icon={InboxIcon} message="No quizzes available" sub={role === 'teacher' ? "Create a quiz to engage your students" : "Check back later for new tests"} />
        ) : (
          <div className="grid gap-4">
            {quizzes.map(q => (
              <div key={q.id} className="group flex items-center justify-between p-5 rounded-3xl border border-zinc-50 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-2xl hover:shadow-zinc-200/50 dark:hover:shadow-black/20 transition-all duration-500">
                <div className="flex items-center gap-5">
                  <div className="size-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <TrendingUp className="size-6 text-indigo-600" />
                  </div>
                  <div>
                      <p className="font-bold text-base text-zinc-900 dark:text-white tracking-tight">{q.title}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mt-1.5 flex items-center gap-3 flex-wrap">
                        <span className="opacity-60">{q.subject} • {q.grade}</span>
                        {role === 'teacher' && <span className="text-indigo-600"> {q.quiz_attempts?.[0]?.count || 0} Attempts</span>}
                        {q.has_sinhala && (
                          <span className="text-amber-600 font-black flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-[8px]">
                            🇱🇰 සිංහල
                          </span>
                        )}
                        {role === 'student' && q.quiz_attempts?.[0]?.count > 0 && (
                          <span className="text-emerald-500 font-black flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                            <CheckCircle className="size-3" /> COMPLETED
                          </span>
                        )}
                      </p>
                  </div>
                </div>
                {role === 'teacher' ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-12 rounded-2xl text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    onClick={(e) => handleDeleteQuiz(q.id, e)}
                  >
                    <Trash className="size-5" />
                  </Button>
                ) : (
                  role === 'student' ? (
                    <QuizTakeDialog quiz={q} user={user} t={t} />
                  ) : (
                    <div className="flex items-center gap-2">
                      <QuizResultsDialog quiz={q} t={t} />
                      <Button size="icon" variant="ghost" className="size-10 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all" onClick={async () => {
                        if (confirm("Are you sure you want to delete this quiz?")) {
                          await deleteDoc(doc(db, 'quizzes', q.id))
                          loadData()
                        }
                      }}>
                        <Trash className="size-4" />
                      </Button>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PremiumCard>
  )
}

// ─── Messaging System ────────────────────────────────────────────────────────

function MessageComposeDialog({ user, t, onSent }: { user: User; t: (k: string) => string; onSent: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [recipients, setRecipients] = useState<any[]>([])
  const [selectedRecipient, setSelectedRecipient] = useState<any>(null)
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")

  const searchRecipients = async (val: string) => {
    setSearch(val)
    if (!val.trim()) {
      setRecipients([])
      return
    }

    // Teachers find students, students find teachers
    const targetRole = user.role === 'teacher' ? 'student' : 'teacher'
    const profilesRef = collection(db, 'profiles')
    
    try {
      // Fetch users with the target role (limit to 50 for safety, though sorting/search is in-memory)
      const q = query(
        profilesRef, 
        where('role', '==', targetRole),
        limit(50) 
      )
      
      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map(doc => {
        const d = doc.data()
        return { 
          id: doc.id, 
          email: d.email,
          fullName: d.fullName || d.full_name // Map both versions consistently
        }
      }).filter(p => 
        (p.fullName || "").toLowerCase().includes(val.toLowerCase()) ||
        (p.email || "").toLowerCase().includes(val.toLowerCase())
      ).slice(0, 5)

      setRecipients(data)
    } catch (err: any) {
      console.error("Recipient search error:", err)
      const { toast } = await import('sonner')
      toast.error(`Search error: ${err.message}`)
    }
  }

  const handleSend = async () => {
    if (!selectedRecipient || !content.trim()) return
    setLoading(true)
    try {
      await addDoc(collection(db, 'internal_messages'), {
        sender_email: user.email.toLowerCase(),
        sender_name: user.fullName,
        receiver_email: selectedRecipient.email.toLowerCase(),
        receiver_name: selectedRecipient.fullName || selectedRecipient.full_name, // Support both naming conventions
        subject: subject || "No Subject",
        content: content,
        status: 'unread',
        created_at: new Date().toISOString()
      })

      const { toast } = await import('sonner')
      toast.success("Transmission successful.")
      // Create notification for recipient
      await addDoc(collection(db, 'notifications'), {
        user_email: selectedRecipient.email.toLowerCase(),
        title: "New Message",
        content: `${user.fullName} sent you a new message regarding "${subject || "Secure Communication"}"`,
        type: 'message',
        is_read: false,
        created_at: new Date().toISOString()
      })

      setOpen(false)
      setSelectedRecipient(null)
      setSubject("")
      setContent("")
      onSent()
    } catch (err) {
      console.error("Error sending message:", err)
      const { toast } = await import('sonner')
      toast.error("Failed to send message")
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-2xl h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2">
          <PlusCircle className="size-4" /> New Message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] border-none shadow-aura bg-white dark:bg-zinc-900 p-8">
        <DialogHeader className="mb-8">
          <DialogTitle className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white mb-2">Compose Transmission</DialogTitle>
          <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Dispatch secure communications to academic personnel.</DialogDescription>
        </DialogHeader>
        <div className="space-y-8">
          <div className="relative space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white px-1">Recipient Address</Label>
            {selectedRecipient ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-between p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20"
              >
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-black text-xs">
                    {selectedRecipient.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black tracking-tight text-indigo-600">{selectedRecipient.full_name}</p>
                    <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">{selectedRecipient.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="size-8 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500" onClick={() => setSelectedRecipient(null)}>
                  <X className="size-4" />
                </Button>
              </motion.div>
            ) : (
              <div className="relative">
                <Input 
                  placeholder={`Search ${user.role === 'teacher' ? 'students' : 'teachers'}...`} 
                  className="h-14 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 px-6 font-bold text-sm focus:ring-indigo-600"
                  value={search}
                  onChange={(e) => searchRecipients(e.target.value)}
                />
                <AnimatePresence>
                  {recipients.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-aura z-50 overflow-hidden"
                    >
                      {recipients.map(r => (
                        <button 
                          key={r.email}
                          className="w-full text-left px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-4 border-b last:border-0 border-zinc-50 dark:border-zinc-800"
                          onClick={() => {
                            setSelectedRecipient(r)
                            setRecipients([])
                            setSearch("")
                          }}
                        >
                          <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-black text-xs shrink-0">
                            {(r.fullName || "?").charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white">{r.fullName || "Unknown User"}</p>
                            <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">{r.email}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white px-1">Subject Matter</Label>
            <Input placeholder="Ex. Grade 11 Science Seminar" value={subject} onChange={e => setSubject(e.target.value)} className="h-14 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 px-6 font-bold text-sm" />
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white px-1">Message Content</Label>
            <Textarea 
              placeholder="Type your transmission here..." 
              className="min-h-[180px] rounded-[1.5rem] bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 p-6 font-medium text-sm focus:ring-indigo-600 resize-none" 
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="mt-10 gap-3">
          <Button variant="ghost" className="rounded-xl font-black text-xs uppercase tracking-widest text-muted-foreground" onClick={() => setOpen(false)}>Discard</Button>
          <Button onClick={handleSend} disabled={loading || !selectedRecipient || !content.trim()} className="rounded-xl px-10 h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all">
            {loading ? <Loader2 className="animate-spin size-4" /> : <Send className="size-4 mr-3" />}
            Execute Dispatch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function MessageViewDialog({ message, user, onUpdate }: { message: any; user: User; onUpdate: () => void }) {
  const [open, setOpen] = useState(false)

  const markAsRead = async () => {
    if (message.status === 'unread' && message.receiver_email === user.email.toLowerCase()) {
      const docRef = doc(db, 'internal_messages', message.id)
      await updateDoc(docRef, { status: 'read' })
      onUpdate()
    }
  }

  const isUnread = message.status === 'unread' && message.receiver_email === user.email.toLowerCase()

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) markAsRead() }}>
      <DialogTrigger asChild>
        <button className={cn(
          "w-full text-left p-6 rounded-3xl border transition-all duration-500 flex items-center justify-between group",
          isUnread 
            ? "bg-indigo-50/50 dark:bg-indigo-500/5 border-indigo-100 dark:border-indigo-500/20 shadow-xl shadow-indigo-600/5" 
            : "bg-zinc-50/30 dark:bg-zinc-800/10 border-zinc-100 dark:border-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-2xl hover:shadow-zinc-200/50 dark:hover:shadow-black/20"
        )}>
          <div className="flex items-center gap-5">
            <div className={cn(
              "size-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm",
              isUnread ? "bg-indigo-500 text-white" : "bg-white dark:bg-zinc-700 text-muted-foreground/60"
            )}>
              <MessageSquare className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <p className={cn("font-black text-base tracking-tight", isUnread ? "text-indigo-600" : "text-zinc-900 dark:text-white")}>{message.subject}</p>
                {isUnread && (
                  <Badge className="bg-indigo-600 h-5 px-2 rounded-full text-[8px] font-black uppercase tracking-widest border-none">NEW</Badge>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1.5 opacity-60">
                {message.sender_email === user.email.toLowerCase() 
                  ? `To: ${message.receiver_name || message.receiver_email}` 
                  : `From: ${message.sender_name || message.sender_email}`}
              </p>
            </div>
          </div>
          <div className="text-right sr-only sm:not-sr-only">
             <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest">
               {new Date(message.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
             </p>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="w-[92vw] sm:max-w-[600px] rounded-[2rem] sm:rounded-[2.5rem] border-none shadow-aura bg-white dark:bg-zinc-900 p-6 sm:p-8">
        <DialogHeader className="mb-10">
          <div className="flex items-center gap-5">
             <div className="size-16 rounded-[1.5rem] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-black text-2xl shadow-sm">
                {(message.sender_name || message.sender_email).charAt(0).toUpperCase()}
             </div>
             <div>
                <DialogTitle className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white mb-2">{message.subject}</DialogTitle>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  {message.sender_name || message.sender_email} • {new Date(message.created_at).toLocaleString()}
                </p>
             </div>
          </div>
        </DialogHeader>
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 sm:p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 mb-8 min-h-[200px]">
           <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
             {message.content}
           </p>
        </div>
        <DialogFooter className="gap-3">
          <Button variant="ghost" className="flex-1 rounded-xl font-black text-xs uppercase tracking-widest text-muted-foreground" onClick={() => setOpen(false)}>Dismiss</Button>
          <Button className="flex-1 rounded-xl h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 disabled:opacity-50" disabled>Reply Protocol</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function MessagingSection({ user, t }: { user: User; t: (k: string) => string }) {
  const [messages, setMessages] = useState<any[]>([])
  const [view, setView] = useState<'inbox' | 'sent'>('inbox')
  const [loading, setLoading] = useState(true)

  const loadMessages = async () => {
    setLoading(true)
    const email = user.email.toLowerCase()
    
    const messagesRef = collection(db, 'internal_messages')
    let q;
    
    if (view === 'inbox') {
      q = query(
        messagesRef, 
        where('receiver_email', '==', email),
        orderBy('created_at', 'desc')
      )
    } else {
      q = query(
        messagesRef, 
        where('sender_email', '==', email),
        orderBy('created_at', 'desc')
      )
    }

    try {
      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setMessages(data)
    } catch (err) {
      console.error("Error loading messages:", err)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadMessages()
    // Firestore realtime listener
    const messagesRef = collection(db, 'internal_messages')
    const email = user.email.toLowerCase()
    const q = view === 'inbox' 
      ? query(messagesRef, where('receiver_email', '==', email))
      : query(messagesRef, where('sender_email', '==', email))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setMessages(data.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ))
    })

    return () => unsubscribe()
  }, [view, user.email])

  return (
    <PremiumCard className="p-0 border-none overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white uppercase flex items-center gap-3">
          <MessageSquare className="size-5 text-indigo-600" /> Messages
        </h3>
        <MessageComposeDialog user={user} t={t} onSent={loadMessages} />
      </div>
      <div className="p-6 sm:p-8">
        <div className="flex bg-zinc-50 dark:bg-zinc-800 p-1 rounded-2xl mb-8">
          <button 
            onClick={() => setView('inbox')}
            className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-500", view === 'inbox' ? "bg-white dark:bg-zinc-700 shadow-xl text-indigo-600" : "text-muted-foreground hover:text-zinc-900")}
          >
            Inbox {messages.filter(m => m.status === 'unread' && m.receiver_email === user.email.toLowerCase()).length > 0 && `(${messages.filter(m => m.status === 'unread' && m.receiver_email === user.email.toLowerCase()).length})`}
          </button>
          <button 
            onClick={() => setView('sent')}
            className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-500", view === 'sent' ? "bg-white dark:bg-zinc-700 shadow-xl text-indigo-600" : "text-muted-foreground hover:text-zinc-900")}
          >
            Sent
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
        ) : messages.length === 0 ? (
          <EmptyState icon={InboxIcon} message="No messages" sub={view === 'inbox' ? "Your inbox is empty" : "You haven't sent any messages yet"} />
        ) : (
          <div className="grid gap-4">
            {messages.map(m => (
              <MessageViewDialog key={m.id} message={m} user={user} onUpdate={loadMessages} />
            ))}
          </div>
        )}
      </div>
    </PremiumCard>
  )
}

// ─── Student Dashboard ────────────────────────────────────────────────────────
// ─── Virtual Labs Section (Student) ──────────────────────────────────────────
const VIRTUAL_LABS = [
  {
    id: "skeleton",
    subject: "Biology / Anatomy",
    title: "Skeletal Framework Lab",
    description: "Explore the 206 bones of the human body in high definition. Discover how they articulate and support life.",
    modelId: "acf6b25134d945f8b0bc8ae5e04861df"
  },
  {
    id: "solar-system",
    subject: "Astronomy / Science",
    title: "Celestial Mechanics Lab",
    description: "Navigate through the solar system and study the orbits, scales, and features of planets.",
    modelId: "f7896d085f474ef28631d88129268411"
  },
  {
    id: "dna",
    subject: "Biology / Genetics",
    title: "Molecular Genetics Lab",
    description: "Inspect the double helix structure of DNA and understand the building blocks of genetic information.",
    modelId: "60e95170b37549e3b45ee490b74bb112"
  }
]

function LabsSection({ t }: { t: (k: string) => string }) {
  const [selectedLab, setSelectedLab] = useState<any>(null)

  return (
    <div className="space-y-10">
      {selectedLab ? (
        <div className="space-y-6">
          <Button 
            variant="ghost" 
            className="group rounded-xl px-0 hover:bg-transparent text-indigo-600 font-black text-[10px] uppercase tracking-widest"
            onClick={() => setSelectedLab(null)}
          >
            <ArrowLeft className="size-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
            Back to Laboratory
          </Button>
          <VirtualLabViewer 
            title={selectedLab.title}
            description={selectedLab.description}
            subject={selectedLab.subject}
            modelId={selectedLab.modelId}
          />
        </div>
      ) : (
        <PremiumCard className="p-0 border-none overflow-hidden">
          <div className="p-10 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/20">
            <div>
              <h3 className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase flex items-center gap-3">
                <Microscope className="size-6 text-indigo-600" /> Discovery Labs
              </h3>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/50 mt-1">Immersive 3D Learning Environments</p>
            </div>
          </div>
          <div className="p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {VIRTUAL_LABS.map((lab) => (
                <div 
                  key={lab.id}
                  onClick={() => setSelectedLab(lab)}
                  className="group relative rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/10 p-8 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 cursor-pointer overflow-hidden"
                >
                  <div className="absolute -top-4 -right-4 size-32 opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all duration-700">
                    <Sparkles className="size-full text-indigo-600" />
                  </div>
                  <Badge className="mb-6 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 border-none px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                    {lab.subject}
                  </Badge>
                  <h4 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white mb-3 leading-none uppercase">{lab.title}</h4>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed opacity-70 mb-10">
                    {lab.description}
                  </p>
                  <Button className="rounded-2xl w-full h-12 bg-white dark:bg-zinc-700 hover:bg-indigo-600 hover:text-white border border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-white font-black text-[10px] uppercase tracking-widest shadow-sm transition-all">
                    Initiate 3D Reality
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </PremiumCard>
      )}
    </div>
  )
}

export function StudentDashboard({ user, onLogout, onBackToWebsite }: DashboardProps) {
  const { t } = useI18n()
  const [emoji, setEmoji] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [assignments, setAssignments] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loadingAssignments, setLoadingAssignments] = useState(true)
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true)

  // Section Refs for Scrolling
  const marksRef = useRef<HTMLDivElement>(null)
  const papersRef = useRef<HTMLDivElement>(null)
  const scheduleRef = useRef<HTMLDivElement>(null)
  const assignmentsRef = useRef<HTMLDivElement>(null)
  const messagingRef = useRef<HTMLDivElement>(null)
  const quizzesRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    setEmoji(EMOJIS[Math.floor(Math.random() * EMOJIS.length)])

    // Fetch Assignments
    const fetchAssignments = async () => {
      const assignmentsRef = collection(db, 'assignments')
      // Firestore doesn't support OR across different fields easily with different types of filters.
      // We'll fetch by grade first, and then optionally by target_student_emails if needed, 
      // or just filter on the client if the volume is manageable.
      let q = query(
        assignmentsRef, 
        where('grade', '==', user.gradeClass || ""),
        orderBy('created_at', 'desc'),
        limit(20)
      )
      
      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      
      // Filter for specific student assignments if they exist
      const filtered = data.filter((a: any) => 
        !a.target_student_emails || a.target_student_emails.includes(user.email.toLowerCase())
      )
      setAssignments(filtered)
      setLoadingAssignments(false)
    }

    // Fetch Announcements
    const fetchAnnouncements = async () => {
      const announcementsRef = collection(db, 'announcements')
      const q = query(
        announcementsRef, 
        orderBy('date', 'desc'),
        limit(5)
      )
      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setAnnouncements(data)
      setLoadingAnnouncements(false)
    }

    fetchAssignments()
    fetchAnnouncements()
  }, [user.gradeClass, user.email])

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <ProSidebarLayout user={user} onLogout={onLogout} activeTab={activeTab} onTabChange={setActiveTab}>
      <AnimatedContainer className="space-y-10">
          
          {/* Welcome Section */}
          <motion.div variants={childVariants} className="relative py-10 sm:py-16 px-6 sm:px-10 rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-white dark:bg-zinc-900 shadow-aura border border-zinc-50 dark:border-zinc-800">
             <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-[0.05]">
                <GraduationCap size={240} className="text-zinc-900 dark:text-white rotate-12" />
             </div>
             <div className="relative z-10">
                <Badge className="mb-6 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 border-none px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                   {user.gradeClass} • Current Term
                </Badge>
                <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight mb-4 sm:mb-6 text-zinc-900 dark:text-white leading-none">
                  {t("dashboard.welcomeBack")}, <br/><span className="text-indigo-600">{user.fullName.split(" ")[0]}</span> {emoji}
                </h1>
                <p className="text-muted-foreground text-sm sm:text-xl max-w-2xl font-bold leading-relaxed opacity-70">
                  {t("dashboard.studentSubtitle")}
                </p>
             </div>
          </motion.div>

          {activeTab === "overview" && (
            <>
              {/* Stats Bento Grid */}
              <AnimatedContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title={t("dashboard.enrolledClasses")} value="12" icon={BookOpen} trend="+2 this term" colorClass="bg-blue-500/10 text-blue-600" isComingSoon={true} />
            <StatCard title={t("dashboard.assignmentsDue")} value={assignments.length.toString()} icon={FileText} trend="3 pending" colorClass="bg-purple-500/10 text-purple-600" isComingSoon={true} />
            <StatCard title={t("dashboard.averageGrade")} value="88%" icon={TrendingUp} trend="Top 5%" colorClass="bg-amber-500/10 text-amber-600" isComingSoon={true} />
            <StatCard title={t("dashboard.attendance")} value="94%" icon={Calendar} trend="On track" colorClass="bg-emerald-500/10 text-emerald-600" isComingSoon={true} />
          </AnimatedContainer>

          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-8">
              {/* Upcoming Assignments */}
              <motion.div variants={childVariants} ref={assignmentsRef} className="scroll-mt-24">
                <PremiumCard className="h-full">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight">{t("dashboard.upcomingAssignments")}</h3>
                        <p className="text-xs text-muted-foreground">Focus on your deadlines</p>
                    </div>
                    {loadingAssignments && <Loader2 className="size-4 animate-spin text-primary" />}
                  </div>
                  
                  {loadingAssignments ? (
                    <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                  ) : assignments.length === 0 ? (
                    <EmptyState
                      icon={CheckCircle}
                      message="All Clear!"
                      sub="You've completed all your upcoming tasks."
                    />
                  ) : (
                    <div className="grid gap-3">
                      {assignments.map(a => (
                        <motion.div 
                          key={a.id} 
                          whileHover={{ x: 10 }}
                          className="group flex items-center gap-5 p-5 rounded-3xl border border-zinc-50 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-2xl hover:shadow-zinc-200/50 dark:hover:shadow-black/20 transition-all duration-500 overflow-hidden relative"
                        >
                          <div className="size-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <FileText className="size-6 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-base text-zinc-900 dark:text-white truncate">{a.title}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-white dark:bg-zinc-700 border-zinc-100 dark:border-zinc-800 text-muted-foreground">{a.subject}</Badge>
                                <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50 flex items-center gap-1.5">
                                    <Clock className="size-3" /> {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'No date'}
                                </span>
                            </div>
                          </div>
                          <SubmissionDialog assignment={a} user={user} t={t} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </PremiumCard>
              </motion.div>
            </div>

            {/* Sidebar Gird */}
            <div className="lg:col-span-4 space-y-8">
              {/* Quick Actions Nebula */}
              <motion.div variants={childVariants}>
                <PremiumCard className="p-8 border-none ring-1 ring-zinc-50 dark:ring-zinc-800">
                    <h3 className="text-[10px] font-black mb-8 tracking-[0.2em] uppercase text-indigo-600 flex items-center gap-3">
                        <TrendingUp className="size-4" />
                        {t("dashboard.quickActions")}
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { label: "Interactive Quizzes", icon: TrendingUp, color: "indigo", actTab: "courses" },
                            { label: "Virtual Discovery Labs", icon: Microscope, color: "indigo", actTab: "labs" },
                            { label: t("dashboard.recentMarks"), icon: BarChart3, color: "indigo", actTab: "assignments" },
                            { label: t("dashboard.pastPapers"), icon: FileText, color: "rose", actTab: "courses" },
                        ].map((action, i) => (
                            <Button
                                key={i}
                                onClick={() => setActiveTab(action.actTab)}
                                variant="ghost"
                                className="justify-start h-16 rounded-2xl border border-zinc-50 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/20 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-black/20 transition-all group overflow-hidden"
                            >
                                <div className={cn("size-10 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-sm bg-white dark:bg-zinc-700", action.color === 'rose' ? 'text-rose-500' : action.color === 'amber' ? 'text-amber-500' : 'text-indigo-600')}>
                                    <action.icon className="size-5" />
                                </div>
                                <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white uppercase">{action.label}</span>
                                <ExternalLink className="size-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0" />
                            </Button>
                        ))}
                    </div>
                </PremiumCard>
              </motion.div>

              {/* Announcements Section */}
              <motion.div variants={childVariants}>
                <PremiumCard className="bg-card/20 border-white/5 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-blue-600 flex items-center gap-2">
                            <Bell className="size-5 animate-bounce" />
                            LEVEL-UP Feed
                        </h3>
                        {loadingAnnouncements && <Loader2 className="size-4 animate-spin text-primary" />}
                    </div>
                    
                    {loadingAnnouncements ? (
                      <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                    ) : announcements.length === 0 ? (
                      <EmptyState
                        icon={Bell}
                        message="Silence is Golden"
                        sub="No recent announcements from school."
                      />
                    ) : (
                      <div className="space-y-4">
                        {announcements.map(ann => {
                          const isOwner = ann.teacher_email === user.email || user.role === 'admin';
                          
                          const handleDeleteAnnouncement = async (id: string, e: React.MouseEvent) => {
                            e.stopPropagation()
                            if (!confirm("Delete this announcement?")) return
                            try {
                              const { toast } = await import('sonner')
                              await deleteDoc(doc(db, 'announcements', id))
                              setAnnouncements(prev => prev.filter(a => a.id !== id))
                              toast.success("Announcement removed.")
                            } catch (err) {
                              console.error("Ann delete error:", err)
                            }
                          }

                          return (
                            <motion.div 
                              key={ann.id} 
                              whileHover={{ scale: 1.02 }}
                              className="p-6 rounded-[2.5rem] border border-zinc-50 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/20 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-2xl transition-all duration-500 cursor-default relative group"
                            >
                              <p className="font-bold text-sm text-zinc-900 dark:text-white leading-tight mb-3 uppercase tracking-tight pr-8">{ann.title}</p>
                              <p className="text-[10px] font-bold text-muted-foreground/60 leading-relaxed uppercase tracking-widest">"{ann.summary || ann.content}"</p>
                              
                              {isOwner && (
                                <button 
                                  onClick={(e) => handleDeleteAnnouncement(ann.id, e)}
                                  className="absolute top-4 right-4 p-2 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <Trash className="size-4" />
                                </button>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                </PremiumCard>
              </motion.div>
            </div>
          </div>
            </>
          )}

          {activeTab === "courses" && (
            <div className="grid gap-8">
              {/* Past Papers Section */}
              <motion.div variants={childVariants} ref={papersRef} className="scroll-mt-24">
                <PastPapersSection gradeClass={user.gradeClass} t={t} />
              </motion.div>

              {/* Quizzes Section */}
              <motion.div variants={childVariants} ref={quizzesRef} className="scroll-mt-24">
                <QuizzesSection user={user} role="student" t={t} />
              </motion.div>
            </div>
          )}

          {activeTab === "assignments" && (
            <div className="grid gap-8">
              {/* My Marks */}
              <motion.div variants={childVariants} ref={marksRef} className="scroll-mt-24">
                <MyMarksSection user={user} t={t} />
              </motion.div>
            </div>
          )}

          {activeTab === "messages" && (
            <div className="grid gap-8">
              {/* Messaging Section */}
              <motion.div variants={childVariants} ref={messagingRef} className="scroll-mt-24">
                <MessagingSection user={user} t={t} />
              </motion.div>
            </div>
          )}

          {activeTab === "labs" && (
            <div className="grid gap-8">
              {/* Virtual Discovery Labs */}
              <motion.div variants={childVariants} className="scroll-mt-24">
                <LabsSection t={t} />
              </motion.div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="grid gap-8">
              {/* Settings Section */}
              <motion.div variants={childVariants}>
                <SettingsSection user={user} t={t} />
              </motion.div>
            </div>
          )}
          
          {/* Footer Signature */}
          <motion.div variants={childVariants} className="pt-12 pb-6 flex flex-col items-center">
            <div className="px-6 py-2.5 rounded-full bg-white/50 dark:bg-zinc-900/50 border border-zinc-100/50 dark:border-zinc-800/50 hover:border-indigo-500/20 transition-all group backdrop-blur-sm">
              <p className="text-[9px] font-bold text-muted-foreground group-hover:text-indigo-600 transition-colors uppercase tracking-widest">
                Excellence Engineered By <span className="text-zinc-900 dark:text-white ml-1.5">Dilshan Methsara</span>
              </p>
            </div>
          </motion.div>
        </AnimatedContainer>

      {/* AI Assistant - Enhanced Floating Bubble */}
      <motion.div 
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1, type: "spring" }}
        className="fixed bottom-8 right-8 z-50"
      >
        <StudentAIChat user={user} />
      </motion.div>
    </ProSidebarLayout>
  )
}

// ─── Enter Marks Dialog (Teacher) ────────────────────────────────────────────
function EnterMarksDialog({ user, t }: { user: any; t: (k: string) => string }) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [subject, setSubject] = useState("")
  const [term, setTerm] = useState("")
  const [score, setScore] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  // Live search students as teacher types
  useEffect(() => {
    if (!searchQuery?.trim()) {
      setSuggestions([])
      setShowDropdown(false)
      setIsSearching(false)
      return
    }
    setIsSearching(true)
    const timer = setTimeout(async () => {
      const capitalized = searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1)
      const q = query(
        collection(db, 'valid_students'), 
        orderBy('full_name'),
        where('full_name', '>=', capitalized),
        where('full_name', '<=', capitalized + '\uf8ff'),
        limit(10)
      )
      getDocs(q).then((querySnapshot) => {
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setSuggestions(data)
        setShowDropdown(true)
        setIsSearching(false)
      }).catch(async err => {
        console.error("Student search error:", err)
        setIsSearching(false)
        const { toast } = await import('sonner')
        toast.error(`Search Error: ${err.message}`)
      })
    }, 250)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const selectStudent = (student: any) => {
    setSelectedStudent(student)
    setSearchQuery(student.full_name || "")
    setShowDropdown(false)
    setSuggestions([])
  }

  const handleSave = async () => {
    if (!selectedStudent || !subject || !score) return
    setIsSaving(true)
    try {
      await addDoc(collection(db, 'marks'), {
        student_id: selectedStudent.student_id,
        student_name: selectedStudent.full_name,
        grade: selectedStudent.grade,
        subject,
        term: term || null,
        score: parseInt(score),
        teacher_email: user.email.toLowerCase().trim(),
        created_at: new Date().toISOString()
      })
      const { toast } = await import('sonner')
      toast.success(`Marks saved for ${selectedStudent.fullName || selectedStudent.full_name}!`)

      // Lookup student email from profiles to send notification
      try {
        const profilesRef = collection(db, 'profiles')
        const q = query(profilesRef, where('studentId', '==', selectedStudent.student_id))
        const profileSnap = await getDocs(q)
        
        if (!profileSnap.empty) {
          const studentEmail = profileSnap.docs[0].data().email
          await addDoc(collection(db, 'notifications'), {
            user_email: studentEmail.toLowerCase(),
            title: "New Academic Record",
            content: `Your score for ${subject} (${term || 'Recent'}) has been recorded: ${score}/100`,
            type: 'announcement',
            is_read: false,
            created_at: new Date().toISOString()
          })
        }
      } catch (notifyErr) {
        console.error("Failed to send notification:", notifyErr)
      }

      setOpen(false)
      resetForm()
    } catch (err) {
      console.error("Error saving marks:", err)
      const { toast } = await import('sonner')
      toast.error('Failed to save marks')
    } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => {
    setSearchQuery(""); setSelectedStudent(null); setSubject(""); setTerm(""); setScore("")
    setSuggestions([]); setShowDropdown(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="justify-start h-16 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-black/20 transition-all group px-6">
          <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-sm">
            <GraduationCap className="size-5 text-indigo-600" />
          </div>
          <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white uppercase">{t('dashboard.enterMarks')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[92vw] sm:max-w-[500px] rounded-[2rem] sm:rounded-[2.5rem] border-none shadow-aura bg-white dark:bg-zinc-900 p-6 sm:p-8">
        <DialogHeader className="mb-8">
          <DialogTitle className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white mb-2">{t('dashboard.enterMarks')}</DialogTitle>
          <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Search for a student and award academic scores.</DialogDescription>
        </DialogHeader>
        <div className="space-y-8">
          {/* Student Search */}
          <div className="relative space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white px-1">{t('dashboard.selectStudent')}</Label>
            <div className="relative">
              <Input
                placeholder="Ex. John Doe..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSelectedStudent(null) }}
                className="h-14 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 px-6 font-bold text-sm focus:ring-indigo-600 pr-12"
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              />
              {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 size-5 animate-spin text-indigo-600" />}

              {/* Dropdown Suggestions */}
              <AnimatePresence>
                {showDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-aura overflow-hidden"
                  >
                    <div className="px-6 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                        {suggestions.length > 0 ? `Found ${suggestions.length} Students` : "No Students Found"}
                      </p>
                    </div>
                    {suggestions.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => selectStudent(s)}
                        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left transition-colors border-b last:border-0 border-zinc-50 dark:border-zinc-800"
                      >
                        <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-black text-xs shrink-0">
                          {(s.full_name || "S").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white">{s.full_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <Badge variant="outline" className="border-zinc-200 dark:border-zinc-700 h-4 px-1.5 text-[8px] font-black uppercase tracking-widest">{s.grade}</Badge>
                             <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">#{s.student_id}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {selectedStudent && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20"
              >
                <div className="size-8 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-black text-xs shrink-0">
                  {(selectedStudent.full_name || "S").charAt(0)}
                </div>
                <span className="text-sm font-black tracking-tight text-indigo-600">{selectedStudent.full_name}</span>
                <Badge className="ml-auto bg-indigo-500 h-6 rounded-full text-[9px] font-black uppercase tracking-widest px-3">{selectedStudent.grade}</Badge>
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white px-1">{t('common.subject')}</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="h-14 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 px-6 font-bold text-sm">
                  <SelectValue placeholder="Course..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-aura">
                  {(user.subjectsTaught && user.subjectsTaught.length > 0
                    ? user.subjectsTaught
                    : ['Sinhala', 'English', 'Science', 'Mathematics', 'Geography', 'ICT', 'Agri', 'Home Science', 'History', 'Drama', 'Music', 'Civic Education', 'Buddhism']
                  ).map((s: string) => (
                    <SelectItem key={s} value={s} className="rounded-xl font-bold py-2.5">{t(`subjects.${s}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white px-1">Academic Term</Label>
              <Select value={term} onValueChange={setTerm}>
                <SelectTrigger className="h-14 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 px-6 font-bold text-sm">
                  <SelectValue placeholder="Period..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-aura">
                  {['Term 1', 'Term 2', 'Term 3'].map(t => <SelectItem key={t} value={t} className="rounded-xl font-bold py-2.5">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white px-1">{t('dashboard.score')} (MAX 100)</Label>
            <Input
              type="number" min="0" max="100"
              placeholder="00"
              value={score}
              onChange={e => setScore(e.target.value)}
              className="h-20 rounded-[1.5rem] bg-indigo-50 dark:bg-indigo-500/5 border-none text-4xl font-black text-center text-indigo-600 focus:ring-indigo-600"
            />
          </div>
        </div>
        <DialogFooter className="mt-10 gap-3">
          <Button variant="ghost" className="rounded-xl font-black text-xs uppercase tracking-widest text-muted-foreground" onClick={() => setOpen(false)}>Discard</Button>
          <Button onClick={handleSave} className="rounded-xl px-10 h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20" disabled={!selectedStudent || !subject || !score || isSaving}>
            {isSaving ? <Loader2 className="size-4 animate-spin mr-3" /> : null}
            {t('dashboard.saveMarks')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Teacher Dashboard ────────────────────────────────────────────────────────
export function TeacherDashboard({ user, onLogout, onBackToWebsite }: DashboardProps) {
  const { t } = useI18n()
  const [emoji, setEmoji] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  const messagingRef = useRef<HTMLDivElement>(null)

  // Assignment Dialog State
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [assignmentTitle, setAssignmentTitle] = useState("")
  const [assignmentGrade, setAssignmentGrade] = useState("")
  const [assignmentSubject, setAssignmentSubject] = useState("")
  const [assignmentDesc, setAssignmentDesc] = useState("")
  const [isSavingAssignment, setIsSavingAssignment] = useState(false)

  // Announcement Dialog State
  const [isAnnounceDialogOpen, setIsAnnounceDialogOpen] = useState(false)
  const [annTitle, setAnnTitle] = useState("")
  const [annContent, setAnnContent] = useState("")
  const [annCategory, setAnnCategory] = useState("announcement")
  const [isSavingAnn, setIsSavingAnn] = useState(false)
  const [targetStudentIds, setTargetStudentIds] = useState<string[]>([])
  const [studentSearchQuery, setStudentSearchQuery] = useState("")
  const [studentSuggestions, setStudentSuggestions] = useState<any[]>([])
  const [isSearchingStudents, setIsSearchingStudents] = useState(false)
  const [showStudentDropdown, setShowStudentDropdown] = useState(false)


  // Student search for targeting
  useEffect(() => {
    if (!studentSearchQuery || studentSearchQuery.length < 1) { setStudentSuggestions([]); setShowStudentDropdown(false); return }
    setIsSearchingStudents(true)
    const timer = setTimeout(async () => {
      const capitalized = studentSearchQuery.charAt(0).toUpperCase() + studentSearchQuery.slice(1)
      const q = query(
        collection(db, 'valid_students'),
        orderBy('full_name'),
        where('full_name', '>=', capitalized),
        where('full_name', '<=', capitalized + '\uf8ff'),
        limit(5)
      )
      getDocs(q).then((querySnapshot) => {
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setStudentSuggestions(data)
        setShowStudentDropdown(true)
        setIsSearchingStudents(false)
      }).catch(async err => {
        console.error("Target search error:", err)
        setIsSearchingStudents(false)
        const { toast } = await import('sonner')
        toast.error(`Search Error: ${err.message}`)
      })
    }, 150)
    return () => clearTimeout(timer)
  }, [studentSearchQuery])

  const addTargetStudent = (student: any) => {
    if (!targetStudentIds.includes(student.student_id)) {
      setTargetStudentIds([...targetStudentIds, student.student_id])
    }
    setStudentSearchQuery("")
    setShowStudentDropdown(false)
  }

  const removeTargetStudent = (id: string) => {
    setTargetStudentIds(targetStudentIds.filter(idx => idx !== id))
  }

  useEffect(() => {
    setEmoji(EMOJIS[Math.floor(Math.random() * EMOJIS.length)])
  }, [])

  const handleAssignHomework = async () => {
    setIsSavingAssignment(true)
    try {
      await addDoc(collection(db, 'assignments'), {
        title: assignmentTitle,
        description: assignmentDesc,
        grade: assignmentGrade,
        subject: assignmentSubject,
        teacher_email: user.email,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        target_student_ids: targetStudentIds.length > 0 ? targetStudentIds : null,
        created_at: new Date().toISOString()
      })

      // Notify students in the target grade
      const profilesRef = collection(db, 'profiles')
      const studentQuery = query(
        profilesRef, 
        where('role', '==', 'student'),
        where('gradeClass', '==', assignmentGrade)
      )
      const studentSnap = await getDocs(studentQuery)
      
      // Batch-create notifications (sequential for simplicity in client-side)
      studentSnap.forEach(async (std) => {
        await addDoc(collection(db, 'notifications'), {
          user_email: std.data().email.toLowerCase(),
          title: "New Assignment Posted",
          content: `A new ${assignmentSubject} task "${assignmentTitle}" is now available for ${assignmentGrade}.`,
          type: 'assignment',
          is_read: false,
          created_at: new Date().toISOString()
        })
      })

      const { toast } = await import('sonner')
      toast.success(`Assignment "${assignmentTitle}" created!`)
      setIsAssignDialogOpen(false)
      setAssignmentTitle(""); setAssignmentDesc(""); setAssignmentGrade(""); setAssignmentSubject(""); setTargetStudentIds([])
    } catch (err) {
      console.error("Error creating assignment:", err)
      const { toast } = await import('sonner')
      toast.error('Failed to create assignment')
    } finally {
      setIsSavingAssignment(false)
    }
  }

  const handleSendAnnouncement = async () => {
    setIsSavingAnn(true)
    try {
      await addDoc(collection(db, 'announcements'), {
        title: annTitle,
        summary: annContent.substring(0, 100) + (annContent.length > 100 ? "..." : ""),
        content: annContent,
        category: annCategory,
        date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      })
      const { toast } = await import('sonner')
      toast.success(`Announcement posted!`)
      setIsAnnounceDialogOpen(false)
      setAnnTitle(""); setAnnContent(""); setAnnCategory("announcement")
    } catch (err) {
      console.error("Error posting announcement:", err)
      const { toast } = await import('sonner')
      toast.error('Failed to post announcement')
    } finally {
      setIsSavingAnn(false)
    }
  }

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <ProSidebarLayout user={user} onLogout={onLogout} activeTab={activeTab} onTabChange={setActiveTab}>
      <AnimatedContainer className="space-y-10">
          
          {/* Header Section */}
          <motion.div variants={childVariants} className="relative py-10 sm:py-20 px-6 sm:px-12 rounded-[2rem] sm:rounded-[3.5rem] overflow-hidden bg-white dark:bg-zinc-900 shadow-aura border border-zinc-50 dark:border-zinc-800">
             <div className="absolute top-0 right-0 p-16 opacity-[0.03] dark:opacity-[0.05]">
                <Users size={320} className="text-zinc-900 dark:text-white -rotate-12" />
             </div>
             <div className="relative z-10">
                <Badge className="mb-6 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 border-none px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.25em]">
                   Educator Hub • Professional Suite
                </Badge>
                <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight mb-6 sm:mb-8 text-zinc-900 dark:text-white leading-none">
                  {t("dashboard.welcomeBack")}, <br/><span className="text-indigo-600">{user.fullName}</span> {emoji}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4">
                    <p className="text-muted-foreground font-bold text-sm sm:text-xl opacity-70 tracking-tight">{t("dashboard.teacherSubtitle")}</p>
                    {user.subjectsTaught && Array.isArray(user.subjectsTaught) && user.subjectsTaught.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {user.subjectsTaught.map((subj: string) => (
                          <Badge key={subj} variant="outline" className="bg-indigo-50 dark:bg-indigo-500/5 border-indigo-100 dark:border-indigo-500/20 text-indigo-600 font-black px-4 py-1.5 rounded-xl text-[10px] uppercase tracking-widest">
                            {t(`subjects.${subj}`) || subj}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <Badge variant="destructive" className="animate-pulse rounded-full px-5 py-1.5 font-black text-[10px] uppercase tracking-widest">Update Profile</Badge>
                    )}
                </div>
             </div>
          </motion.div>

          {activeTab === "overview" && (
            <>
              {/* Stats Bento Grid */}
              <AnimatedContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title={t("dashboard.activeClasses")} value="8" icon={BookOpen} trend="Steady" colorClass="bg-blue-500/10 text-blue-600" isComingSoon={true} />
            <StatCard title={t("dashboard.totalStudents")} value="124" icon={Users} trend="+12% enrollment" colorClass="bg-purple-500/10 text-purple-600" isComingSoon={true} />
            <StatCard title={t("dashboard.assignments")} value="24" icon={FileText} trend="8 to grade" colorClass="bg-amber-500/10 text-amber-600" isComingSoon={true} />
            <StatCard title={t("dashboard.classAverage")} value="76%" icon={BarChart3} trend="Improving" colorClass="bg-emerald-500/10 text-emerald-600" isComingSoon={true} />
          </AnimatedContainer>

          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-8">
              {/* Assignments to Review */}
              <motion.div variants={childVariants}>
                <TeacherAssignmentsReview user={user} t={t} />
              </motion.div>
            </div>

            <div className="lg:col-span-4 space-y-8">
              {/* Primary Actions Nebula */}
              <motion.div variants={childVariants}>
                <PremiumCard className="p-8 border-none ring-1 ring-zinc-50 dark:ring-zinc-800">
                    <h3 className="text-[10px] font-black mb-8 tracking-[0.2em] uppercase text-indigo-600">Administrative Suite</h3>
                    <div className="grid gap-4">
                        {/* Create Assignment Dialog */}
                        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                          <DialogTrigger asChild>
                            <Button className="h-16 w-full rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-xl shadow-primary/20 gap-3 group">
                              <PlusCircle className="size-6 group-hover:scale-125 transition-transform" />
                              {t("dashboard.createAssignment")}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[92vw] sm:max-w-[425px] rounded-[2rem] border-primary/20 p-6 sm:p-8">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-black tracking-tight">{t("dashboard.createAssignment")}</DialogTitle>
                              <DialogDescription className="font-medium">Assign new homework to a specific grade.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-5 py-4">
                              <div className="space-y-2">
                                <Label className="font-bold text-xs uppercase tracking-widest opacity-70" htmlFor="title">{t("dashboard.homeworkTitle")}</Label>
                                <Input id="title" className="h-12 rounded-xl border-muted bg-muted/20" placeholder="e.g. Algebra Worksheet" value={assignmentTitle} onChange={e => setAssignmentTitle(e.target.value)} />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="font-bold text-xs uppercase tracking-widest opacity-70" htmlFor="grade">{t("common.grade")}</Label>
                                  <Select value={assignmentGrade} onValueChange={setAssignmentGrade}>
                                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Grade" /></SelectTrigger>
                                    <SelectContent>
                                      {["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"].map(g => (
                                        <SelectItem key={g} value={g}>{g}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="font-bold text-xs uppercase tracking-widest opacity-70" htmlFor="subject">{t("common.subject")}</Label>
                                  <Select value={assignmentSubject} onValueChange={setAssignmentSubject}>
                                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Subject" /></SelectTrigger>
                                    <SelectContent>
                                      {(user.subjectsTaught && user.subjectsTaught.length > 0
                                        ? user.subjectsTaught
                                        : ["Sinhala", "English", "Science", "Mathematics", "Geography", "ICT", "Agri", "Home Science", "History", "Drama", "Music", "Civic Education", "Buddhism"]
                                      ).map(s => (
                                        <SelectItem key={s} value={s}>{t(`subjects.${s}`)}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="font-bold text-xs uppercase tracking-widest opacity-70" htmlFor="desc">{t("dashboard.instructions")}</Label>
                                <Textarea id="desc" className="rounded-xl border-muted bg-muted/20 min-h-[100px]" placeholder="Details about the homework..." value={assignmentDesc} onChange={e => setAssignmentDesc(e.target.value)} />
                              </div>

                              {/* Targeted Students */}
                              <div className="space-y-3">
                                <Label className="font-bold text-xs uppercase tracking-widest opacity-70">Target Students (Optional)</Label>
                                <div className="relative">
                                  <Input
                                    placeholder="Type student name..."
                                    value={studentSearchQuery}
                                    onChange={e => setStudentSearchQuery(e.target.value)}
                                    className="h-11 rounded-xl bg-muted/10 border-muted"
                                  />
                                  {isSearchingStudents && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-primary" />}
                                  
                                  {showStudentDropdown && studentSuggestions.length > 0 && (
                                    <div className="absolute z-50 w-full mt-2 bg-popover border border-primary/20 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
                                      {studentSuggestions.map(s => (
                                        <button
                                          key={s.id}
                                          type="button"
                                          onClick={() => addTargetStudent(s)}
                                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 text-left transition-colors"
                                        >
                                          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                            {(s.full_name || "S")[0]}
                                          </div>
                                          <div className="min-w-0">
                                            <p className="font-bold text-sm tracking-tight">{s.full_name}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase font-medium">{s.grade}</p>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                
                                {targetStudentIds.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {targetStudentIds.map(id => (
                                      <Badge key={id} className="pl-3 pr-1 py-1 rounded-full bg-primary/10 text-primary border-primary/20 gap-2">
                                        <span className="text-[10px] font-bold">{id}</span>
                                        <button onClick={() => removeTargetStudent(id)} className="hover:bg-primary/20 rounded-full p-0.5">
                                          <X className="size-3" />
                                        </button>
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <DialogFooter className="gap-2">
                              <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                              <Button onClick={handleAssignHomework} className="rounded-xl px-6" disabled={!assignmentTitle || !assignmentGrade || !assignmentSubject || isSavingAssignment}>
                                {isSavingAssignment ? <><Loader2 className="size-4 animate-spin mr-2" />Processing...</> : t("dashboard.assignHomework")}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <EnterMarksDialog user={user} t={t} />

                        <Dialog open={isAnnounceDialogOpen} onOpenChange={setIsAnnounceDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="h-14 w-full rounded-2xl border-purple-200 bg-background/50 text-purple-700 font-bold group shadow-sm">
                              <Bell className="mr-2 size-5 group-hover:animate-swing transition-transform" />
                              {t("dashboard.sendAnnouncement")}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[92vw] sm:max-w-[425px] rounded-[2rem] border-purple-200 p-6 sm:p-8">
                             <DialogHeader>
                                <DialogTitle className="text-2xl font-black tracking-tight">{t("dashboard.sendAnnouncement")}</DialogTitle>
                                <DialogDescription className="font-medium">Broadcast news to all students and staff.</DialogDescription>
                             </DialogHeader>
                             <div className="grid gap-5 py-6">
                                <div className="space-y-2">
                                   <Label className="font-bold text-xs uppercase tracking-widest opacity-70">Category</Label>
                                   <Select value={annCategory} onValueChange={setAnnCategory}>
                                      <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                         <SelectItem value="announcement">Standard Announcement</SelectItem>
                                         <SelectItem value="event">Upcoming Event</SelectItem>
                                         <SelectItem value="urgent">Urgent Alert</SelectItem>
                                      </SelectContent>
                                   </Select>
                                </div>
                                <div className="space-y-2">
                                   <Label className="font-bold text-xs uppercase tracking-widest opacity-70">Headline</Label>
                                   <Input className="h-12 rounded-xl bg-muted/20" value={annTitle} onChange={e => setAnnTitle(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                   <Label className="font-bold text-xs uppercase tracking-widest opacity-70">Content</Label>
                                   <Textarea className="rounded-xl bg-muted/20 min-h-[120px]" value={annContent} onChange={e => setAnnContent(e.target.value)} />
                                </div>
                             </div>
                             <DialogFooter>
                                <Button onClick={handleSendAnnouncement} className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold" disabled={!annTitle || !annContent || isSavingAnn}>
                                   {isSavingAnn ? <Loader2 className="animate-spin size-5" /> : "Broadcast Now"}
                                </Button>
                             </DialogFooter>
                          </DialogContent>
                        </Dialog>
                    </div>
                </PremiumCard>
              </motion.div>

              {/* Quick Navigation Nebula */}
              <motion.div variants={childVariants}>
                <PremiumCard className="border-none bg-card/10">
                    <h3 className="text-lg font-extrabold mb-4 tracking-tight flex items-center gap-2">
                        <TrendingUp className="size-5 text-primary" />
                        Quick Navigation
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { label: "Messaging Center", icon: MessageSquare, color: "blue", action: () => setActiveTab("messages") },
                            { label: "Subject Management", icon: Settings, color: "indigo", link: "/portal?update=profile" },
                        ].map((action, i) => (
                            action.link ? (
                                <Link key={i} href={action.link}>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-14 rounded-2xl border bg-background/40 hover:bg-primary/5 transition-all group overflow-hidden"
                                    >
                                        <div className={cn("size-10 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform shadow-sm", `bg-${action.color}-500/10 text-${action.color}-600`)}>
                                            <action.icon className="size-5" />
                                        </div>
                                        <span className="font-bold text-sm tracking-tight">{action.label}</span>
                                        <ExternalLink className="size-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Button>
                                </Link>
                            ) : (
                                <Button
                                    key={i}
                                    onClick={action.action}
                                    variant="ghost"
                                    className="w-full justify-start h-14 rounded-2xl border bg-background/40 hover:bg-primary/5 transition-all group overflow-hidden"
                                >
                                    <div className={cn("size-10 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform shadow-sm", `bg-${action.color}-500/10 text-${action.color}-600`)}>
                                        <action.icon className="size-5" />
                                    </div>
                                    <span className="font-bold text-sm tracking-tight">{action.label}</span>
                                    <ExternalLink className="size-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Button>
                            )
                        ))}
                    </div>
                </PremiumCard>
              </motion.div>
            </div>
          </div>
            </>
          )}

          {activeTab === "courses" && (
            <div className="grid gap-8">
              {/* Quizzes Section */}
              <motion.div variants={childVariants}>
                <QuizzesSection user={user} role="teacher" t={t} />
              </motion.div>
            </div>
          )}

          {activeTab === "assignments" && (
            <div className="grid gap-8">
              {/* Submitted Marks Section */}
              <motion.div variants={childVariants}>
                <SubmittedMarksSection teacherEmail={user.email} t={t} />
              </motion.div>
            </div>
          )}

          {activeTab === "messages" && (
            <div className="grid gap-8">
              {/* Messaging Section */}
              <motion.div variants={childVariants} ref={messagingRef} className="scroll-mt-24">
                <MessagingSection user={user} t={t} />
              </motion.div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="grid gap-8">
              {/* Settings Section */}
              <motion.div variants={childVariants}>
                <SettingsSection user={user} t={t} />
              </motion.div>
            </div>
          )}

          {/* Footer Signature */}
          <motion.div variants={childVariants} className="pt-12 pb-6 flex flex-col items-center">
            <div className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl hover:border-primary/20 transition-colors group">
              <p className="text-[9px] font-bold text-muted-foreground group-hover:text-primary transition-colors uppercase tracking-widest">
                Excellence Engineered By <span className="font-black text-foreground ml-1">Dilshan Methsara</span>
              </p>
            </div>
          </motion.div>
        </AnimatedContainer>
    </ProSidebarLayout>
  )
}



// ─── Pending Approval ─────────────────────────────────────────────────────────
export function PendingApprovalScreen({ user, onLogout, onBackToWebsite }: DashboardProps) {
  const { t } = useI18n()
  const { refreshStatus } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => { refreshStatus() }, 30000)
    return () => clearInterval(interval)
  }, [refreshStatus])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshStatus()
    const { toast } = await import('sonner')
    toast.success("Security status synchronized.")
    setIsRefreshing(false)
  }

  return (
    <ProSidebarLayout user={user} onLogout={onLogout}>
      <div className="flex bg-zinc-50 dark:bg-zinc-950 items-center justify-center p-4 sm:p-6 relative z-10 w-full min-h-[80vh]">
        <div className="w-full max-w-xl text-center space-y-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="size-32 rounded-[3.5rem] bg-white dark:bg-zinc-900 shadow-aura mx-auto flex items-center justify-center relative"
          >
            <div className="absolute inset-0 rounded-[3.5rem] bg-gradient-to-tr from-amber-600/10 to-transparent animate-pulse" />
            <ShieldAlert className="size-14 text-amber-500 relative z-10" />
          </motion.div>

          <div className="space-y-6">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight uppercase">
              Account <br/> <span className="text-amber-500">Verification Pending</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-bold text-lg max-w-sm mx-auto leading-relaxed">
              Welcome back, <span className="text-indigo-600">{user.fullName}</span>. Our administrators are currently reviewing your academic credentials.
            </p>
          </div>

          <div className="grid gap-4 max-w-md mx-auto pt-8">
             <div className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-white dark:bg-zinc-900 shadow-aura border border-zinc-50 dark:border-zinc-800 text-left space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Administrative Protocol</p>
                <div className="space-y-4">
                   {[
                     "Identity Manifest Verified",
                     "Institutional Standing Audit",
                     "Portal Authorization Pending"
                   ].map((step, i) => (
                     <div key={i} className="flex items-center gap-4 group">
                        <div className={cn("size-6 rounded-full flex items-center justify-center transition-colors", i <= 1 ? "bg-emerald-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-muted-foreground")}>
                          {i <= 1 ? <Check className="size-3.5" /> : <div className="size-1.5 rounded-full bg-indigo-600 animate-pulse" />}
                        </div>
                        <span className={cn("text-xs font-black uppercase tracking-widest", i <= 1 ? "text-emerald-600" : "text-zinc-400 group-hover:text-zinc-600 transition-colors")}>{step}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          <div className="flex flex-col items-center gap-4 pt-12">
            <Button
              className="h-16 px-12 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 transition-all flex items-center gap-3 disabled:opacity-50"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? <Loader2 className="animate-spin size-5" /> : <RefreshCcw className="size-5" />}
              Synchronize Ledger
            </Button>
            <Button 
              variant="ghost" 
              onClick={onLogout}
              className="rounded-xl px-10 h-14 font-black text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all flex items-center gap-2"
            >
              <LogOut className="size-4" /> Terminate Session
            </Button>
          </div>
        </div>
      </div>
    </ProSidebarLayout>
  )
}

// ─── Profile Completion (For Old Accounts) ───────────────────────────────────
export function ProfileCompletionScreen({ user, onLogout }: { user: User; onLogout: () => void }) {
  const { t } = useI18n()
  const router = useRouter()
  const { updateProfile } = useAuth()
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(user.subjectsTaught || [])
  const [isUpdating, setIsUpdating] = useState(false)

  const toggleSubject = (s: string) => {
    setSelectedSubjects(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  const handleSave = async () => {
    if (selectedSubjects.length === 0) {
      const { toast } = await import('sonner')
      toast.error("Protocol error: No subjects selected.")
      return
    }
    setIsUpdating(true)
    const success = await updateProfile({ subjectsTaught: selectedSubjects })
    setIsUpdating(false)
    if (success) {
      router.push('/portal')
    }
  }

  const allSubjects = ['Sinhala', 'English', 'Science', 'Mathematics', 'Geography', 'ICT', 'Agri', 'Home Science', 'History', 'Drama', 'Music', 'Civic Education', 'Buddhism']

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-50/20 via-transparent to-transparent">
      <header className="sticky top-0 z-50 border-b border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl">
        <div className="container mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-[1.25rem] bg-indigo-600 flex items-center justify-center">
              <GraduationCap className="size-6 text-white" />
            </div>
            <span className="font-black text-xl tracking-tight uppercase text-zinc-900 dark:text-white">EduPortal</span>
          </div>
          <div className="flex items-center gap-4">
            {user.subjectsTaught && user.subjectsTaught.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/portal')}
                className="rounded-xl font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-indigo-600 transition-colors gap-2"
              >
                <ArrowLeft className="size-4" />
                Dashboard
              </Button>
            )}
            <Button variant="ghost" onClick={onLogout} className="rounded-xl font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-red-500 transition-colors gap-3">
              Terminate Session
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="w-full max-w-4xl space-y-12">
          <div className="text-center space-y-4">
            <Badge className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 border-none px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
              Protocol: Onboarding Phase 02
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight uppercase">
              Configure Your <br/> <span className="text-indigo-600">Educational Profile</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-bold text-lg max-w-xl mx-auto leading-relaxed">
              Welcome, <span className="text-indigo-600">{user.fullName}</span>. Define your academic expertise to initialize your personalized dashboard environment.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {allSubjects.map(s => (
              <button
                key={s}
                onClick={() => toggleSubject(s)}
                className={cn(
                  "relative h-32 rounded-[2rem] border-2 transition-all duration-500 group overflow-hidden flex flex-col items-center justify-center gap-3",
                  selectedSubjects.includes(s)
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-600/30 scale-105"
                    : "bg-white dark:bg-zinc-900 border-zinc-50 dark:border-zinc-800 text-muted-foreground/60 hover:text-indigo-600 hover:border-indigo-600/30"
                )}
              >
                <BookOpen className={cn("size-8 transition-transform group-hover:scale-110", selectedSubjects.includes(s) ? "text-indigo-200" : "text-zinc-300 dark:text-zinc-600")} />
                <span className="font-black text-[10px] uppercase tracking-widest">{t(`subjects.${s}`)}</span>
                {selectedSubjects.includes(s) && (
                  <motion.div layoutId="check" className="absolute top-4 right-4">
                    <CheckCircle className="size-5 text-white" />
                  </motion.div>
                )}
              </button>
            ))}
          </div>

          <div className="flex justify-center pt-8">
            <Button
              className="h-16 px-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              onClick={handleSave}
              disabled={isUpdating || selectedSubjects.length === 0}
            >
              {isUpdating ? <Loader2 className="mr-3 size-5 animate-spin" /> : <ShieldCheck className="mr-3 size-5 text-indigo-200" />}
              {user.subjectsTaught && user.subjectsTaught.length > 0 ? "Update Configuration" : "Initialize Environment"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Shared Components ────────────────────────────────────────────────────────
// ─── Notification System Component ───────────────────────────────────────────
function SettingsSection({ user, t }: { user: User; t: (k: string) => string }) {
  const { updateProfile } = useAuth()
  const [fullName, setFullName] = useState(user.fullName)
  const [whatsappNumber, setWhatsappNumber] = useState(user.whatsappNumber || "")
  const [isSaving, setIsSaving] = useState(false)
  
  // Password Update State
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await updateProfile({ fullName, whatsappNumber })
    setIsSaving(false)
  }

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      const { toast } = await import('sonner')
      toast.error("Passwords do not match!")
      return
    }

    if (newPassword.length < 6) {
      const { toast } = await import('sonner')
      toast.error("Password must be at least 6 characters long.")
      return
    }

    setIsUpdatingPassword(true)
    try {
      const { getAuth, updatePassword } = await import('firebase/auth')
      const auth = getAuth()
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword)
        const { toast } = await import('sonner')
        toast.success("Security credentials updated successfully!")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch (err: any) {
      console.error("Error updating password:", err)
      const { toast } = await import('sonner')
      toast.error(err.message || "An unexpected error occurred.")
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  return (
    <PremiumCard className="p-0 border-none overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white uppercase flex items-center gap-3">
          <Settings className="size-5 text-indigo-600" /> Account Settings
        </h3>
      </div>
      <div className="p-6 sm:p-8 space-y-8">
        <div className="grid gap-6">
          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase tracking-widest opacity-70">Full Name</Label>
            <Input 
              value={fullName} 
              onChange={e => setFullName(e.target.value)}
              className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-4 font-bold"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase tracking-widest opacity-70">WhatsApp Number</Label>
            <Input 
              value={whatsappNumber} 
              onChange={e => setWhatsappNumber(e.target.value)}
              placeholder="e.g. +947xxxxxxxx"
              className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-4 font-bold"
            />
          </div>
          <div className="p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 space-y-1">
             <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">System Identity</p>
             <p className="text-sm font-bold text-zinc-900 dark:text-zinc-400">{user.email} <span className="mx-2 opacity-20">|</span> {user.role.toUpperCase()}</p>
          </div>
        </div>

        {user.role === 'teacher' && (
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
             <Link href="/portal?update=profile">
               <Button variant="outline" className="w-full h-14 rounded-2xl border-indigo-200 text-indigo-700 font-bold gap-3 group">
                 <BookOpen className="size-5 group-hover:scale-110 transition-transform" />
                 Manage Teaching Subjects
               </Button>
             </Link>
          </div>
        )}

        <Button 
          onClick={handleSave} 
          disabled={isSaving || (fullName === user.fullName && whatsappNumber === (user.whatsappNumber || ""))}
          className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20"
        >
          {isSaving ? <Loader2 className="animate-spin size-5" /> : "Save Profile Details"}
        </Button>

        <div className="pt-10 space-y-8 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
             <div className="size-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 shadow-sm">
                <Lock className="size-4" />
             </div>
             <h4 className="text-xs font-black uppercase tracking-[0.25em] text-zinc-900 dark:text-white">Security & Privacy</h4>
          </div>

          <div className="grid gap-6">
            <div className="space-y-2 relative">
              <Label className="font-bold text-xs uppercase tracking-widest opacity-70">New Secure Password</Label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"}
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-4 font-bold pr-12"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-indigo-600"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-widest opacity-70">Confirm New Password</Label>
              <Input 
                type="password"
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)}
                className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-4 font-bold"
              />
            </div>
          </div>

          <Button 
            onClick={handleUpdatePassword} 
            disabled={isUpdatingPassword || !newPassword || newPassword !== confirmPassword}
            variant="outline"
            className="w-full h-14 rounded-2xl border-rose-200 text-rose-600 font-black text-sm uppercase tracking-[0.2em] hover:bg-rose-50 dark:hover:bg-rose-500/10"
          >
            {isUpdatingPassword ? <Loader2 className="animate-spin size-5" /> : "Update Security Protocol"}
          </Button>
        </div>
      </div>
    </PremiumCard>
  )
}

function NotificationBell({ user }: { user: User }) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  useEffect(() => {
    loadNotifications()
    
    // Subscribe to new notifications in Firestore
    const notificationsRef = collection(db, 'notifications')
    const q = query(
      notificationsRef, 
      where('user_email', '==', user.email.toLowerCase()),
      orderBy('created_at', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setNotifications(data)
      setUnreadCount(data.filter((n: any) => !n.is_read).length)
    })

    return () => unsubscribe()
  }, [user.email])

  const loadNotifications = async () => {
    const notificationsRef = collection(db, 'notifications')
    const q = query(
      notificationsRef, 
      where('user_email', '==', user.email.toLowerCase()),
      orderBy('created_at', 'desc'),
      limit(20)
    )
    
    const querySnapshot = await getDocs(q)
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    setNotifications(data)
    setUnreadCount(data.filter((n: any) => !n.is_read).length)
  }

  const markAllAsRead = async () => {
    if (unreadCount === 0) return
    const unreadNotifications = notifications.filter(n => !n.is_read)
    
    for (const n of unreadNotifications) {
      const docRef = doc(db, 'notifications', n.id)
      await updateDoc(docRef, { is_read: true })
    }
    
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  return (
    <Popover onOpenChange={(open) => { if (open && unreadCount > 0) markAllAsRead() }}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 group">
          <Bell className="size-5 text-muted-foreground group-hover:text-indigo-600 transition-colors" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 flex items-center justify-center p-0.5 text-[8px] font-black bg-indigo-600 text-white border-2 border-background rounded-full animate-in zoom-in duration-300">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 rounded-[2rem] shadow-2xl border-none overflow-hidden bg-white dark:bg-zinc-900 mt-4" align="end">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-900 dark:text-white">Notifications</h4>
          {unreadCount > 0 && (
             <Button variant="ghost" size="sm" className="h-7 text-[8px] uppercase font-black tracking-widest text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 p-2" onClick={markAllAsRead}>
               Mark all as read
             </Button>
          )}
        </div>
        <ScrollArea className="h-[450px]">
          {notifications.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="size-16 rounded-3xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-2 opacity-40 shadow-inner">
                <Bell className="size-8 text-muted-foreground" />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">System Quiet<br/><span className="opacity-50">No new alerts found</span></p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {notifications.map((n) => (
                <div key={n.id} className={cn(
                  "p-6 transition-all hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 cursor-pointer relative group/item", 
                  !n.is_read && "bg-indigo-50/30 dark:bg-indigo-500/5"
                )}>
                  <div className="flex gap-4">
                    <div className={cn(
                      "size-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover/item:scale-110",
                      n.type === 'message' ? "bg-white dark:bg-zinc-700 text-blue-500" :
                      n.type === 'announcement' ? "bg-white dark:bg-zinc-700 text-amber-500" :
                      n.type === 'assignment' ? "bg-white dark:bg-zinc-700 text-emerald-500" :
                      n.type === 'quiz' ? "bg-white dark:bg-zinc-700 text-indigo-500" :
                      "bg-white dark:bg-zinc-700 text-muted-foreground"
                    )}>
                       {n.type === 'message' ? <MessageSquare className="size-4" /> :
                        n.type === 'announcement' ? <Bell className="size-4" /> :
                        n.type === 'assignment' ? <FileText className="size-4" /> :
                        n.type === 'quiz' ? <GraduationCap className="size-4" /> :
                        <Bell className="size-4" />}
                    </div>
                    <div className="space-y-1 overflow-hidden flex-1">
                      <p className="text-sm font-bold text-zinc-900 dark:text-white truncate group-hover/item:text-indigo-600 transition-colors">{n.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium">{n.content}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mt-3 flex items-center gap-1.5">
                         <div className="size-1 rounded-full bg-indigo-500" />
                         {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!n.is_read && <div className="size-2 rounded-full bg-indigo-600 shrink-0 mt-3 shadow-sm shadow-indigo-600/50" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

function DashboardHeader({ user, onLogout, onBackToWebsite }: { user: User; onLogout: () => void; onBackToWebsite?: () => void }) {
  const { t, language } = useI18n()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={cn(
      "sticky top-0 z-[100] transition-all duration-700 ease-in-out",
      isScrolled ? "py-3" : "py-6"
    )}>
      <div className="container mx-auto px-4">
        <motion.div 
          className={cn(
            "rounded-[2.5rem] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl px-6 sm:px-12 h-20 flex items-center justify-between transition-all duration-500 border border-zinc-50 dark:border-zinc-800 shadow-aura",
            isScrolled ? "shadow-2xl shadow-indigo-500/10 border-indigo-500/20" : ""
          )}
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        >
          <div className="flex items-center gap-5">
            <div className="size-12 rounded-[1.25rem] bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/30 group">
              <GraduationCap className="size-7 text-white group-hover:rotate-12 transition-transform duration-500" />
            </div>
            <div className="hidden sm:block">
               <span className="font-black text-2xl tracking-tight text-zinc-900 dark:text-white block leading-none mb-1">DAMPELLA</span>
               <span className="text-[10px] uppercase font-black tracking-[0.3em] text-indigo-600/80">{t(`common.${user.role}`)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-8">
            <div className="hidden lg:flex items-center gap-2 pr-8 border-r border-zinc-100 dark:border-zinc-800">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBackToWebsite} 
                className="rounded-full font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-indigo-600 gap-3 hover:bg-transparent transition-all"
              >
                <ArrowLeft className="size-4" />
                {language === 'en' ? 'Exit Portal' : 'පිටවීම'}
              </Button>
            </div>

            <div className="flex items-center gap-2 sm:gap-5">
              <LanguageToggle />
              <ThemeToggle />
              <NotificationBell user={user} />
            </div>

            <div className="h-10 w-px bg-zinc-100 dark:bg-zinc-800 hidden sm:block" />

            <div className="flex items-center gap-5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-1">{user.fullName}</p>
                <div className="flex items-center justify-end gap-2">
                   <div className="size-1.5 rounded-full bg-emerald-500" />
                   <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">{language === 'en' ? 'Online' : 'සක්‍රියයි'}</p>
                </div>
              </div>
              <Avatar className="size-12 rounded-2xl border-none shadow-xl ring-4 ring-indigo-500/5 transition-transform hover:scale-105 duration-500">
                <AvatarFallback className="bg-indigo-50 dark:bg-zinc-800 text-indigo-600 text-xs font-black rounded-none">
                  {user.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onLogout} 
                className="size-12 rounded-2xl hover:bg-red-50 dark:hover:bg-red-500/10 group transition-all"
              >
                <LogOut className="size-6 text-muted-foreground group-hover:text-red-500 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  )
}


