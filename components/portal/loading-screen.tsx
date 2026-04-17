"use client"

import { GraduationCap, Loader2, LogOut, Zap, ShieldCheck, Activity } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[100] overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute inset-0 mesh-gradient opacity-10" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative"
        >
          {/* Circular Rings */}
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-primary/20"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 1,
                ease: "linear"
              }}
            />
          ))}

          {/* Core Hexagon/Logo Container */}
          <div className="relative group">
            <div className="absolute inset-x-0 -inset-y-4 bg-primary/30 blur-2xl rounded-full scale-150 animate-pulse" />
            <div className="relative h-28 w-28 rounded-[2rem] bg-foreground flex items-center justify-center shadow-[0_0_50px_rgba(var(--primary),0.3)]">
              <GraduationCap className="h-14 w-14 text-background" />
              <motion.div
                className="absolute inset-0 rounded-[2rem] border-2 border-primary"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="mt-16 text-center space-y-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Zap className="size-4 text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Neural Link Syncing</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl font-black tracking-tighter uppercase italic">Dampella Portal</h2>
            <div className="flex items-center justify-center gap-3 text-muted-foreground font-black text-xs uppercase tracking-[0.2em]">
              <Activity className="h-3 w-3 animate-pulse text-emerald-500" />
              <span>Establishing Core Uplink...</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Diagnostic */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-40">
        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">System.initialize()</span>
        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary" />
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

export function SignOutScreen() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-red-950/10" />
      
      <motion.div
        initial={{ filter: "blur(20px)", opacity: 0 }}
        animate={{ filter: "blur(0px)", opacity: 1 }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="relative h-28 w-28 rounded-full border-2 border-red-500/20 flex items-center justify-center mb-12">
          <motion.div
            className="absolute inset-0 rounded-full border-t-2 border-red-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <LogOut className="h-12 w-12 text-red-500" />
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black uppercase tracking-tighter text-red-500">Purging Session</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500/40">Secure Overwrite in Progress</p>
        </div>
      </motion.div>

      <div className="absolute bottom-10 px-8 py-2 rounded-full border border-red-500/20 bg-red-500/5">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/60">Zero-Trace Enforcement Active</span>
      </div>
    </div>
  )
}
