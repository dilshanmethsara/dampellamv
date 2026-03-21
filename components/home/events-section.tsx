"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FadeIn } from "@/components/ui/fade-in"
import { SectionHeader } from "@/components/ui/section-header"
import { ArrowRight, Calendar, Clock, MapPin, Sparkles, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase"

export function EventsSection() {
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchEvents() {
      try {
        const now = new Date().toISOString().split('T')[0]
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .gte('date', now)
          .order('date', { ascending: true })
          .limit(3)
        if (error) throw error
        setEvents(data || [])
      } catch (err) {
        console.error("Error fetching events:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchEvents()
  }, [])

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="Upcoming Events"
          subtitle="Mark your calendars for these exciting school events"
        />

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No upcoming events at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <FadeIn key={event.id} delay={index * 100} direction="up">
                <Card className={`group h-full overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                  event.is_highlighted ? 'ring-2 ring-primary' : ''
                }`}>
                  {event.image && (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                      {/* Date Badge */}
                      <div className="absolute top-3 left-3 bg-background rounded-lg p-2 text-center min-w-[60px]">
                        <div className="text-xs text-muted-foreground uppercase">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="text-xl font-bold text-foreground">
                          {new Date(event.date).getDate()}
                        </div>
                      </div>

                      {event.is_highlighted && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-primary text-primary-foreground gap-1">
                            <Sparkles className="h-3 w-3" />
                            Featured
                          </Badge>
                        </div>
                      )}

                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="font-semibold text-lg text-white mb-1">
                          {event.title}
                        </h3>
                      </div>
                    </div>
                  )}

                  {!event.image && (
                    <div className="p-5 border-b">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-primary/10 rounded-lg p-2 text-center min-w-[60px]">
                          <div className="text-xs text-muted-foreground uppercase">
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                          <div className="text-xl font-bold text-primary">
                            {new Date(event.date).getDate()}
                          </div>
                        </div>
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                      </div>
                    </div>
                  )}

                  <CardContent className="p-5 space-y-3">
                    {event.description && (
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    <div className="space-y-2 text-sm">
                      {event.time && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4 shrink-0" />
                          <span>{event.time}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        )}

        <FadeIn direction="up" delay={300}>
          <div className="text-center mt-10">
            <Link href="/events">
              <Button variant="outline" size="lg" className="gap-2">
                View All Events
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
