"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot,
  orderBy,
  limit
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { User } from "@/lib/portal/auth-context"
import { createNotification } from "@/lib/portal/notifications"
import { cn } from "@/lib/utils"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Loader2, 
  ChevronRight, 
  Rocket, 
  ShieldCheck, 
  Clock, 
  CheckCircle,
  FileText,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  ExternalLink,
  BarChart3,
  Download,
  AlertTriangle,
  PlayCircle,
  Bell
} from "lucide-react"
import { LMSCard, LMSEmptyState } from "./shared"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/lib/portal/i18n-context"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

// ─── Announcements Section ───────────────────────────────────────────────────
export function AnnouncementsSection({ gradeClass, t }: { gradeClass?: string; t: (k: string) => string }) {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true)
      try {
        const annRef = collection(db, 'announcements')
        const q = query(annRef, orderBy('date', 'desc'), limit(5))
        const querySnapshot = await getDocs(q)
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        
        const filtered = data.filter(a => 
          !a.grade || a.grade === "global" || (gradeClass && a.grade === gradeClass)
        )
        
        setAnnouncements(filtered)
      } catch (err) {
        console.error("Error fetching dashboard announcements:", err)
      }
      setLoading(false)
    }
    fetchAnnouncements()
  }, [gradeClass])

  return (
    <LMSCard className="p-0 border-none overflow-hidden" variants={null}>
      <div className="p-8 bg-surface-lowest/50 flex items-center justify-between">
        <h3 className="text-xl font-black tracking-tight text-foreground uppercase">
           Institutional Bulletins
        </h3>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
      </div>
      <div className="p-8">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : announcements.length === 0 ? (
          <LMSEmptyState 
            icon="bell_off" 
            message="No Active Bulletins" 
            sub="Stay tuned for upcoming institutional updates and academic news." 
          />
        ) : (
          <div className="space-y-4">
            {announcements.map(ann => (
              <div key={ann.id} className="group flex gap-6 p-6 rounded-[2.5rem] bg-surface-lowest hover:bg-white hover:shadow-aura transition-all duration-700 cursor-pointer">
                <div className="size-16 rounded-[1.5rem] bg-secondary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Bell className="size-7 text-secondary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-secondary/10 text-secondary border-none px-2 py-0.5 rounded-full text-[8px] font-black uppercase">
                       {ann.category || "General"}
                    </Badge>
                    <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                       {new Date(ann.date || ann.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-black text-lg text-foreground tracking-tighter uppercase leading-tight mb-2">{ann.title}</h4>
                  <p className="text-xs font-medium text-muted-foreground line-clamp-2 leading-relaxed">
                    {ann.summary || ann.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </LMSCard>
  )
}

// ─── Submission Dialog (Student) ───────────────────────────────────────────
export function SubmissionDialog({ assignment, user, t }: { assignment: any; user: User; t: (k: string) => string }) {
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
        teacher_email: assignment.teacher_email.toLowerCase(),
        student_email: user.email.toLowerCase(),
        student_name: user.fullName,
        content: content,
        status: 'submitted',
        updated_at: new Date().toISOString()
      }

      if (existingSubmission) {
        await updateDoc(doc(db, 'assignment_submissions', existingSubmission.id), payload)
      } else {
        payload.created_at = new Date().toISOString()
        payload.grade = assignment.grade
        payload.subject = assignment.subject
        await addDoc(collection(db, 'assignment_submissions'), payload)
      }

      // Trigger Teacher Notification
      try {
        const teacherQuery = query(
          collection(db, "profiles"),
          where("role", "in", ["teacher", "admin"]),
          where("email", "==", assignment.teacher_email.toLowerCase())
        );
        const tSnap = await getDocs(teacherQuery);
        if (!tSnap.empty) {
          const teacher = tSnap.docs[0];
          await createNotification({
            userId: teacher.id,
            user_email: assignment.teacher_email.toLowerCase(),
            senderId: user.uid,
            senderName: user.fullName || 'Student',
            title: 'New Assignment Submission',
            message: `${user.fullName} has submitted the manual assignment: ${assignment.title}.`,
            type: 'submission',
            icon: 'how_to_reg',
            link: 'Grading'
          });
        }
      } catch (err) {
        console.error("Teacher notification error:", err);
      }

      const { toast } = await import('sonner')
      toast.success("Mission data transmitted successfully.")
      setOpen(false)
    } catch (err: any) {
      console.error("Submission error:", err)
      const { toast } = await import('sonner')
      toast.error(`Transmission Failed: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-xl h-10 px-5 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 group"
        >
          {existingSubmission ? 'Resubmit' : 'Engage'} 
          <ChevronRight className="size-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[550px] rounded-[2rem] sm:rounded-[2.5rem] border-none shadow-aura bg-background p-6 sm:p-10">
        <DialogHeader className="mb-8">
           <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="border-primary/20 text-primary px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                 {assignment.grade} • {assignment.subject}
              </Badge>
           </div>
           <DialogTitle className="text-2xl font-black tracking-tighter text-foreground leading-tight uppercase">{assignment.title}</DialogTitle>
           <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1">Submit your academic mission findings.</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-8">
           <div className="p-6 rounded-[1.5rem] bg-surface-container-low border border-surface-container-high">
              <p className="text-xs font-medium text-muted-foreground leading-relaxed whitespace-pre-wrap">{assignment.description || 'No instructions provided.'}</p>
           </div>

           <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground px-1">Response Transmission</Label>
              <Textarea 
                placeholder="Type your response here..." 
                className="min-h-[200px] rounded-[1.5rem] p-6 bg-surface-container-highest border-none font-medium text-sm focus:ring-primary focus:bg-surface-container-lowest transition-all"
                value={content}
                onChange={e => setContent(e.target.value)}
              />
           </div>
        </div>

        <DialogFooter className="mt-10 gap-3">
           <Button variant="ghost" className="rounded-xl font-black text-xs uppercase tracking-widest text-muted-foreground" onClick={() => setOpen(false)}>Abort</Button>
           <Button 
             onClick={handleSubmit} 
             disabled={isSubmitting || !content.trim()} 
             className="lms-btn-primary h-14 px-10 min-w-[200px]"
           >
             {isSubmitting ? <Loader2 className="animate-spin size-4" /> : <Rocket className="size-4 mr-3" />}
             Execute Payload
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Past Papers Section ─────────────────────────────────────────────────────
export function PastPapersSection({ gradeClass, t }: { gradeClass?: string; t: (k: string) => string }) {
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
    <LMSCard className="p-0 border-none overflow-hidden" variants={null}>
      <div className="p-8 bg-surface-lowest/50 flex items-center justify-between">
        <h3 className="text-xl font-black tracking-tight text-foreground uppercase">
           {t("dashboard.pastPapers")}
        </h3>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
      </div>
      <div className="p-8">
        {!gradeClass ? (
          <LMSEmptyState icon="folder_off" message="Grade Registry Missing" sub="Configure your academic profile to access papers." />
        ) : isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : papers.length === 0 ? (
          <LMSEmptyState
            icon="inventory_2"
            message="No Archive Data"
            sub="Past papers for your grade have not been initialized yet."
          />
        ) : (
          <Tabs defaultValue={activeTabs[0]?.[0] || "Term 1"} className="w-full">
            <TabsList className="w-full mb-10 flex overflow-x-auto justify-start bg-surface-container-low p-1.5 rounded-full h-auto">
              {activeTabs.map(([term]) => (
                <TabsTrigger 
                  key={term} 
                  value={term} 
                  className="px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary transition-all"
                >
                  {term}
                </TabsTrigger>
              ))}
            </TabsList>
            {activeTabs.map(([term, termPapers]) => (
              <TabsContent key={term} value={term} className="space-y-4 mt-0">
                {termPapers.map(paper => (
                  <div key={paper.id} className="group flex items-center gap-5 p-5 rounded-[1.5rem] bg-surface-lowest hover:bg-white hover:shadow-aura transition-all duration-700 cursor-pointer">
                    <div className="size-14 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <FileText className="size-6 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-base text-foreground tracking-tight uppercase truncate">{paper.title}</p>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/60 mt-1">{paper.subject}{paper.year ? ` · ${paper.year}` : ""}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="rounded-full h-10 px-6 font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary/5 transition-all"
                      onClick={() => window.open(paper.file_url, '_blank')}
                    >
                      {language === 'en' ? 'Download' : 'භාගත කරන්න'}
                    </Button>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </LMSCard>
  )
}

// ─── My Marks Section ────────────────────────────────────────────────────────
export function MyMarksSection({ user, t }: { user: any; t: (k: string) => string }) {
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
    if (score >= 90) return { label: 'A+', color: 'text-emerald-600', bg: 'bg-emerald-500/10' }
    if (score >= 80) return { label: 'A', color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
    if (score >= 70) return { label: 'B', color: 'text-blue-500', bg: 'bg-blue-500/10' }
    if (score >= 60) return { label: 'C', color: 'text-amber-500', bg: 'bg-amber-500/10' }
    if (score >= 50) return { label: 'S', color: 'text-orange-500', bg: 'bg-orange-500/10' }
    return { label: 'F', color: 'text-red-500', bg: 'bg-red-500/10' }
  }

  return (
    <LMSCard className="p-0 border-none overflow-hidden" variants={null}>
      <div className="p-8 bg-surface-lowest/50 flex items-center justify-between">
        <h3 className="text-xl font-black tracking-tight text-foreground uppercase">
           {t('dashboard.recentMarks')}
        </h3>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
      </div>
      <div className="p-8">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : marks.length === 0 ? (
          <LMSEmptyState
            icon="monitoring"
            message="No Academic Records"
            sub="Your performance data will appear here once faculty records are synchronized."
          />
        ) : (
          <div className="space-y-4">
            {marks.map(mark => {
              const grade = getGrade(mark.score)
              return (
                <div key={mark.id} className="group flex items-center gap-6 p-6 rounded-[2rem] bg-surface-lowest hover:bg-white hover:shadow-aura transition-all duration-700 cursor-pointer">
                  <div className={cn(
                    "size-20 rounded-[1.5rem] flex items-center justify-center font-black text-3xl shrink-0 transition-transform group-hover:scale-105 shadow-sm",
                    grade.bg,
                    grade.color
                  )}>
                    {grade.label}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-xl text-foreground tracking-tighter uppercase">{mark.subject}</p>
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mt-1">
                      {mark.term ? `${mark.term} · ` : ''}{new Date(mark.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn("text-4xl font-black tracking-tighter", grade.color)}>{mark.score}</p>
                    <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mt-1">/ 100 PTS</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </LMSCard>
  )
}

// ─── Quiz Module (Student) ──────────────────────────────────────────────────
export function QuizTakeDialog({ quiz, user, t }: { quiz: any; user: User; t: (k: string) => string }) {
  const { language } = useI18n()
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
        teacher_email: quiz.teacher_email || 'unknown',
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
        <Button 
          size="sm" 
          variant="ghost" 
          className="rounded-xl h-10 px-5 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 group"
        >
          Begin <PlayCircle className="size-3.5 ml-2 group-hover:scale-125 transition-transform" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[700px] max-h-[90vh] flex flex-col rounded-[2.5rem] border-none shadow-aura bg-background p-6 sm:p-10">
        <DialogHeader className="mb-10">
          <DialogTitle className="text-3xl font-black tracking-tighter text-foreground uppercase leading-none">{quiz.title}</DialogTitle>
          <div className="flex items-center gap-3 mt-4">
             <Badge className="bg-primary/10 text-primary border-none px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
               {quiz.subject}
             </Badge>
             <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50">
               {quiz.grade}
             </span>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          {step === 'intro' && (
            <div className="space-y-12 text-center py-12">
              <div className="size-28 rounded-[3rem] bg-surface-container-low flex items-center justify-center mx-auto shadow-sm">
                <BrainCircuit className="size-12 text-primary" />
              </div>
              <div className="space-y-4">
                <p className="text-3xl font-black tracking-tighter text-foreground uppercase">Initiate Assessment</p>
                <p className="text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed">{quiz.description || "Take this verified assessment to validate your module understanding."}</p>
              </div>
              <Button onClick={loadQuestions} className="lms-btn-primary h-16 px-16 bg-primary" disabled={loading}>
                {loading ? <Loader2 className="animate-spin size-5 mr-3" /> : "Initiate Protocol"}
              </Button>
            </div>
          )}

          {step === 'active' && (
            <div className="space-y-12 pb-10">
              {questions.map((q, idx) => {
                const questionText = getLang(q.question_text, q.question_text_si)
                return (
                  <div key={q.id} className="space-y-8">
                    <div className="flex gap-6">
                      <span className="text-3xl font-black text-primary/10">0{idx + 1}</span>
                      <div className="flex-1">
                        <p className="text-xl font-bold tracking-tight text-foreground leading-tight uppercase">
                          {questionText}
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-3 pl-12">
                      {(q.options || []).map((opt: string, oIdx: number) => {
                        const displayOpt = getLang(opt, q.options_si?.[oIdx])
                        const isSelected = answers[q.id] === oIdx
                        return (
                          <button
                            key={oIdx}
                            onClick={() => setAnswers({ ...answers, [q.id]: oIdx })}
                            className={cn(
                              "group w-full text-left p-6 rounded-[1.5rem] border transition-all duration-500 flex items-center gap-5",
                              isSelected
                                ? "bg-primary border-primary text-white shadow-xl shadow-primary/20"
                                : "bg-surface-container-low border-surface-container-high hover:border-primary/50 hover:bg-background"
                            )}
                          >
                            <div className={cn(
                              "size-10 rounded-xl flex items-center justify-center font-black text-xs transition-colors",
                              isSelected ? "bg-white/20 text-white" : "bg-surface-container-high text-muted-foreground group-hover:text-primary"
                            )}>
                              {String.fromCharCode(65 + oIdx)}
                            </div>
                            <span className="font-black tracking-tight uppercase text-sm">{displayOpt}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
              <div className="pt-10 border-t border-surface-container-highest">
                 <Button onClick={handleFinish} className="w-full h-18 rounded-[2rem] bg-primary text-white font-black text-xl uppercase tracking-widest shadow-2xl shadow-primary/30" disabled={isSubmitting || Object.keys(answers).length < questions.length}>
                   {isSubmitting ? <Loader2 className="animate-spin size-6" /> : <Rocket className="size-6 mr-3 text-white/50" />}
                   Transmit Results
                 </Button>
              </div>
            </div>
          )}

          {step === 'result' && (
            <div className="space-y-16 text-center py-12">
              <div className="space-y-8">
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">Performance Manifest</p>
                <div className="relative inline-block">
                    <div className="text-[10rem] font-black text-foreground leading-none tracking-tighter">
                      {score}<span className="text-muted-foreground text-4xl font-black">/{total}</span>
                    </div>
                </div>
                <div className={cn(
                   "inline-flex items-center gap-3 px-8 py-3 rounded-full font-black uppercase tracking-[0.25em] text-[10px]",
                   score/total >= 0.8 ? "bg-emerald-500/10 text-emerald-600" : 
                   score/total >= 0.5 ? "bg-primary/10 text-primary" : "bg-red-500/10 text-red-600"
                )}>
                  {score/total >= 0.8 ? "Exceptional" : score/total >= 0.5 ? "Verified" : "Re-Authorization Advised"}
                </div>
              </div>
              <LMSCard className="bg-surface-container-low border-none max-w-sm mx-auto p-8">
                 <div className="flex items-center gap-4 text-emerald-600 mb-4">
                    <ShieldCheck className="size-6" />
                    <h4 className="text-xs font-black uppercase tracking-widest">Protocol Sync Complete</h4>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-relaxed">Your academic scores have been decentralized and synchronized with the primary institutional ledger.</p>
              </LMSCard>
              <Button variant="ghost" className="rounded-xl font-black text-[10px] uppercase tracking-widest text-muted-foreground" onClick={() => setOpen(false)}>Terminate Session</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function QuizzesSection({ user, role, t }: { user: User; role: 'student' | 'teacher'; t: (k: string) => string }) {
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
    }
  }

  useEffect(() => { loadData() }, [user.gradeClass, user.email, role])

  return (
    <LMSCard className="p-0 border-none overflow-hidden" variants={null}>
      <div className="p-8 bg-surface-lowest/50 flex items-center justify-between">
        <h3 className="text-xl font-black tracking-tight text-foreground uppercase">
           Assignments & Assessments
        </h3>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
      </div>
      <div className="p-8">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : quizzes.length === 0 ? (
          <LMSEmptyState 
            icon="quiz" 
            message="No Active Assessments" 
            sub="Course modules are currently being synchronized by the faculty." 
          />
        ) : (
          <div className="grid gap-4">
            {quizzes.map(q => (
              <div key={q.id} className="group flex items-center justify-between p-6 rounded-[2rem] bg-surface-lowest hover:bg-white hover:shadow-aura transition-all duration-700 cursor-pointer">
                <div className="flex items-center gap-6">
                  <div className="size-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <BrainCircuit className="size-7 text-primary" />
                  </div>
                  <div>
                      <p className="font-black text-xl text-foreground tracking-tighter uppercase leading-none mb-2">{q.title}</p>
                      <div className="flex items-center gap-4">
                         <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{q.subject} • {q.grade}</p>
                         {role === 'student' && q.quiz_attempts?.[0]?.count > 0 && (
                           <Badge className="bg-emerald-500/10 text-emerald-600 border-none px-2 py-0.5 rounded-full text-[8px] font-black">COMPLETED</Badge>
                         )}
                      </div>
                  </div>
                </div>
                <QuizTakeDialog quiz={q} user={user} t={t} />
              </div>
            ))}
          </div>
        )}
      </div>
    </LMSCard>
  )
}
