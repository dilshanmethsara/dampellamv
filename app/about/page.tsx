import { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { FadeIn } from "@/components/ui/fade-in"
import { SectionHeader } from "@/components/ui/section-header"
import { Card, CardContent } from "@/components/ui/card"
import { Quote, User, Target, Eye, Heart, BookOpen, Award, Users } from "lucide-react"
import { schoolInfo } from "@/lib/data"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export const metadata: Metadata = {
  title: "About Us | Dampella Maha Vidyalaya",
  description: `Learn about MR/ Dampella M.V (Dampella Maha Vidyalaya) - our history, vision, mission, and values. A leading government school in Sri Lanka.`,
}

export default async function AboutPage() {
  const docRef = doc(db, 'school_settings', '1')
  const docSnap = await getDoc(docRef)
  const settings = docSnap.exists() ? docSnap.data() : null

  const info = {
    ...schoolInfo,
    ...settings,
    name: settings?.name || schoolInfo.name,
    fullName: settings?.fullName || settings?.full_name || schoolInfo.fullName,
    motto: settings?.motto || schoolInfo.motto,
    history: settings?.history || schoolInfo.history,
    vision: settings?.vision || schoolInfo.vision,
    mission: settings?.mission || schoolInfo.mission,
    students: settings?.students || schoolInfo.students,
    teachers: settings?.teachers || schoolInfo.teachers,
    achievements: settings?.achievements || schoolInfo.achievements,
    yearsOfExcellence: settings?.yearsOfExcellence || settings?.years_of_excellence || schoolInfo.yearsOfExcellence,
    principalName: settings?.principalName || settings?.principal_name || schoolInfo.principalName,
    principalMessage: settings?.principalMessage || settings?.principal_message || schoolInfo.principalMessage,
    values: settings?.values || schoolInfo.values,
  }

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
                  About Our School
                </h1>
                <p className="text-lg text-muted-foreground text-pretty">
                  Discover the story, values, and vision that make {info.name} a center of excellence in education.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* School History */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <SectionHeader
              title="Our History"
              subtitle="A legacy of educational excellence spanning decades"
            />
            
            <FadeIn direction="up">
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardContent className="p-8 md:p-12">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-xl mb-2">Established Over 50 Years Ago</h3>
                        <p className="text-muted-foreground">Serving the community since the beginning</p>
                      </div>
                    </div>
                    
                    <div className="prose prose-lg max-w-none">
                      {info.history.split('\n\n').map((paragraph: string, index: number) => (
                        <p key={index} className="text-muted-foreground leading-relaxed mb-4 last:mb-0">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <SectionHeader
              title="Vision & Mission"
              subtitle="Guiding principles that shape our educational approach"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <FadeIn direction="right" delay={0}>
                <Card className="h-full hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-6">
                      <Eye className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-foreground mb-4">Our Vision</h3>
                    <p className="text-muted-foreground leading-relaxed text-pretty">
                      {info.vision}
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>

              <FadeIn direction="left" delay={100}>
                <Card className="h-full hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-secondary/10 mb-6">
                      <Target className="h-7 w-7 text-secondary" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-foreground mb-4">Our Mission</h3>
                    <p className="text-muted-foreground leading-relaxed text-pretty">
                      {info.mission}
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <SectionHeader
              title="Our Core Values"
              subtitle="The principles that guide everything we do"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {info.values.map((value: string, index: number) => (
                <FadeIn key={value} direction="up" delay={index * 100}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                        <Heart className="h-6 w-6 text-accent group-hover:text-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground">{value}</h3>
                    </CardContent>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Principal's Message */}
        <section id="principal-message" className="py-12 bg-muted/30 scroll-mt-24">
          <div className="container mx-auto px-4">
            <SectionHeader
              title="Principal's Message"
              subtitle="Words of guidance from our school leader"
            />

            <FadeIn direction="up">
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardContent className="p-8 md:p-12 relative overflow-hidden">
                    {/* Decorative Quote */}
                    <div className="absolute top-4 right-4 opacity-10">
                      <Quote className="h-32 w-32 text-primary" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                        <div className="shrink-0">
                          <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center">
                            <User className="h-12 w-12 text-primary" />
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
                            {info.principalName}
                          </h3>
                          <p className="text-muted-foreground">Principal, {info.name}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {info.principalMessage.split('\n\n').map((paragraph: string, index: number) => (
                          <p key={index} className="text-muted-foreground leading-relaxed text-pretty">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <FadeIn direction="up">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-foreground/10 mb-4">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{info.students}+</div>
                  <div className="text-primary-foreground/70">Students</div>
                </div>
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-foreground/10 mb-4">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{info.teachers}</div>
                  <div className="text-primary-foreground/70">Teachers</div>
                </div>
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-foreground/10 mb-4">
                    <Award className="h-6 w-6" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{info.achievements}+</div>
                  <div className="text-primary-foreground/70">Achievements</div>
                </div>
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-foreground/10 mb-4">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{info.yearsOfExcellence}+</div>
                  <div className="text-primary-foreground/70">Years</div>
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
