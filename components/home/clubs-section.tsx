"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SectionHeader } from "@/components/ui/section-header"
import { ArrowRight, Monitor, FlaskConical, Trophy, Music, Palette, Theater, Leaf, Crown } from "lucide-react"
import { clubs } from "@/lib/data"

const iconMap: Record<string, React.ElementType> = {
  computer: Monitor,
  flask: FlaskConical,
  trophy: Trophy,
  music: Music,
  palette: Palette,
  theater: Theater,
  leaf: Leaf,
  chess: Crown,
}

const gradients = [
  { from: "from-blue-500", to: "to-cyan-400", glow: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]", text: "group-hover:text-blue-500", bg: "bg-blue-500/10 text-blue-500" },
  { from: "from-emerald-500", to: "to-teal-400", glow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]", text: "group-hover:text-emerald-500", bg: "bg-emerald-500/10 text-emerald-500" },
  { from: "from-amber-500", to: "to-orange-400", glow: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]", text: "group-hover:text-amber-500", bg: "bg-amber-500/10 text-amber-500" },
  { from: "from-purple-500", to: "to-violet-400", glow: "group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]", text: "group-hover:text-purple-500", bg: "bg-purple-500/10 text-purple-500" },
]

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export function ClubsSection() {
  const displayClubs = clubs.slice(0, 4)

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.03)_0%,transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        <SectionHeader
          title="Clubs & Activities"
          subtitle="Discover opportunities to explore your interests and develop new skills"
        />

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {displayClubs.map((club, index) => {
            const Icon = iconMap[club.icon] || Trophy
            const g = gradients[index % gradients.length]
            return (
              <motion.div key={club.id} variants={item}>
                <div className={`group relative h-full glass-card rounded-[2rem] p-8 text-center flex flex-col items-center border border-border/50 hover:border-transparent ${g.glow} transition-all duration-500 overflow-hidden`}>
                  
                  {/* Hover background */}
                  <div className={`absolute -inset-1 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${g.from} ${g.to} transition-opacity duration-500`} />
                  
                  {/* Expanding ring on hover */}
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 rounded-full bg-gradient-to-br ${g.from} ${g.to} opacity-0 group-hover:w-[150%] group-hover:h-auto group-hover:aspect-square group-hover:opacity-5 transition-all duration-700 ease-out`} />

                  {/* Icon Container */}
                  <div className={`relative inline-flex items-center justify-center w-20 h-20 rounded-2xl ${g.bg} mb-6 transform group-hover:-translate-y-2 group-hover:scale-110 transition-all duration-500`}>
                    <Icon className="h-10 w-10" />
                  </div>

                  <h3 className={`font-bold text-xl mb-3 ${g.text} transition-colors duration-300`}>
                    {club.name}
                  </h3>

                  <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1 relative z-10">
                    {club.description}
                  </p>

                  <div className={`mt-auto inline-flex items-center text-sm font-semibold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 ${g.text}`}>
                    Learn more <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link href="/clubs">
            <Button variant="outline" size="lg" className="rounded-full px-8 gap-2 glass hover:bg-primary/5 hover:border-primary/50 transition-all">
              Explore All Clubs
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
