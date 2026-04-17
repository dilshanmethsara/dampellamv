"use client"

import { GraduationCap, BookOpen, ArrowLeft, Stars, ShieldCheck, Zap } from "lucide-react"
import type { UserRole } from "@/lib/portal/auth-context"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/portal/theme-toggle"
import { LanguageToggle } from "@/components/portal/language-toggle"
import { useI18n } from "@/lib/portal/i18n-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { AnimatedContainer, childVariants } from "@/components/portal/premium-card"

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void
}

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  const { t, language } = useI18n()

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center p-16 xl:p-24 border-r border-border/50 bg-zinc-50 dark:bg-zinc-900/40 relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="relative z-10 max-w-lg">
          <div className="size-16 rounded-2xl bg-foreground text-background flex items-center justify-center mb-10 shadow-sm border border-border">
            <GraduationCap className="size-8" />
          </div>
          <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1] mb-6">
            Welcome to the <br/>
            <span className="text-muted-foreground">Pro-Portal.</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium leading-relaxed">
            The next-generation learning management system designed to elevate the educational experience for both teachers and students.
          </p>
        </div>
      </div>

      {/* Right Role Selection Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center relative bg-background p-6 sm:p-12 lg:p-16 xl:p-24">
        <div className="absolute top-8 left-8 z-20 md:hidden lg:block">
          <Link href="/">
            <Button variant="ghost" className="rounded-full font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-all gap-3 px-6">
              <ArrowLeft className="size-4" />
              {language === 'en' ? 'Core Hub' : 'ප්‍රධාන වෙබ් අඩවිය'}
            </Button>
          </Link>
        </div>

        <div className="absolute top-8 right-8 z-20 flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
        </div>

        <div className="w-full max-w-2xl mx-auto relative z-10">
          <AnimatedContainer className="">
            <motion.div variants={childVariants} className="mb-10 sm:mb-12 border-b border-border/50 pb-6 sm:pb-8">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 text-foreground uppercase leading-[0.9]">
                {t("roleSelector.welcome")}
              </h2>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed uppercase tracking-widest">
                {t("roleSelector.selectRole")}
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2">
              <motion.div variants={childVariants}>
                <RoleCard
                  title={t("common.student")}
                  description={t("roleSelector.studentDesc")}
                  icon={GraduationCap}
                  onClick={() => onSelectRole("student")}
                  color="indigo"
                  t={t}
                />
              </motion.div>
              <motion.div variants={childVariants}>
                <RoleCard
                  title={t("common.teacher")}
                  description={t("roleSelector.teacherDesc")}
                  icon={BookOpen}
                  onClick={() => onSelectRole("teacher")}
                  color="primary"
                  t={t}
                />
              </motion.div>
            </div>
            
            <motion.div variants={childVariants} className="mt-12 flex items-center justify-start gap-2">
              <ShieldCheck className="size-4 text-emerald-500 opacity-50" />
              <p className="text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground/40">
                {t("roleSelector.terms")}
              </p>
            </motion.div>
          </AnimatedContainer>
        </div>
      </div>
    </div>
  )
}

interface RoleCardProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  color: string
  t: (k: string) => string
}

function RoleCard({ title, description, icon: Icon, onClick, color, t }: RoleCardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "sleek-card group relative flex flex-col items-center gap-6 sm:gap-10 p-8 sm:p-12 lg:p-16 text-center cursor-pointer transition-all duration-700",
        "border-transparent"
      )}
    >
      <div className="relative">
        <div className={cn(
          "size-20 sm:size-28 rounded-full flex items-center justify-center relative z-10",
          "bg-indigo-50 dark:bg-zinc-800 text-indigo-600 shadow-sm transition-all duration-700 ease-out",
          "group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-2xl group-hover:shadow-indigo-500/40"
        )}>
          <Icon className="size-10 sm:size-12" />
        </div>
        <div className="absolute -bottom-2 translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 blur-sm bg-indigo-500/30 inset-x-0 h-4 rounded-full" />
      </div>

      <div className="space-y-3 sm:space-y-4 relative z-10">
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white uppercase leading-none">{title}</h2>
        <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[240px] sm:max-w-[280px] mx-auto">{description}</p>
      </div>

      <div className={cn(
        "sleek-btn mt-6 flex items-center justify-center gap-2 px-6 py-3"
      )}>
        <span className="text-[10px] font-black uppercase tracking-widest">{t("common.signIn")}</span>
        <Stars className="size-4" />
      </div>
    </div>
  )
}
