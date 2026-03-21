"use client"

import { Users, GraduationCap, Trophy, Calendar } from "lucide-react"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { FadeIn } from "@/components/ui/fade-in"
import { useSettings } from "@/lib/hooks/use-settings"

export function StatsSection() {
  const { settings } = useSettings()

  const stats = [
    {
      icon: Users,
      value: settings?.students || 0,
      suffix: "+",
      label: "Students",
      description: "Enrolled in our programs",
      gradient: "from-blue-500 to-cyan-400",
      glow: "shadow-blue-500/20",
      bg: "bg-blue-500/10",
    },
    {
      icon: GraduationCap,
      value: settings?.teachers || 0,
      suffix: "",
      label: "Teachers",
      description: "Dedicated educators",
      gradient: "from-violet-500 to-purple-400",
      glow: "shadow-violet-500/20",
      bg: "bg-violet-500/10",
    },
    {
      icon: Trophy,
      value: settings?.achievements || 0,
      suffix: "+",
      label: "Achievements",
      description: "Awards & recognitions",
      gradient: "from-amber-500 to-orange-400",
      glow: "shadow-amber-500/20",
      bg: "bg-amber-500/10",
    },
    {
      icon: Calendar,
      value: settings?.yearsOfExcellence || 0,
      suffix: "+",
      label: "Years",
      description: "Of educational excellence",
      gradient: "from-emerald-500 to-green-400",
      glow: "shadow-emerald-500/20",
      bg: "bg-emerald-500/10",
    },
  ]

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <FadeIn key={stat.label} delay={index * 120} direction="up">
              <div className={`group relative text-center p-8 rounded-3xl border border-white/5 bg-card hover:shadow-2xl ${stat.glow} transition-all duration-500 hover:-translate-y-2 overflow-hidden`}>
                {/* Background glow on hover */}
                <div className={`absolute inset-0 ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`} />

                {/* Icon */}
                <div className={`relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} mb-5 shadow-lg ${stat.glow} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-8 w-8 text-white" />
                </div>

                {/* Number */}
                <div className={`relative text-4xl md:text-5xl font-black mb-1 bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>

                <div className="relative text-lg font-bold text-foreground mb-1">{stat.label}</div>
                <div className="relative text-sm text-muted-foreground">{stat.description}</div>

                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-3/4 h-0.5 bg-gradient-to-r ${stat.gradient} transition-all duration-500 rounded-full`} />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
