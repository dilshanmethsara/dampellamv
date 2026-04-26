import { UserRole } from "@/lib/portal/auth-context"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void
}

const roles: { id: UserRole; label: string; icon: string }[] = [
  { id: "student", label: "Student", icon: "school" },
  { id: "teacher", label: "Teacher", icon: "co_present" },
  { id: "admin", label: "Admin", icon: "admin_panel_settings" },
]

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  return (
    <div className="min-h-screen flex flex-col bg-surface overflow-x-hidden font-body">
      {/* Hero Section: The Intellectual LMS Branding */}
      <header className="relative overflow-hidden pt-12 pb-16 px-6 bg-primary text-white">
        <div className="organic-blob bg-tertiary-fixed w-64 h-64 -top-20 -left-20 rounded-full" />
        <div className="organic-blob bg-secondary-container w-72 h-72 -bottom-20 -right-10 rounded-full" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-4xl text-tertiary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>
              school
            </span>
            <h1 className="font-headline font-extrabold text-3xl tracking-tighter uppercase">Dampella</h1>
          </div>
          <h2 className="font-headline text-xl font-medium tracking-tight mb-3 text-secondary-fixed">
            Cultivating the Intellectual LMS
          </h2>
          <p className="font-body text-sm text-white/80 leading-relaxed max-w-xs opacity-80">
            Enter your private sanctuary of focused creation and curated knowledge.
          </p>
        </div>

        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow -mt-8 relative z-20 px-6 pb-12">
        <div className="bg-surface-container-lowest rounded-[2.5rem] shadow-[0_8px_30px_rgba(26,20,107,0.06)] p-8 max-w-lg mx-auto">
          {/* Role Selection */}
          <section className="mb-10 text-center">
            <label className="font-headline text-[10px] font-bold tracking-[0.15em] uppercase text-outline mb-4 block">
              Identify Your Intent
            </label>
            <div className="grid grid-cols-3 gap-3 text-center">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => onSelectRole(role.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300",
                    "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                  )}
                >
                  <span className="material-symbols-outlined mb-2">
                    {role.icon}
                  </span>
                  <span className="font-headline text-xs font-bold">{role.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Bottom Actions */}
          <div className="mt-10 text-center space-y-4">
            <div className="flex items-center justify-center gap-4 text-outline/30">
              <div className="h-[1px] w-12 bg-current" />
              <span className="font-label text-[10px] uppercase tracking-widest font-bold">New Scholar</span>
              <div className="h-[1px] w-12 bg-current" />
            </div>
            <button 
              onClick={() => {}}
              className="inline-flex items-center gap-2 font-headline text-sm font-bold text-tertiary hover:text-on-tertiary-container transition-colors group mx-auto disabled:opacity-50"
              disabled
            >
              Request LMS Access
              <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">east</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer Meta */}
      <footer className="mt-auto py-8 text-center px-6">
        <p className="font-label text-[10px] text-outline/50 tracking-widest uppercase mb-2">
          Version 4.2.0 • Deep Intelligence
        </p>
        <div className="flex justify-center gap-6">
          {['Privacy', 'Terms', 'Support'].map((link) => (
            <a key={link} href="#" className="font-label text-[10px] font-bold text-outline hover:text-primary uppercase tracking-widest transition-colors">
              {link}
            </a>
          ))}
        </div>
      </footer>
    </div>
  )
}
