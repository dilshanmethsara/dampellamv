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
  deleteDoc,
  orderBy,
  onSnapshot 
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { User } from "@/lib/portal/auth-context"
import { notifyGrade, notifyAllStudents } from "@/lib/portal/notifications"
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
  PlusCircle, 
  Trash, 
  FileText, 
  ShieldCheck, 
  CheckCircle,
  AlertTriangle,
  BrainCircuit,
  MessageSquare,
  Send,
  Users,
  ChevronRight,
  Rocket
} from "lucide-react"
import { LMSCard, LMSEmptyState } from "./shared"
import { useI18n } from "@/lib/portal/i18n-context"

// ─── Assignment Create Dialog ────────────────────────────────────────────────
export function AssignmentCreateDialog({ user, onCreated }: { user: User; onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [subject, setSubject] = useState("")
  const [grade, setGrade] = useState("")

  const handleCreate = async () => {
    if (!title || !subject || !grade) return
    setIsLoading(true)
    try {
        created_at: new Date().toISOString()
      })

      // Trigger Notifications for all students in the grade
      await notifyGrade(grade, {
        senderId: user.uid,
        senderName: user.fullName || 'Faculty',
        title: 'New Mission Assigned',
        message: `A new assignment "${title}" has been published for ${subject}.`,
        type: 'assignment',
        icon: 'assignment',
        link: 'Assignments'
      });

      const { toast } = await import('sonner')
      toast.success("Academic mission initialized.")
      setOpen(false)
      onCreated()
      setTitle("")
      setDescription("")
      setSubject("")
      setGrade("")
    } catch (err) {
      console.error("Assignment create error:", err)
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="lms-btn-primary h-14 px-8 bg-secondary shadow-secondary/10">
          <PlusCircle className="size-4 mr-3" /> New Assignment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] border-none shadow-aura bg-background p-10">
        <DialogHeader className="mb-8">
          <DialogTitle className="text-3xl font-black tracking-tighter text-foreground uppercase">New Mission</DialogTitle>
          <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1">Define academic requirements for the student cohort.</DialogDescription>
        </DialogHeader>
        <div className="space-y-8">
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground px-1">Mission Title</Label>
            <Input placeholder="Unit 04: Quantum Mechanics" value={title} onChange={e => setTitle(e.target.value)} className="h-14 rounded-2xl bg-surface-container-highest border-none px-6 font-bold text-sm focus:ring-secondary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground px-1">Subject</Label>
                <Input placeholder="Physics" value={subject} onChange={e => setSubject(e.target.value)} className="h-14 rounded-2xl bg-surface-container-highest border-none px-6 font-bold text-sm focus:ring-secondary" />
             </div>
             <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground px-1">Grade</Label>
                <Input placeholder="11" value={grade} onChange={e => setGrade(e.target.value)} className="h-14 rounded-2xl bg-surface-container-highest border-none px-6 font-bold text-sm focus:ring-secondary" />
             </div>
          </div>
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground px-1">Directives</Label>
            <Textarea placeholder="Define instructions or research goals..." value={description} onChange={e => setDescription(e.target.value)} className="min-h-[150px] rounded-[1.5rem] bg-surface-container-highest border-none p-6 font-medium text-sm focus:ring-secondary resize-none" />
          </div>
        </div>
        <DialogFooter className="mt-10 gap-3">
          <Button variant="ghost" className="rounded-xl font-black text-xs uppercase tracking-widest text-muted-foreground" onClick={() => setOpen(false)}>Abort</Button>
          <Button onClick={handleCreate} disabled={isLoading || !title} className="lms-btn-primary h-14 px-10 bg-secondary">
            {isLoading ? <Loader2 className="animate-spin size-4" /> : <Rocket className="size-4 mr-3" />}
            Execute Release
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Broadcast Dialog ────────────────────────────────────────────────────────
export function BroadcastDialog({ user, onSent }: { user: User; onSent: () => void }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [type, setType] = useState("Information")

  const handleBroadcast = async () => {
    if (!title || !content) return
    setIsLoading(false)
    try {
        created_at: new Date().toISOString()
      })

      // Trigger Global Notifications
      await notifyAllStudents({
        senderId: user.uid,
        senderName: user.fullName || 'Faculty',
        title: `Broadcast: ${title}`,
        message: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        type: 'admin',
        icon: type === 'Urgent' ? 'warning' : 'campaign',
        link: 'Dashboard'
      });

      const { toast } = await import('sonner')
      toast.success("Broadcast frequency established.")
      setOpen(false)
      onSent()
      setTitle("")
      setContent("")
    } catch (err) {
      console.error("Broadcast error:", err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="lms-btn-primary h-12 px-8 bg-secondary shadow-secondary/10">
           New Broadcast
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] border-none shadow-aura bg-background p-10">
        <DialogHeader className="mb-8">
          <DialogTitle className="text-3xl font-black tracking-tighter text-foreground uppercase">System Broadcast</DialogTitle>
          <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1">Dispatch high-priority communications to the cohort.</DialogDescription>
        </DialogHeader>
        <div className="space-y-8">
           <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground px-1">Classification</Label>
              <div className="flex gap-2">
                 {['Information', 'Urgent', 'Holiday', 'Protocol'].map(t => (
                    <button 
                      key={t}
                      onClick={() => setType(t)}
                      className={cn(
                        "px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all",
                        type === t ? "bg-secondary border-secondary text-white" : "border-surface-container-highest text-muted-foreground hover:border-secondary/40"
                      )}
                    >
                       {t}
                    </button>
                 ))}
              </div>
           </div>
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground px-1">Headline</Label>
            <Input placeholder="Emergency Revision Protocol" value={title} onChange={e => setTitle(e.target.value)} className="h-14 rounded-2xl bg-surface-container-highest border-none px-6 font-bold text-sm focus:ring-secondary" />
          </div>
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground px-1">Body Transmission</Label>
            <Textarea placeholder="Enter broadcast details..." value={content} onChange={e => setContent(e.target.value)} className="min-h-[150px] rounded-[1.5rem] bg-surface-container-highest border-none p-6 font-medium text-sm focus:ring-secondary resize-none" />
          </div>
        </div>
        <DialogFooter className="mt-10 gap-3">
          <Button variant="ghost" className="rounded-xl font-black text-xs uppercase tracking-widest text-muted-foreground" onClick={() => setOpen(false)}>Abort</Button>
          <Button onClick={handleBroadcast} disabled={isLoading || !title} className="lms-btn-primary h-14 px-10 bg-secondary">
            {isLoading ? <Loader2 className="animate-spin size-4" /> : <Send className="size-4 mr-3" />}
            Initiate Dispatch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Quiz Creator Module ─────────────────────────────────────────────────────
export function QuizCreator({ user, onQuizCreated }: { user: User; onQuizCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [subject, setSubject] = useState("")
  const [grade, setGrade] = useState("")
  const [questions, setQuestions] = useState<any[]>([
    { question_text: "", options: ["", "", "", ""], correct_option_index: 0, points: 1 }
  ])

  const addQuestion = () => {
    setQuestions([...questions, { question_text: "", options: ["", "", "", ""], correct_option_index: 0, points: 1 }])
  }

  const updateQuestion = (idx: number, field: string, val: any) => {
    const next = [...questions]
    next[idx] = { ...next[idx], [field]: val }
    setQuestions(next)
  }

  const updateOption = (qIdx: number, oIdx: number, val: string) => {
    const next = [...questions]
    const opts = [...next[qIdx].options]
    opts[oIdx] = val
    next[qIdx].options = opts
    setQuestions(next)
  }

  const handleCreate = async () => {
    if (!title || questions.some(q => !q.question_text)) return
    setIsSaving(true)
    try {
      const quizRef = await addDoc(collection(db, 'quizzes'), {
        title,
        description,
        subject,
        grade,
        teacher_email: user.email.toLowerCase(),
        teacher_name: user.fullName,
        created_at: new Date().toISOString()
      })

      // Add sub-collection questions
      for (const q of questions) {
        await addDoc(collection(db, 'quizzes', quizRef.id, 'questions'), q)
      }

      // Trigger Notifications
      await notifyGrade(grade, {
        senderId: user.uid,
        senderName: user.fullName || 'Faculty',
        title: 'New Quiz Lab Session',
        message: `An assessment for ${subject} (${title}) is now active in the Quiz Lab.`,
        type: 'quiz',
        icon: 'biotech',
        link: 'Lab'
      });

      const { toast } = await import('sonner')
      toast.success("Assessment matrix synthesized.")
      setOpen(false)
      onQuizCreated()
    } catch (err) {
      console.error("Quiz create error:", err)
    }
    setIsSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="rounded-xl h-10 px-5 text-[10px] font-black uppercase tracking-widest text-secondary border-secondary/20 hover:bg-secondary/5">
          <BrainCircuit className="size-4 mr-2" /> Synthesize Quiz
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col rounded-[2.5rem] bg-background border-none p-10">
        <DialogHeader className="mb-10">
          <DialogTitle className="text-3xl font-black tracking-tighter text-foreground uppercase">Assessment Architect</DialogTitle>
          <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1">Design verification protocols for evaluating student competency.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-4 space-y-12 custom-scrollbar">
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                 <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground px-1">Quiz Identifier</Label>
                 <Input placeholder="Periodic Table Mastery" value={title} onChange={e => setTitle(e.target.value)} className="h-14 rounded-2xl bg-surface-container-highest border-none px-6 font-bold text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground px-1">Subject</Label>
                    <Input placeholder="Chemistry" value={subject} onChange={e => setSubject(e.target.value)} className="h-14 rounded-2xl bg-surface-container-highest border-none px-6 font-bold text-sm" />
                 </div>
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground px-1">Grade</Label>
                    <Input placeholder="11" value={grade} onChange={e => setGrade(e.target.value)} className="h-14 rounded-2xl bg-surface-container-highest border-none px-6 font-bold text-sm" />
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              {questions.map((q, qIdx) => (
                 <div key={qIdx} className="p-8 rounded-[2rem] bg-surface-container-low border border-surface-container-high space-y-6">
                    <div className="flex items-center justify-between">
                       <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Question Vector 0{qIdx + 1}</h5>
                       {questions.length > 1 && (
                          <Button variant="ghost" size="icon" className="size-8 rounded-xl text-red-500 hover:bg-red-500/10" onClick={() => setQuestions(questions.filter((_, i) => i !== qIdx))}>
                             <Trash className="size-4" />
                          </Button>
                       )}
                    </div>
                    <Textarea 
                      placeholder="Define the problem statement..." 
                      value={q.question_text} 
                      onChange={e => updateQuestion(qIdx, 'question_text', e.target.value)}
                      className="min-h-[100px] rounded-2xl bg-surface-container-highest border-none p-6 font-medium text-sm"
                    />
                    <div className="grid grid-cols-2 gap-4">
                       {q.options.map((opt: string, oIdx: number) => (
                          <div key={oIdx} className="flex items-center gap-4 bg-surface-container-highest p-4 rounded-xl">
                             <input 
                               type="radio" 
                               name={`correct-${qIdx}`} 
                               checked={q.correct_option_index === oIdx} 
                               onChange={() => updateQuestion(qIdx, 'correct_option_index', oIdx)}
                               className="accent-secondary size-4"
                             />
                             <Input 
                               placeholder={`Option ${String.fromCharCode(65 + oIdx)}`} 
                               value={opt} 
                               onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                               className="h-8 border-none bg-transparent p-0 text-sm font-bold uppercase tracking-tight"
                             />
                          </div>
                       ))}
                    </div>
                 </div>
              ))}
              <Button onClick={addQuestion} variant="outline" className="w-full h-14 rounded-[1.5rem] border-dashed border-2 border-surface-container-highest text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-surface-container-low">
                 <PlusCircle className="size-4 mr-2" /> Add Question Node
              </Button>
           </div>
        </div>
        <DialogFooter className="mt-10 gap-3">
           <Button variant="ghost" className="rounded-xl font-black text-xs uppercase tracking-widest text-muted-foreground" onClick={() => setOpen(false)}>Discard</Button>
           <Button onClick={handleCreate} disabled={isSaving || !title} className="lms-btn-primary h-14 px-10 bg-secondary shadow-xl shadow-secondary/10">
              {isSaving ? <Loader2 className="animate-spin size-4" /> : <ShieldCheck className="size-4 mr-3" />}
              Publish Assessment
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
