import { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { FadeIn } from "@/components/ui/fade-in"
import { SectionHeader } from "@/components/ui/section-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, GraduationCap, FileText, Calendar, Users, Award } from "lucide-react"
import { academics, schoolInfo } from "@/lib/data"

export const metadata: Metadata = {
  title: "Academics",
  description: `Academic programs at ${schoolInfo.name} - grades, subjects, and examination information.`,
}

export default function AcademicsPage() {
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
                  Academic Programs
                </h1>
                <p className="text-lg text-muted-foreground text-pretty">
                  Comprehensive education from primary to secondary levels, preparing students for success.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Overview Stats */}
        <section className="py-12 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <FadeIn direction="up">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-foreground/10 mb-3">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-sm text-primary-foreground/70">Academic Levels</div>
                </div>
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-foreground/10 mb-3">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold">10+</div>
                  <div className="text-sm text-primary-foreground/70">Subjects</div>
                </div>
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-foreground/10 mb-3">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold">{schoolInfo.teachers}</div>
                  <div className="text-sm text-primary-foreground/70">Teachers</div>
                </div>
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-foreground/10 mb-3">
                    <Award className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm text-primary-foreground/70">Dedication</div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Grades & Subjects */}
        <section id="grades" className="py-20 bg-background scroll-mt-24">
          <div className="container mx-auto px-4">
            <SectionHeader
              title="Grades & Subjects"
              subtitle="Our comprehensive curriculum covers all essential subjects for holistic development"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {academics.grades.map((level, index) => (
                <FadeIn key={level.grade} delay={index * 100} direction="up">
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="pb-4">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
                        <GraduationCap className="h-7 w-7 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{level.grade}</CardTitle>
                      <CardDescription>{level.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">Subjects offered:</p>
                      <div className="flex flex-wrap gap-2">
                        {level.subjects.map((subject) => (
                          <Badge key={subject} variant="secondary" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Examinations */}
        <section id="exams" className="py-20 bg-muted/30 scroll-mt-24">
          <div className="container mx-auto px-4">
            <SectionHeader
              title="Examinations"
              subtitle="National and internal examinations to assess student progress"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {academics.examInfo.map((exam, index) => (
                <FadeIn key={exam.name} delay={index * 100} direction="up">
                  <Card className="h-full hover:shadow-lg transition-all duration-300 text-center">
                    <CardContent className="p-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 mb-4">
                        <FileText className="h-6 w-6 text-secondary" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{exam.name}</h3>
                      <p className="text-muted-foreground text-sm">{exam.description}</p>
                    </CardContent>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Academic Calendar Info */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <FadeIn direction="up">
              <div className="max-w-3xl mx-auto">
                <Card className="overflow-hidden">
                  <div className="bg-primary p-6 text-primary-foreground">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary-foreground/10">
                        <Calendar className="h-8 w-8" />
                      </div>
                      <div>
                        <h2 className="font-serif text-2xl font-bold">Academic Calendar</h2>
                        <p className="text-primary-foreground/70">Important dates and schedules</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                        <div className="shrink-0 w-16 text-center">
                          <div className="text-sm text-muted-foreground">Jan</div>
                          <div className="font-bold text-lg">Term 1</div>
                        </div>
                        <div>
                          <p className="font-medium">First Term Begins</p>
                          <p className="text-sm text-muted-foreground">Start of the academic year</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                        <div className="shrink-0 w-16 text-center">
                          <div className="text-sm text-muted-foreground">May</div>
                          <div className="font-bold text-lg">Term 2</div>
                        </div>
                        <div>
                          <p className="font-medium">Second Term Begins</p>
                          <p className="text-sm text-muted-foreground">Mid-year academic period</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                        <div className="shrink-0 w-16 text-center">
                          <div className="text-sm text-muted-foreground">Sep</div>
                          <div className="font-bold text-lg">Term 3</div>
                        </div>
                        <div>
                          <p className="font-medium">Third Term Begins</p>
                          <p className="text-sm text-muted-foreground">Final term of the academic year</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
