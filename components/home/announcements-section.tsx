"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FadeIn } from "@/components/ui/fade-in"
import { SectionHeader } from "@/components/ui/section-header"
import { ArrowRight, Calendar, Star, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase"

const categoryColors: Record<string, string> = {
  announcement: "bg-blue-100 text-blue-800",
  "special-event": "bg-purple-100 text-purple-800",
  "upcoming-event": "bg-green-100 text-green-800",
  achievement: "bg-amber-100 text-amber-800",
  sports: "bg-red-100 text-red-800",
  club: "bg-teal-100 text-teal-800",
}

const categoryLabels: Record<string, string> = {
  announcement: "Announcement",
  "special-event": "Special Event",
  "upcoming-event": "Upcoming Event",
  achievement: "Achievement",
  sports: "Sports",
  club: "Club Activity",
}

export function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('date', { ascending: false })
          .limit(3)
        if (error) throw error
        setAnnouncements(data || [])
      } catch (err) {
        console.error("Error fetching announcements:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPosts()
  }, [])

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="Latest Announcements"
          subtitle="Stay updated with the latest news and events from our school"
        />

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>No announcements yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((announcement, index) => (
              <FadeIn key={announcement.id} delay={index * 100} direction="up">
                <Link href={`/news/${announcement.id}`}>
                  <Card className="group h-full overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                    {announcement.image && (
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={announcement.image}
                          alt={announcement.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        {announcement.featured && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-accent text-accent-foreground gap-1">
                              <Star className="h-3 w-3" />
                              Featured
                            </Badge>
                          </div>
                        )}

                        {announcement.category && (
                          <div className="absolute bottom-3 left-3">
                            <Badge className={categoryColors[announcement.category] || "bg-gray-100 text-gray-800"}>
                              {categoryLabels[announcement.category] || announcement.category}
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}

                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4" />
                        <time dateTime={announcement.date}>
                          {new Date(announcement.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </time>
                      </div>

                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {announcement.title}
                      </h3>

                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {announcement.summary || announcement.content}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </FadeIn>
            ))}
          </div>
        )}

        <FadeIn direction="up" delay={300}>
          <div className="text-center mt-10">
            <Link href="/news">
              <Button variant="outline" size="lg" className="gap-2">
                View All Announcements
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
