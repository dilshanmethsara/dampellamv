import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export const childVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export function LMSCard({ 
  children, 
  className, 
  delay = 0, 
  surface = "lowest",
  variants = childVariants
}: { 
  children: React.ReactNode, 
  className?: string, 
  delay?: number, 
  surface?: "lowest" | "low" | "container" | "low-30",
  variants?: any
}) {
  const surfaceClass = {
    lowest: "bg-surface-lowest",
    low: "bg-surface-low",
    container: "bg-surface-container",
    "low-30": "bg-surface-low/30"
  }[surface]

  const Component = variants ? motion.div : 'div'

  return (
    <Component
      {...(variants ? {
        initial: "initial",
        animate: "animate",
        variants: variants,
        transition: { delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }
      } : {})}
      className={cn(
        "rounded-[2.5rem] p-8 transition-all duration-700",
        surfaceClass,
        surface === "lowest" ? "shadow-aura" : "shadow-sm",
        className
      )}
    >
      {children}
    </Component>
  )
}

export function LMSStatBlock({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendType = "up",
  colorClass = "text-primary" 
}: { 
  title: string, 
  value: string, 
  icon: string, 
  trend?: string, 
  trendType?: "up" | "down" | "none",
  colorClass?: string 
}) {
  return (
    <LMSCard className="flex flex-col justify-between h-full group hover:scale-[1.02] transition-transform duration-700 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-8">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] font-headline">{title}</p>
            <h3 className={cn("text-5xl font-black tracking-tighter font-headline", colorClass)}>
              {value}
            </h3>
          </div>
          <div className={cn(
            "size-14 rounded-2xl flex items-center justify-center transition-all duration-700 border-none shadow-sm",
            "bg-surface-low text-primary group-hover:bg-primary group-hover:text-white"
          )}>
             <span className="material-symbols-outlined text-3xl">{Icon}</span>
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-3">
            <div className={cn(
              "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2",
              trendType === "up" ? "bg-tertiary-fixed text-on-tertiary-fixed-variant" : "bg-surface-container text-muted-foreground/60"
            )}>
              {trendType === "up" && <span className="material-symbols-outlined text-[12px]">trending_up</span>}
              {trend}
            </div>
          </div>
        )}
      </div>
      {/* Subtle organic shimmer */}
      <div className="absolute -right-10 -bottom-10 size-32 bg-primary/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    </LMSCard>
  )
}

export function LMSEmptyState({ icon, message, sub }: { icon: string, message: string, sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center bg-surface-low/30 rounded-[3.5rem] border-none">
      <div className="size-24 rounded-[2.5rem] bg-surface-lowest flex items-center justify-center mb-10 shadow-aura scale-90 opacity-60">
        <span className="material-symbols-outlined text-5xl text-primary">{icon}</span>
      </div>
      <h3 className="text-2xl font-black tracking-tighter text-foreground uppercase mb-3 font-headline">{message}</h3>
      {sub && (
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 max-w-[280px] leading-relaxed">
          {sub}
        </p>
      )}
    </div>
  )
}

export function PendingApprovalScreen({ user, onLogout, onBackToWebsite }: { user: User, onLogout: () => void, onBackToWebsite: () => void }) {
  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: "linear-gradient(135deg, #f8f9ff 0%, #f0f1ff 60%, #f5f0ff 100%)" }}>
      
      {/* Top nav */}
      <div className="flex items-center justify-between px-8 py-5 relative z-10">
        <span className="font-extrabold text-sm tracking-tight text-primary" style={{ fontFamily: "var(--font-headline, inherit)" }}>Dampella LMS</span>
        <button className="text-xs font-semibold text-slate-400 hover:text-primary transition-colors flex items-center gap-1.5">
          Support
          <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px]">?</span>
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Application Status</p>
              <h1 className="text-4xl font-extrabold font-headline tracking-tight text-slate-900 leading-tight">
                Building the future<br />
                <span className="text-primary">of education.</span>
              </h1>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-500">Step 3 of 3: Pending Approval</span>
                <span className="text-primary">90% Complete</span>
              </div>
              <div className="h-1.5 rounded-full bg-indigo-100 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500"
                  initial={{ width: 0 }}
                  animate={{ width: "90%" }}
                  transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-3">
              {[
                { label: "Identity Verified", done: true },
                { label: "Credentials Uploaded", done: true },
                { label: "Administrative Review", done: false, active: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs",
                    item.done ? "bg-emerald-500 text-white" : "bg-primary text-white"
                  )}>
                    {item.done ? (
                      <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    ) : (
                      <span className="text-[10px] font-black">{i + 1}</span>
                    )}
                  </div>
                  <span className={cn(
                    "text-sm font-semibold",
                    item.done ? "text-emerald-600" : "text-primary"
                  )}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-3xl p-8 shadow-xl shadow-indigo-100/50 border border-slate-100 space-y-6"
          >
            {/* Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Registration Received</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Your professional profile is now in our{" "}
                <span className="text-primary font-semibold">administrative staging area</span>.
                {" "}The Principal or Academic Dean will review your credentials within{" "}
                <strong>24–48 hours</strong>.
              </p>
            </div>

            {/* Notification items */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[16px]">mail</span>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-primary">Email Update</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Detailed onboarding instructions.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-emerald-600 text-[16px]">chat</span>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-600">WhatsApp Notification</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Instant activation alert.</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-1">
              <button
                className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              >
                View Application Summary
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
              <button
                onClick={onLogout}
                className="w-full py-3.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition-all border border-slate-200"
              >
                Sign Out Protocol
                <span className="material-symbols-outlined text-[16px]">logout</span>
              </button>
              <button
                onClick={onBackToWebsite}
                className="w-full text-center text-xs font-semibold text-slate-400 hover:text-primary transition-colors py-1"
              >
                Return to Homepage
              </button>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-8 py-4 text-[9px] font-medium text-slate-300 uppercase tracking-widest">
        <span>© 2024 Dampella Learning Management Systems</span>
        <div className="flex gap-6">
          <span className="hover:text-slate-400 cursor-pointer transition-colors">Privacy Architecture</span>
          <span className="hover:text-slate-400 cursor-pointer transition-colors">Academic Standards</span>
        </div>
      </div>
    </div>
  )
}

export function ProfileCompletionScreen({ user, onLogout }: { user: User, onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center font-sans">
       <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="max-w-md w-full space-y-12"
       >
          <div className="size-24 rounded-[3rem] bg-primary text-white flex items-center justify-center mx-auto shadow-2xl shadow-primary/20">
             <span className="material-symbols-outlined text-4xl">edit_note</span>
          </div>
          <div className="space-y-4">
             <h2 className="text-4xl font-black tracking-tighter uppercase leading-tight">Identity Binding<br />Required</h2>
             <p className="text-sm font-medium text-muted-foreground/60 leading-relaxed">
                Please complete your professional profile to access the institutional dashboard.
             </p>
          </div>
          <Button className="w-full h-16 rounded-[2rem] bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl">
             Complete Profile
          </Button>
          <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive" onClick={onLogout}>
             Sign Out
          </Button>
       </motion.div>
    </div>
  )
}

import { Button } from "@/components/ui/button"
