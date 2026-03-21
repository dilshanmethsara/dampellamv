"use client"

import { GraduationCap, BookOpen, ArrowLeft } from "lucide-react"
import type { UserRole } from "@/lib/portal/auth-context"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/portal/theme-toggle"
import { LanguageToggle } from "@/components/portal/language-toggle"
import { useI18n } from "@/lib/portal/i18n-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void
}

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  const { t, language } = useI18n()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      <div className="absolute top-4 left-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            {language === 'en' ? 'Back to Website' : 'ප්‍රධාන වෙබ් අඩවියට'}
          </Button>
        </Link>
      </div>
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-balance">
            {t("roleSelector.welcome")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("roleSelector.selectRole")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <RoleCard
            title={t("common.student")}
            description={t("roleSelector.studentDesc")}
            icon={GraduationCap}
            onClick={() => onSelectRole("student")}
          />
          <RoleCard
            title={t("common.teacher")}
            description={t("roleSelector.teacherDesc")}
            icon={BookOpen}
            onClick={() => onSelectRole("teacher")}
          />
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          {t("roleSelector.terms")}
        </p>
      </div>
    </div>
  )
}

interface RoleCardProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
}

function RoleCard({ title, description, icon: Icon, onClick }: RoleCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center gap-4 rounded-xl border bg-card p-8 text-center",
        "transition-all duration-300 ease-out",
        "hover:border-primary/50 hover:bg-accent/50 hover:shadow-lg hover:shadow-primary/5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "active:scale-[0.98]"
      )}
    >
      <div
        className={cn(
          "flex size-16 items-center justify-center rounded-full bg-secondary",
          "transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground"
        )}
      >
        <Icon className="size-8" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground text-pretty">{description}</p>
      </div>
      <div
        className={cn(
          "absolute inset-0 rounded-xl border-2 border-transparent",
          "transition-all duration-300 group-hover:border-primary/20"
        )}
      />
    </button>
  )
}
