"use client"

import { useState } from "react"
import { Mail, CheckCircle, ArrowRight, LogOut, RefreshCcw, ShieldCheck, MailWarning, Send } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/portal/auth-context"
import { PremiumCard, AnimatedContainer, childVariants } from "@/components/portal/premium-card"
import { cn } from "@/lib/utils"

interface EmailVerificationScreenProps {
  user: any
  onLogout: () => void
  onContinue: () => void
}

export function EmailVerificationScreen({ user, onLogout, onContinue }: EmailVerificationScreenProps) {
  const { resendVerificationLink, checkEmailVerificationStatus, isLoading } = useAuth()
  const [resending, setResending] = useState(false)
  const [checking, setChecking] = useState(false)
  const [sentCount, setSentCount] = useState(0)

  const handleResend = async () => {
    setResending(true)
    const success = await resendVerificationLink()
    if (success) {
      setSentCount(prev => prev + 1)
    }
    setResending(false)
  }

  const handleCheck = async () => {
    setChecking(true)
    const isVerified = await checkEmailVerificationStatus()
    if (isVerified) {
       // If verified, it will automatically switch to the dashboard via parent state
    }
    setChecking(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(99,102,241,0.1) 1px, transparent 0)', backgroundSize: '30px 30px' }} />
      
      {/* Abstract editorial decoration */}
      <div className="absolute top-0 right-0 p-32 opacity-5 pointer-events-none rotate-12">
        <Mail size={500} className="text-primary" />
      </div>
      <div className="absolute bottom-0 left-0 p-32 opacity-5 pointer-events-none -rotate-12">
        <ShieldCheck size={400} className="text-primary" />
      </div>

      <AnimatedContainer className="max-w-2xl w-full relative z-10">
        <div className="p-16 text-center rounded-[3.5rem] bg-white dark:bg-zinc-950 shadow-aura border-none relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }} />
          
          {/* Header Icon */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative mb-16 flex justify-center"
          >
            <div className="size-28 rounded-[2.5rem] bg-indigo-50 dark:bg-slate-900 flex items-center justify-center shadow-aura relative z-10">
              <Mail className="size-12 text-indigo-600 animate-pulse" />
            </div>
          </motion.div>

          {/* Content */}
          <div className="space-y-8 mb-16">
            <Badge className="bg-indigo-500/10 text-indigo-500 border-none px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em]">
              Security Protocol • Node Verification
            </Badge>
            <h1 className="text-5xl font-black tracking-tighter text-on-surface leading-[0.85] uppercase">
              Identity Synchronization<br/>
              <span className="text-indigo-600/30">Required.</span>
            </h1>
            <p className="text-muted-foreground/60 text-lg font-black leading-relaxed max-w-sm mx-auto uppercase tracking-tight">
              A validation vector has been dispatched to <span className="text-on-surface underline decoration-indigo-500/20 underline-offset-8">{user.email}</span>.
            </p>
          </div>

          {/* Features Tonal Hub */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16 text-left">
            <div className="p-8 rounded-[2rem] bg-surface-low dark:bg-slate-900 border-none shadow-sm">
               <div className="flex items-center gap-4 mb-4">
                 <ShieldCheck className="size-5 text-indigo-500" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface">Vault Security</span>
               </div>
               <p className="text-[10px] font-black text-muted-foreground/30 uppercase leading-relaxed tracking-widest">Ensuring institutional grade encryption for all academic records.</p>
            </div>
            <div className="p-8 rounded-[2rem] bg-surface-low dark:bg-slate-900 border-none shadow-sm">
               <div className="flex items-center gap-4 mb-4">
                 <RefreshCcw className="size-5 text-indigo-500" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface">Data Stream</span>
               </div>
               <p className="text-[10px] font-black text-muted-foreground/30 uppercase leading-relaxed tracking-widest">Enabling real-time academic relays and grade synchronization.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-6">
            <Button 
              onClick={handleCheck} 
              disabled={checking}
              className="h-20 rounded-[2rem] bg-indigo-600 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-[0.4em] shadow-aura transition-all gap-4"
            >
              {checking ? <RefreshCcw className="size-6 animate-spin" /> : <ShieldCheck className="size-6 opacity-30" />}
              Acknowledge Verification
            </Button>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                variant="ghost" 
                onClick={handleResend}
                disabled={resending || sentCount >= 3}
                className="h-16 rounded-[1.75rem] bg-surface-low dark:bg-slate-900 text-indigo-600 font-black text-[11px] uppercase tracking-[0.3em] gap-3 hover:bg-white dark:hover:bg-slate-800 transition-all border-none"
              >
                {resending ? <RefreshCcw className="size-4 animate-spin" /> : <Send className="size-4 opacity-30" />}
                {sentCount > 0 ? `Retry (${sentCount}/3)` : "Retry Dispatch"}
              </Button>
              <Button 
                variant="ghost" 
                onClick={onLogout}
                className="h-16 rounded-[1.75rem] bg-surface-low dark:bg-slate-900 text-muted-foreground/30 font-black text-[11px] uppercase tracking-[0.3em] gap-3 hover:bg-white dark:hover:bg-slate-800 transition-all border-none"
              >
                <LogOut className="size-4 opacity-30" /> Terminate
              </Button>
            </div>

            <button 
                onClick={onContinue}
                className="w-full py-4 text-indigo-600/40 hover:text-indigo-600 font-black text-[10px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4"
              >
                Bypass Security Protocol <ArrowRight className="size-4" />
            </button>
          </div>

          <p className="mt-16 text-[9px] font-black uppercase tracking-[0.5em] text-muted-foreground/10">
            Nexus Intelligence Framework • Terminal {user.studentId || user.teacherId || 'X'}
          </p>
        </div>
      </AnimatedContainer>
    </div>
  )
}
