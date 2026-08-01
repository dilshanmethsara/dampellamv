import { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { FadeIn } from "@/components/ui/fade-in"
import { SectionHeader } from "@/components/ui/section-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Monitor, FlaskConical, Trophy, Music, Palette, Theater, Leaf, Crown, Users, Star } from "lucide-react"
import { clubs, schoolInfo } from "@/lib/data"

export const metadata: Metadata = {
  title: "Clubs & Societies",
  description: `Explore clubs and extracurricular activities at ${schoolInfo.name} - ICT, Sports, Music, Art, and more.`,
}

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

const colorClasses = [
  { bg: "bg-blue-500/10", text: "text-blue-600", hover: "group-hover:bg-blue-500" },
  { bg: "bg-emerald-500/10", text: "text-emerald-600", hover: "group-hover:bg-emerald-500" },
  { bg: "bg-amber-500/10", text: "text-amber-600", hover: "group-hover:bg-amber-500" },
  { bg: "bg-rose-500/10", text: "text-rose-600", hover: "group-hover:bg-rose-500" },
  { bg: "bg-purple-500/10", text: "text-purple-600", hover: "group-hover:bg-purple-500" },
  { bg: "bg-cyan-500/10", text: "text-cyan-600", hover: "group-hover:bg-cyan-500" },
  { bg: "bg-green-500/10", text: "text-green-600", hover: "group-hover:bg-green-500" },
  { bg: "bg-orange-500/10", text: "text-orange-600", hover: "group-hover:bg-orange-500" },
]

export default function ClubsPage() {
  return (
    <>
      <Header />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="container mx-auto px-4">
            <FadeIn direction="up">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
                  Clubs & Societies
                </h1>
                <p className="text-lg text-muted-foreground text-pretty">
                  Discover your passions and develop new skills through our diverse range of extracurricular activities.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Why Join Section */}
        <section className="py-12 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <FadeIn direction="up">
              <div className="max-w-4xl mx-auto">
                <h2 className="font-serif text-2xl font-bold text-center mb-8">Why Join a Club?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-foreground/10 mb-4">
                      <Users className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold mb-2">Build Friendships</h3>
                    <p className="text-sm text-primary-foreground/70">Connect with like-minded students who share your interests</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-foreground/10 mb-4">
                      <Star className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold mb-2">Develop Skills</h3>
                    <p className="text-sm text-primary-foreground/70">Learn new abilities and enhance existing talents</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-foreground/10 mb-4">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold mb-2">Achieve Excellence</h3>
                    <p className="text-sm text-primary-foreground/70">Participate in competitions and earn recognition</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* All Clubs */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <SectionHeader
              title="Our Clubs"
              subtitle="Explore the variety of clubs and activities available to all students"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {clubs.map((club, index) => {
                const Icon = iconMap[club.icon] || Trophy
                const colors = colorClasses[index % colorClasses.length]
                
                return (
                  <FadeIn key={club.id} delay={index * 50} direction="up">
                    <Card className="group h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                      <CardContent className="p-6">
                        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 transition-all duration-300 ${colors.bg} ${colors.text} ${colors.hover} group-hover:text-white`}>
                          <Icon className="h-7 w-7" />
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                          {club.name}
                        </h3>
                        
                        <p className="text-muted-foreground text-sm mb-4">
                          {club.description}
                        </p>

                        <div>
                          <p className="text-xs text-muted-foreground mb-2 font-medium">Activities:</p>
                          <div className="flex flex-wrap gap-1">
                            {club.activities.slice(0, 3).map((activity) => (
                              <Badge key={activity} variant="secondary" className="text-xs">
                                {activity}
                              </Badge>
                            ))}
                            {club.activities.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{club.activities.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </FadeIn>
                )
              })}
            </div>
          </div>
        </section>

        {/* Join CTA */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <FadeIn direction="up">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
                  Ready to Join?
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  Speak to your class teacher or the club coordinator to learn more about joining any of our clubs and societies.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary">
                  <Users className="h-5 w-5" />
                  <span className="font-medium">New members welcome throughout the year!</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
