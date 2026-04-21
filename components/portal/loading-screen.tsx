"use client"

import { GraduationCap, Loader2, LogOut, ShieldCheck, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function LoadingScreen() {
  const [progress, setProgress] = useState(12)
  const [statusIndex, setStatusIndex] = useState(0)

  const statuses = [
    "Authenticating identity...",
    "Verifying credentials...",
    "Syncing curriculum data...",
    "Preparing your workspace...",
    "Almost ready...",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) { clearInterval(interval); return 95 }
        return p + Math.random() * 2 + 2  // 2–4% per tick → ~8 seconds to reach 95%
      })
    }, 300)
    const statusInterval = setInterval(() => {
      setStatusIndex((i) => (i + 1) % statuses.length)
    }, 1600)
    return () => { clearInterval(interval); clearInterval(statusInterval) }
  }, [])

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden flex flex-col"
      style={{ background: "linear-gradient(135deg, #f8f9ff 0%, #eef0ff 50%, #f5f0ff 100%)" }}>

      {/* Soft purple aura blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-8 pt-8">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">The</p>
            <p className="text-sm font-extrabold tracking-tight text-primary leading-none">LMS</p>
          </div>
        </div>

        {/* Credential check badge */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 shadow-sm border border-emerald-100"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-700">Credential Check</p>
            <p className="text-[9px] text-emerald-600/70 font-medium">Identity Verified</p>
          </div>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-8 px-6">
        {/* Circular spinner */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Outer ring track */}
          <div className="w-28 h-28 rounded-full border-4 border-indigo-100 relative flex items-center justify-center">
            {/* Spinning arc */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
            {/* Inner circle with icon */}
            <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-primary" />
            </div>
          </div>

          {/* Subtle pulsing aura */}
          <motion.div
            className="absolute inset-[-8px] rounded-full border border-primary/20"
            animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Text */}
        <motion.div
          className="text-center space-y-2 max-w-xs"
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: "var(--font-headline, inherit)" }}>
            Preparing Your LMS...
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Securing your academic workspace and synchronizing your curriculum.
          </p>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className="w-full max-w-xs space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
            <span className="text-slate-400">Status: Authenticating</span>
            <span className="text-primary">{Math.min(Math.round(progress), 95)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-indigo-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500"
              style={{ width: `${Math.min(progress, 95)}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* Live status */}
          <div className="h-5 overflow-hidden">
            <motion.p
              key={statusIndex}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              className="text-[10px] text-slate-400 font-medium text-center"
            >
              {statuses[statusIndex]}
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* Floating card - bottom left */}
      <motion.div
        initial={{ opacity: 0, x: -20, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-20 left-8 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/80 shadow-md border border-slate-100 backdrop-blur-sm"
      >
        <div className="flex -space-x-1.5">
          {["bg-indigo-400", "bg-violet-400", "bg-sky-400"].map((c, i) => (
            <div key={i} className={cn("w-5 h-5 rounded-full border-2 border-white", c)} />
          ))}
        </div>
        <span className="text-[11px] font-bold text-slate-600">Among 622 Students</span>
      </motion.div>

      {/* Footer */}
      <div className="relative z-10 pb-6 flex flex-col items-center gap-2">
        <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-emerald-400 inline-block" />
            Pro-tip: Pin Arcline
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-primary inline-block" />
            Live Curriculum Sync
          </span>
        </div>
        <p className="text-[9px] text-slate-300 font-medium">Dampella Learning Management Systems © 2025</p>
      </div>
    </div>
  )
}

export function ClosingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-blue-950/20 backdrop-blur-3xl" />
      
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          animate={{ scale: [1, 0.9, 1.1, 0], opacity: [1, 0.8, 1, 0] }}
          transition={{ duration: 2, ease: "anticipate" }}
          className="relative h-24 w-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center"
        >
          <ShieldCheck className="h-10 w-10 text-primary" />
        </motion.div>

        <motion.div 
          className="mt-12 text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-2xl font-black uppercase tracking-tighter">Secure De-synchronization</h2>
          <div className="flex items-center justify-center gap-2 text-primary/60 font-black text-[10px] uppercase tracking-widest">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Purging Session Fragments...</span>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-10 text-[10px] font-black tracking-[0.5em] uppercase text-muted-foreground/30 italic">
        Neural Link Severed
      </div>
    </div>
  )
}

export function SignOutScreen({ onReturnToLogin, onViewSite }: { onReturnToLogin: () => void, onViewSite: () => void }) {
  return (
    <div className="fixed inset-0 bg-white flex flex-col z-[100] font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03)_0%,transparent_70%)] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-12 py-10 w-full">
        <div className="flex items-center gap-2.5">
           <p className="text-[14px] font-black tracking-tight text-indigo-900">Dampella LMS</p>
        </div>
        
        <div className="flex items-center gap-3 text-slate-400">
           <span className="text-[9px] font-black uppercase tracking-[0.2em]">Secure Session Termination</span>
           <span className="material-symbols-outlined text-lg">lock</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-20 px-8">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="relative flex flex-col items-center max-w-xl text-center space-y-10"
        >
          {/* Subtle Icon Glow */}
          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center relative mb-4">
             <div className="absolute inset-0 rounded-full border border-slate-100 scale-150 opacity-50" />
             <div className="absolute inset-0 rounded-full border border-slate-100 scale-[2] opacity-30" />
             <span className="material-symbols-outlined text-3xl text-indigo-900 font-variation-fill">shield</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-6xl font-extrabold tracking-tighter text-indigo-950 leading-tight">
              Session Concluded
            </h1>
            <p className="text-lg font-medium text-slate-500 leading-relaxed max-w-md mx-auto">
              Your contributions remain preserved in our digital vaults.
            </p>
          </div>

          <div className="flex items-center gap-4 pt-4 w-full justify-center">
             <button 
               onClick={onReturnToLogin}
               className="h-16 px-10 bg-indigo-900 text-white rounded-2xl flex items-center gap-4 hover:bg-slate-900 transition-all font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-indigo-950/20 active:scale-95 group"
             >
                Return to Login
                <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
             </button>

             <button 
               onClick={onViewSite}
               className="h-16 px-10 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center hover:bg-indigo-100 transition-all font-black uppercase tracking-widest text-[11px] active:scale-95"
             >
                View Institution Site
             </button>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full py-10 flex flex-col items-center gap-6 border-t border-slate-50">
         <div className="flex items-center gap-8 text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
            <span className="flex items-center gap-2">
               <span className="w-1 h-1 rounded-full bg-slate-300" />
               Knowledge Secured
            </span>
            <span className="flex items-center gap-2">
               <span className="w-1 h-1 rounded-full bg-slate-300" />
               Audit Logged
            </span>
         </div>

         <div className="text-center space-y-3">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">© 2024 Dampella LMS. All Rights Reserved.</p>
            <div className="flex items-center gap-6 justify-center text-[9px] font-black uppercase tracking-[0.1em] text-slate-300">
               <button className="hover:text-indigo-900 transition-colors">Institutional Policy</button>
               <button className="hover:text-indigo-900 transition-colors">Academic Integrity</button>
               <button className="hover:text-indigo-900 transition-colors">Contact Support</button>
            </div>
         </div>
      </footer>
    </div>
  )
}
