"use client"

import { GraduationCap, Loader2, LogOut } from "lucide-react"

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
      <div className="relative">
        {/* Animated Rings */}
        <div className="absolute inset-0 -m-4 rounded-full border-2 border-primary/20 animate-[ping_2s_linear_infinite]" />
        <div className="absolute inset-0 -m-8 rounded-full border-2 border-primary/10 animate-[ping_3s_linear_infinite]" />
        
        {/* Logo Container */}
        <div className="relative h-20 w-20 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 animate-[bounce_2s_infinite]">
          <GraduationCap className="h-10 w-10 text-white" />
        </div>
      </div>

      <div className="mt-12 text-center space-y-3">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 animate-pulse">
          Dampella LMS
        </h2>
        <div className="flex items-center justify-center gap-2 text-muted-foreground font-medium">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Preparing Portal...</span>
        </div>
      </div>

      {/* Footer Text */}
      <div className="absolute bottom-10 text-xs text-muted-foreground/60 tracking-widest uppercase font-medium">
        Educational Excellence
      </div>
    </div>
  )
}

export function ClosingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50 animate-[fadeIn_0.5s_ease-out]">
      <div className="relative">
        {/* Animated Rings - Fading Out */}
        <div className="absolute inset-0 -m-4 rounded-full border-2 border-primary/20 animate-pulse" />
        
        {/* Logo Container - Scaling Down */}
        <div className="relative h-20 w-20 rounded-2xl bg-muted flex items-center justify-center shadow-lg animate-[pulse_2s_infinite]">
          <GraduationCap className="h-10 w-10 text-muted-foreground" />
        </div>
      </div>

      <div className="mt-12 text-center space-y-3">
        <h2 className="text-2xl font-bold text-muted-foreground">
          Closing Session
        </h2>
        <div className="flex items-center justify-center gap-2 text-muted-foreground/60 font-medium">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Syncing your progress...</span>
        </div>
      </div>

      <div className="absolute bottom-10 text-xs text-muted-foreground/40 tracking-widest uppercase font-medium italic">
        Securing your data
      </div>
    </div>
  )
}

export function SignOutScreen() {
  return (
    <div className="fixed inset-0 bg-red-50 flex flex-col items-center justify-center z-50 animate-[fadeIn_0.5s_ease-out]">
      <div className="relative">
        <div className="absolute inset-0 -m-8 rounded-full border-2 border-red-200 animate-ping opacity-20" />
        
        {/* Logo Container - Red Theme */}
        <div className="relative h-20 w-20 rounded-2xl bg-red-600 flex items-center justify-center shadow-xl shadow-red-200 animate-pulse">
          <LogOut className="h-10 w-10 text-white" />
        </div>
      </div>

      <div className="mt-12 text-center space-y-3">
        <h2 className="text-2xl font-bold text-red-700">
          Signing Out
        </h2>
        <div className="flex items-center justify-center gap-2 text-red-600/60 font-medium">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Cleaning up your session...</span>
        </div>
      </div>

      <div className="absolute bottom-10 text-xs text-red-900/30 tracking-widest uppercase font-bold italic">
        Session Ending Securely
      </div>
    </div>
  )
}
