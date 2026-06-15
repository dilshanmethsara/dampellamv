"use client"

import { Users, GraduationCap, Trophy, Calendar } from "lucide-react"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { motion } from "framer-motion"
import { useSettings } from "@/lib/hooks/use-settings"

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
}

export function StatsSection() {
  const { settings } = useSettings()

  const stats = [
    {
      icon: Users,
      value: settings?.students || 0,
      suffix: "+",
      label: "Students",
      description: "Enrolled in our programs",
      color: "from-blue-500 to-cyan-400",
      shadow: "shadow-blue-500/20",
    },
    {
      icon: GraduationCap,
      value: settings?.teachers || 0,
      suffix: "",
      label: "Teachers",
      description: "Dedicated educators",
      color: "from-violet-500 to-purple-400",
      shadow: "shadow-violet-500/20",
    },
    {
      icon: Trophy,
      value: settings?.achievements || 0,
      suffix: "+",
      label: "Achievements",
      description: "Awards & recognitions",
      color: "from-amber-500 to-orange-400",
      shadow: "shadow-amber-500/20",
    },
    {
      icon: Calendar,
      value: settings?.yearsOfExcellence || 0,
      suffix: "+",
      label: "Years",
      description: "Of educational excellence",
      color: "from-emerald-500 to-teal-400",
      shadow: "shadow-emerald-500/20",
    },
  ]

  return (
    <section className="py-24 relative z-10 -mt-12 sm:-mt-20">
      <div className="container mx-auto px-4">
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.label} 
              variants={item}
              className="group glass-card rounded-3xl p-8 relative overflow-hidden"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl z-0" style={{ backgroundImage: 'var(--tw-gradient-stops)' }} />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} ${stat.shadow} mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl`}>
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className={`text-4xl md:text-5xl font-black mb-2 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent drop-shadow-sm flex items-center justify-center`}>
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </h3>
                
                <p className="text-lg font-bold text-foreground mb-1">{stat.label}</p>
                <p className="text-sm text-muted-foreground font-medium">{stat.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
