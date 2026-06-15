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
  ShieldCheck, 
  Trash, 
  Users, 
  UserPlus,
  Search,
  CheckCircle,
  AlertTriangle,
  Verified,
  Bell,
  Globe,
  Settings,
  MoreVertical
} from "lucide-react"
import { LMSCard, LMSEmptyState } from "./shared"

// ─── Whitelist Manager ───────────────────────────────────────────────────────
export function WhitelistManager() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [openAdd, setOpenAdd] = useState(false)
  const [newStudent, setNewStudent] = useState({ full_name: "", grade: "", student_id: "" })

  useEffect(() => {
    const q = query(collection(db, 'valid_students'), orderBy('created_at', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleAdd = async () => {
    if (!newStudent.full_name || !newStudent.student_id) return
    try {
      await addDoc(collection(db, 'valid_students'), {
        ...newStudent,
        created_at: new Date().toISOString()
      })
      setOpenAdd(false)
      setNewStudent({ full_name: "", grade: "", student_id: "" })
    } catch (err) {
      console.error("Whitelist add error:", err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Revoke student authorization?")) return
    try {
      await deleteDoc(doc(db, 'valid_students', id))
    } catch (err) {
      console.error("Whitelist delete error:", err)
    }
  }

  const filtered = students.filter(s => 
    s.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    s.student_id?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-md">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
           <Input 
             placeholder="Search Identity Registry..." 
             className="h-14 rounded-2xl bg-surface-lowest border-none pl-12 pr-6 font-bold text-sm focus:ring-primary shadow-inner"
             value={search}
             onChange={e => setSearch(e.target.value)}
           />
        </div>
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button className="lms-btn-primary h-14 px-8">
              <UserPlus className="size-4 mr-3" /> Enroll Identity
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-[2.5rem] bg-background border-none p-10">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-3xl font-black tracking-tighter uppercase">ID Matrix Enrollment</DialogTitle>
              <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1">Add valid credentials to the institutional registry.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest px-1">Full Identity</Label>
                 <Input value={newStudent.full_name} onChange={e => setNewStudent({...newStudent, full_name: e.target.value})} className="h-12 rounded-xl bg-surface-container-low border-none px-4 font-bold" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest px-1">Index Key</Label>
                   <Input value={newStudent.student_id} onChange={e => setNewStudent({...newStudent, student_id: e.target.value})} className="h-12 rounded-xl bg-surface-container-low border-none px-4 font-bold" />
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest px-1">Grade</Label>
                   <Input value={newStudent.grade} onChange={e => setNewStudent({...newStudent, grade: e.target.value})} className="h-12 rounded-xl bg-surface-container-low border-none px-4 font-bold" />
                 </div>
               </div>
            </div>
            <DialogFooter className="mt-10">
               <Button onClick={handleAdd} className="w-full h-14 lms-btn-primary bg-foreground text-background">Execute Enrollment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <LMSCard className="p-0 border-none overflow-hidden bg-surface-lowest/30" variants={null}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-lowest/50">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Full Identity</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Index No.</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Cohort</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Protocol</th>
              </tr>
            </thead>
            <tbody className="">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center"><Loader2 className="size-8 animate-spin mx-auto text-primary" /></td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                   <td colSpan={4} className="px-8 py-20"><LMSEmptyState icon="shield" message="No Registry Found" sub="No identities match the current search parameters." /></td>
                </tr>
              ) : filtered.map(s => (
                <tr key={s.id} className="hover:bg-surface-container-low/30 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="font-black text-sm tracking-tight uppercase">{s.full_name}</p>
                  </td>
                  <td className="px-8 py-6">
                    <code className="text-[10px] font-black uppercase tracking-widest text-primary/60">{s.student_id}</code>
                  </td>
                  <td className="px-8 py-6">
                    <Badge variant="outline" className="bg-surface-lowest border-none text-[8px] font-black px-3 py-1 rounded-full uppercase">{s.grade}</Badge>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Button variant="ghost" size="icon" className="size-8 rounded-xl text-muted-foreground/20 hover:text-red-500 hover:bg-red-500/10" onClick={() => handleDelete(s.id)}>
                      <Trash className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LMSCard>
    </div>
  )
}

// ─── Broadcast Manager ───────────────────────────────────────────────────────
export function BroadcastManager({ user }: { user: User }) {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [newMsg, setNewMsg] = useState({ title: "", content: "", type: "General" })

  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('created_at', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleSend = async () => {
    if (!newMsg.title || !newMsg.content) return
    try {
      await addDoc(collection(db, 'announcements'), {
        ...newMsg,
        teacher_email: user.email.toLowerCase(),
        teacher_name: "Administration",
        created_at: new Date().toISOString()
      })
      setOpen(false)
      setNewMsg({ title: "", content: "", type: "General" })
    } catch (err) {
      console.error("Broadcast error:", err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Terminate this broadcast?")) return
    try {
      await deleteDoc(doc(db, 'announcements', id))
    } catch (err) {
      console.error("Broadcast delete error:", err)
    }
  }

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
         <h3 className="text-3xl font-black tracking-tighter uppercase">Institutional Feed</h3>
         <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
               <Button className="lms-btn-primary h-12 bg-primary">New Broadcast</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl rounded-[2.5rem] bg-background border-none p-10">
               <DialogHeader className="mb-8">
                  <DialogTitle className="text-3xl font-black tracking-tighter uppercase">System Dispatch</DialogTitle>
                  <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1">Broadcast high-priority notifications to the entire ecosystem.</DialogDescription>
               </DialogHeader>
               <div className="space-y-6">
                  <div className="space-y-4">
                     <Label className="text-[10px] font-black uppercase tracking-widest px-1">Classification</Label>
                     <div className="flex gap-2">
                        {['General', 'Emergency', 'System', 'Holiday'].map(t => (
                           <button 
                             key={t}
                             onClick={() => setNewMsg({...newMsg, type: t})}
                             className={cn(
                               "px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all",
                               newMsg.type === t ? "bg-primary border-primary text-white" : "border-surface-container-highest text-muted-foreground"
                             )}
                           >
                              {t}
                           </button>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest px-1">Headline</Label>
                     <Input value={newMsg.title} onChange={e => setNewMsg({...newMsg, title: e.target.value})} className="h-14 rounded-2xl bg-surface-container-low border-none px-6 font-bold" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest px-1">Transmission</Label>
                     <Textarea value={newMsg.content} onChange={e => setNewMsg({...newMsg, content: e.target.value})} className="min-h-[150px] rounded-[1.5rem] bg-surface-container-low border-none p-6 font-medium" />
                  </div>
               </div>
               <DialogFooter className="mt-10">
                  <Button onClick={handleSend} className="w-full h-14 lms-btn-primary">Execute Broadcast</Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>

      <div className="grid gap-6">
         {loading ? (
           <div className="flex justify-center py-20"><Loader2 className="size-10 animate-spin text-primary" /></div>
         ) : messages.length === 0 ? (
           <LMSEmptyState icon="bell" message="Frequency Clear" sub="No active broadcasts are currently being transmitted." />
         ) : messages.map(m => (
           <LMSCard key={m.id} className="relative group overflow-hidden">
             <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4 flex-1">
                   <div className="flex items-center gap-3">
                      <Badge className={cn(
                        "rounded-full text-[8px] font-black uppercase tracking-widest border-none px-3",
                        m.type === 'Emergency' ? "bg-red-500 text-white" : "bg-primary/10 text-primary"
                      )}>
                        {m.type}
                      </Badge>
                      <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">
                        {new Date(m.created_at).toLocaleString()}
                      </p>
                   </div>
                   <div>
                      <h4 className="text-xl font-black uppercase tracking-tight mb-2">{m.title}</h4>
                      <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed">{m.content}</p>
                   </div>
                </div>
                <div className="flex md:flex-col justify-end gap-2">
                   <Button variant="ghost" size="sm" className="h-8 text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10" onClick={() => handleDelete(m.id)}>
                      Terminate
                   </Button>
                </div>
             </div>
           </LMSCard>
         ))}
      </div>
    </div>
  )
}
