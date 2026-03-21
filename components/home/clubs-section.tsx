"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/ui/fade-in"
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
  { from: "from-blue-500", to: "to-cyan-400", glow: "shadow-blue-500/30", ring: "ring-blue-500/20" },
  { from: "from-emerald-500", to: "to-teal-400", glow: "shadow-emerald-500/30", ring: "ring-emerald-500/20" },
  { from: "from-amber-500", to: "to-orange-400", glow: "shadow-amber-500/30", ring: "ring-amber-500/20" },
  { from: "from-purple-500", to: "to-violet-400", glow: "shadow-purple-500/30", ring: "ring-purple-500/20" },
]

export function ClubsSection() {
  const displayClubs = clubs.slice(0, 4)

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.04)_0%,transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        <SectionHeader
          title="Clubs & Activities"
          subtitle="Discover opportunities to explore your interests and develop new skills"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayClubs.map((club, index) => {
            const Icon = iconMap[club.icon] || Trophy
            const g = gradients[index % gradients.length]
            return (
              <FadeIn key={club.id} delay={index * 100} direction="up">
                <div className={`group relative h-full p-px rounded-3xl bg-gradient-to-br ${g.from} ${g.to} opacity-100 hover:opacity-100 shadow-lg ${g.glow} hover:shadow-xl transition-all duration-500 hover:-translate-y-2`}>
                  <div className="h-full bg-card rounded-[calc(1.5rem-1px)] p-6 text-center flex flex-col items-center">
                    {/* Glow dot */}
                    <div className={`absolute top-3 right-3 w-2 h-2 rounded-full bg-gradient-to-br ${g.from} ${g.to} opacity-60 group-hover:opacity-100 transition-opacity`} />

                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-18 h-18 w-[72px] h-[72px] rounded-2xl bg-gradient-to-br ${g.from} ${g.to} mb-5 shadow-lg ${g.glow} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-9 w-9 text-white" />
                    </div>

                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                      {club.name}
                    </h3>

                    <p className="text-muted-foreground text-sm line-clamp-3 flex-1">
                      {club.description}
                    </p>

                    <div className={`mt-4 text-xs font-semibold bg-gradient-to-r ${g.from} ${g.to} bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1`}>
                      Learn more <ArrowRight className="h-3 w-3 text-primary" />
                    </div>
                  </div>
                </div>
              </FadeIn>
            )
          })}
        </div>

        <FadeIn direction="up" delay={400}>
          <div className="text-center mt-12">
            <Link href="/clubs">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow">
                Explore All Clubs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
