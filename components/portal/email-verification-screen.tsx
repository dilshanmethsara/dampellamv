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
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 p-24 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <Mail size={400} className="text-zinc-900 dark:text-white rotate-12" />
      </div>
      <div className="absolute bottom-0 left-0 p-24 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <ShieldCheck size={300} className="text-zinc-900 dark:text-white -rotate-12" />
      </div>

      <AnimatedContainer className="max-w-2xl w-full">
        <PremiumCard className="p-10 md:p-16 text-center border-none shadow-aura bg-white dark:bg-zinc-900 overflow-hidden relative" variants={childVariants}>
          {/* Header Icon */}
          <div className="relative mb-12 flex justify-center">
            <div className="size-24 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shadow-sm relative z-10">
              <Mail className="size-10 text-indigo-600 animate-pulse" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-40 bg-indigo-500/5 blur-3xl rounded-full" />
          </div>

          {/* Content */}
          <div className="space-y-6 mb-12">
            <Badge className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 border-none px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
              Security Protocol • Phase 1
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
              One last step, <br/><span className="text-indigo-600">{user.fullName.split(" ")[0]}</span>
            </h1>
            <p className="text-muted-foreground text-lg font-bold leading-relaxed max-w-md mx-auto opacity-70">
              We've sent a verification link to <span className="text-zinc-900 dark:text-white underline decoration-indigo-500/30 underline-offset-4">{user.email}</span>. Please click it to secure your account.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12 text-left">
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
               <div className="flex items-center gap-3 mb-2">
                 <CheckCircle className="size-4 text-emerald-500" />
                 <span className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">Account Security</span>
               </div>
               <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed tracking-wider opacity-60">Prevents unauthorized access to your academic data.</p>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
               <div className="flex items-center gap-3 mb-2">
                 <CheckCircle className="size-4 text-emerald-500" />
                 <span className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">Email alerts</span>
               </div>
               <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed tracking-wider opacity-60">Receive instant updates about your grades and assignments.</p>
            </div>
          </div>
          {/* Actions */}
          <div className="flex flex-col gap-4">
            <Button 
              onClick={handleCheck} 
              disabled={checking}
              className="h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all gap-3"
            >
              {checking ? <RefreshCcw className="size-5 animate-spin" /> : <ShieldCheck className="size-5" />}
              I've Clicked the Link
            </Button>
            
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={handleResend}
                disabled={resending || sentCount >= 3}
                className="flex-1 h-14 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-indigo-600 font-black text-xs uppercase tracking-widest gap-2"
              >
                {resending ? <RefreshCcw className="size-4 animate-spin" /> : <Send className="size-4" />}
                {sentCount > 0 ? `Resend (${sentCount}/3)` : "Resend Link"}
              </Button>
              <Button 
                variant="outline" 
                onClick={onLogout}
                className="flex-1 h-14 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-muted-foreground font-black text-xs uppercase tracking-widest gap-2"
              >
                <LogOut className="size-4" /> Sign Out
              </Button>
            </div>

            <Button 
                variant="ghost" 
                onClick={onContinue}
                className="w-full h-12 rounded-2xl text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 font-black text-xs uppercase tracking-widest gap-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                Continue to Dashboard anyway <ArrowRight className="size-4" />
            </Button>
          </div>

          {/* Footer Info */}
          <p className="mt-10 text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40">
            Dampella LMS Security Cluster • Real-time Protection
          </p>
        </PremiumCard>
      </AnimatedContainer>
    </div>
  )
}
