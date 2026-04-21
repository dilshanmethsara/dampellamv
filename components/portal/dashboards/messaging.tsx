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
  orderBy 
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { User } from "@/lib/portal/auth-context"
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
  Rocket, 
  MessageSquare, 
  AlertTriangle,
  Send,
  Undo2
} from "lucide-react"
import { LMSCard, LMSEmptyState } from "./shared"

// ─── Messaging Components ───────────────────────────────────────────────────

export function MessageComposeDialog({ 
  user, 
  onSent,
  initialRecipient = null,
  initialSubject = "",
  trigger = null,
  forceOpen = false,
  onOpenChange = () => {}
}: { 
  user: User; 
  onSent: () => void;
  initialRecipient?: any;
  initialSubject?: string;
  trigger?: React.ReactNode;
  forceOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(forceOpen)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [recipients, setRecipients] = useState<any[]>([])
  const [selectedRecipient, setSelectedRecipient] = useState<any>(initialRecipient)
  const [subject, setSubject] = useState(initialSubject)
  const [content, setContent] = useState("")

  useEffect(() => {
    setOpen(forceOpen)
  }, [forceOpen])

  useEffect(() => {
    if (initialRecipient) setSelectedRecipient(initialRecipient)
    if (initialSubject) setSubject(initialSubject)
  }, [initialRecipient, initialSubject])

  const searchRecipients = async (val: string) => {
    setSearch(val)
    if (!val.trim()) {
      setRecipients([])
      return
    }

    const targetRole = user.role === 'teacher' ? 'student' : 'teacher'
    const profilesRef = collection(db, 'profiles')
    
    try {
      const q = query(
        profilesRef, 
        where('role', '==', targetRole)
      )
      
      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map(doc => {
        const d = doc.data()
        return { 
          id: doc.id, 
          email: d.email,
          fullName: d.fullName || d.full_name
        }
      }).filter(p => 
        (p.fullName || "").toLowerCase().includes(val.toLowerCase()) ||
        (p.email || "").toLowerCase().includes(val.toLowerCase())
      ).slice(0, 5)

      setRecipients(data)
    } catch (err: any) {
      console.error("Recipient search error:", err)
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
        receiver_name: selectedRecipient.fullName,
        subject: subject || "No Subject",
        content: content,
        status: 'unread',
        created_at: new Date().toISOString()
      })

      const { toast } = await import('sonner')
      toast.success("Dispatch confirmed.")
      
      await addDoc(collection(db, 'notifications'), {
        user_email: selectedRecipient.email.toLowerCase(),
        title: "New Dispatch",
        content: `${user.fullName} initiated a secure transmission: "${subject || "Secure Link"}"`,
        type: 'message',
        is_read: false,
        created_at: new Date().toISOString()
      })

      setOpen(false)
      onOpenChange(false)
      if (!initialRecipient) setSelectedRecipient(null)
      if (!initialSubject) setSubject("")
      setContent("")
      onSent()
    } catch (err) {
      console.error("Error sending message:", err)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); onOpenChange(o); }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="lms-btn-primary h-12 px-6">
            New Dispatch
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] border-none shadow-aura bg-background p-8">
        <DialogHeader className="mb-10">
          <DialogTitle className="text-3xl font-black tracking-tighter text-foreground uppercase">Compose Dispatch</DialogTitle>
          <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Secure point-to-point communication protocol.</DialogDescription>
        </DialogHeader>
        <div className="space-y-8">
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground px-1">Recipient Key</Label>
            {selectedRecipient ? (
              <div className="flex items-center justify-between p-5 rounded-2xl bg-surface-lowest">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xs">
                    {selectedRecipient.fullName?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-black tracking-tight text-primary uppercase">{selectedRecipient.fullName}</p>
                    <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">{selectedRecipient.email}</p>
                  </div>
                </div>
                {!initialRecipient && (
                  <Button variant="ghost" size="icon" className="size-8 rounded-xl hover:bg-red-500/10 text-red-500" onClick={() => setSelectedRecipient(null)}>
                    <AlertTriangle className="size-4" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="relative">
                <Input 
                  placeholder={`Identify ${user.role === 'teacher' ? 'student' : 'faculty'}...`} 
                  className="h-14 rounded-2xl bg-surface-container-highest border-none px-6 font-bold text-sm focus:ring-primary"
                  value={search}
                  onChange={(e) => searchRecipients(e.target.value)}
                />
                <AnimatePresence>
                  {recipients.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-background border border-surface-container-high rounded-3xl shadow-aura z-50 overflow-hidden"
                    >
                      {recipients.map(r => (
                        <button 
                          key={r.email}
                          className="w-full text-left px-6 py-5 hover:bg-surface-container/50 transition-colors flex items-center gap-4"
                          onClick={() => {
                            setSelectedRecipient(r)
                            setRecipients([])
                            setSearch("")
                          }}
                        >
                          <div className="size-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary font-black text-xs shrink-0">
                            {(r.fullName || "?").charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-sm tracking-tight text-foreground uppercase">{r.fullName || "Unknown Identity"}</p>
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
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground px-1">Subject Matter</Label>
            <Input placeholder="Module Inquiry / Resource Request" value={subject} onChange={e => setSubject(e.target.value)} className="h-14 rounded-2xl bg-surface-container-highest border-none px-6 font-bold text-sm" />
          </div>
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground px-1">Transmission Content</Label>
            <Textarea 
              placeholder="Enter secure message content..." 
              className="min-h-[180px] rounded-[1.5rem] bg-surface-container-highest border-none p-6 font-medium text-sm focus:ring-primary resize-none" 
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="mt-10 gap-3">
          <Button variant="ghost" className="rounded-xl font-black text-xs uppercase tracking-widest text-muted-foreground" onClick={() => { setOpen(false); onOpenChange(false); }}>Abort</Button>
          <Button onClick={handleSend} disabled={loading || !selectedRecipient || !content.trim()} className="lms-btn-primary px-10 h-14">
            {loading ? <Loader2 className="animate-spin size-4" /> : <Rocket className="size-4 mr-3" />}
            Execute Dispatch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function MessageViewDialog({ message, user, onUpdate }: { message: any; user: User; onUpdate: () => void }) {
  const [open, setOpen] = useState(false)
  const [isReplying, setIsReplying] = useState(false)

  const markAsRead = async () => {
    if (message.status === 'unread' && message.receiver_email === user.email.toLowerCase()) {
      const docRef = doc(db, 'internal_messages', message.id)
      await updateDoc(docRef, { status: 'read' })
      onUpdate()
    }
  }

  const isUnread = message.status === 'unread' && message.receiver_email === user.email.toLowerCase()

  const replyRecipient = {
    fullName: message.sender_name,
    email: message.sender_email
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) markAsRead() }}>
        <DialogTrigger asChild>
          <button className={cn(
            "w-full text-left p-6 rounded-[2rem] border-none transition-all duration-700 flex items-center justify-between group cursor-pointer",
            isUnread 
              ? "bg-secondary/5 shadow-aura" 
              : "bg-surface-lowest hover:bg-white hover:shadow-aura"
          )}>
            <div className="flex items-center gap-6">
              <div className={cn(
                "size-14 rounded-[1.25rem] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform",
                isUnread ? "bg-primary text-white" : "bg-surface-container-high text-muted-foreground/60"
              )}>
                <MessageSquare className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <p className={cn("font-black text-lg tracking-tighter uppercase", isUnread ? "text-primary" : "text-foreground")}>{message.subject}</p>
                  {isUnread && (
                    <Badge className="bg-primary h-5 px-2 rounded-full text-[8px] font-black uppercase tracking-widest border-none">NEW</Badge>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1 opacity-60">
                  {message.sender_email === user.email.toLowerCase() 
                    ? `To: ${message.receiver_name}` 
                    : `From: ${message.sender_name}`}
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
        <DialogContent className="w-[92vw] sm:max-w-[600px] rounded-[2.5rem] border-none shadow-aura bg-background p-8 sm:p-12">
          <DialogHeader className="mb-12">
            <div className="flex items-center gap-6">
               <div className="size-20 rounded-[1.5rem] bg-surface-container-low flex items-center justify-center text-primary font-black text-3xl">
                  {(message.sender_name || message.sender_email).charAt(0).toUpperCase()}
               </div>
               <div>
                  <DialogTitle className="text-3xl font-black tracking-tighter text-foreground uppercase mb-2">{message.subject}</DialogTitle>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    {message.sender_name} • {new Date(message.created_at).toLocaleString()}
                  </p>
               </div>
            </div>
          </DialogHeader>
          <div className="bg-surface-lowest p-8 rounded-[2rem] mb-10 min-h-[200px]">
             <p className="text-sm font-medium text-foreground leading-relaxed whitespace-pre-wrap">
               {message.content}
             </p>
          </div>
          <DialogFooter className="gap-4">
            <Button variant="ghost" className="flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest text-muted-foreground" onClick={() => setOpen(false)}>Terminate</Button>
            {message.sender_email !== user.email.toLowerCase() && (
              <Button 
                className="flex-1 lms-btn-primary" 
                onClick={() => {
                  setOpen(false)
                  setIsReplying(true)
                }}
              >
                <Undo2 className="size-4 mr-2" /> Reply Protocol
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Flow Integration */}
      <MessageComposeDialog 
        user={user} 
        onSent={() => {
          setIsReplying(false)
          onUpdate()
        }}
        initialRecipient={replyRecipient}
        initialSubject={`RE: ${message.subject}`}
        forceOpen={isReplying}
        onOpenChange={(o) => setIsReplying(o)}
        trigger={<div className="hidden" />}
      />
    </>
  )
}

export function MessagingSection({ user, t }: { user: User; t: (k: string) => string }) {
  const [messages, setMessages] = useState<any[]>([])
  const [view, setView] = useState<'inbox' | 'sent'>('inbox')
  const [loading, setLoading] = useState(true)

  const loadMessages = async () => {
    setLoading(true)
    const email = user.email.toLowerCase()
    try {
      const messagesRef = collection(db, 'internal_messages')
      const q = query(
        messagesRef,
        where(view === 'inbox' ? 'receiver_email' : 'sender_email', '==', email),
        orderBy('created_at', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setMessages(data)
    } catch (err) {
      console.error("Error loading messages:", err)
    }
    setLoading(false)
  }

  useEffect(() => { loadMessages() }, [view, user.email])

  return (
    <LMSCard className="p-0 border-none overflow-hidden" variants={null}>
      <div className="p-8 bg-surface-lowest/50 flex items-center justify-between gap-10">
        <div className="flex gap-10">
           <button 
             onClick={() => setView('inbox')}
             className={cn(
               "text-xl font-black tracking-tight uppercase transition-all",
               view === 'inbox' ? "text-foreground" : "text-muted-foreground/40 hover:text-muted-foreground"
             )}
           >
             Inbox
           </button>
           <button 
             onClick={() => setView('sent')}
             className={cn(
               "text-xl font-black tracking-tight uppercase transition-all",
               view === 'sent' ? "text-foreground" : "text-muted-foreground/40 hover:text-muted-foreground"
             )}
           >
             Sent
           </button>
        </div>
        <MessageComposeDialog user={user} t={t} onSent={loadMessages} />
      </div>
      <div className="p-8">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : messages.length === 0 ? (
          <LMSEmptyState 
            icon="mail" 
            message="Secure Channel Clear" 
            sub="No active transmissions found in the current buffer." 
          />
        ) : (
          <div className="space-y-4">
            {messages.map(m => (
              <MessageViewDialog key={m.id} message={m} user={user} onUpdate={loadMessages} />
            ))}
          </div>
        )}
      </div>
    </LMSCard>
  )
}
