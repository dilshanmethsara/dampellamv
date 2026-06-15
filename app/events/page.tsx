"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { FadeIn } from "@/components/ui/fade-in"
import { SectionHeader } from "@/components/ui/section-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Sparkles, CalendarDays, History, Loader2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, getDocs, orderBy } from "firebase/firestore"

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = new Date(targetDate).getTime() - new Date().getTime()
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0 }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return { days, hours, minutes }
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = new Date(targetDate).getTime() - new Date().getTime()
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 })
        clearInterval(interval)
        return
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      setTimeLeft({ days, hours, minutes })
    }, 60000)

    return () => clearInterval(interval)
  }, [targetDate])

  return (
    <div className="flex items-center gap-2">
      <div className="text-center px-3 py-2 bg-primary/10 rounded-lg">
        <div className="text-lg font-bold text-primary">{timeLeft.days}</div>
        <div className="text-xs text-muted-foreground">Days</div>
      </div>
      <div className="text-center px-3 py-2 bg-primary/10 rounded-lg">
        <div className="text-lg font-bold text-primary">{timeLeft.hours}</div>
        <div className="text-xs text-muted-foreground">Hours</div>
      </div>
      <div className="text-center px-3 py-2 bg-primary/10 rounded-lg">
        <div className="text-lg font-bold text-primary">{timeLeft.minutes}</div>
        <div className="text-xs text-muted-foreground">Min</div>
      </div>
    </div>
  )
}

function EventCard({ event, index }: { event: any; index: number }) {
  return (
    <FadeIn delay={index * 100} direction="up">
      <Card className={`group h-full overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
        event.is_highlighted && !event.is_past ? 'ring-2 ring-primary' : ''
      }`}>
        <div className="relative h-48 overflow-hidden">
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Calendar className="h-10 w-10 text-muted-foreground/30" />
            </div>
          )}
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

          {/* Status Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {event.is_highlighted && !event.is_past && (
              <Badge className="bg-primary text-primary-foreground gap-1">
                <Sparkles className="h-3 w-3" />
                Featured
              </Badge>
            )}
            {event.is_past && (
              <Badge variant="secondary">Past Event</Badge>
            )}
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="font-semibold text-lg text-white mb-1">
              {event.title}
            </h3>
          </div>
        </div>

        <CardContent className="p-5 space-y-4">
          <p className="text-muted-foreground text-sm line-clamp-2">
            {event.description}
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{event.location}</span>
            </div>
          </div>

          {/* Countdown for upcoming highlighted events */}
          {event.is_highlighted && !event.is_past && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Time remaining:</p>
              <CountdownTimer targetDate={event.date} />
            </div>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  )
}

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true)
      try {
        const eventsRef = collection(db, 'events')
        const q = query(eventsRef, orderBy('date', 'desc'))
        const querySnapshot = await getDocs(q)
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setEvents(data)
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const upcomingEvents = events.filter(e => !e.is_past)
  const pastEvents = events.filter(e => e.is_past)
  const highlightedEvents = upcomingEvents.filter(e => e.is_highlighted)

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
                  School Events
                </h1>
                <p className="text-lg text-muted-foreground text-pretty">
                  Mark your calendars for upcoming events and celebrations at our school.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {isLoading ? (
          <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground animate-pulse">Loading events...</p>
          </div>
        ) : (
          <>
            {/* Highlighted Events */}
            {highlightedEvents.length > 0 && (
              <section className="py-12 bg-muted/30">
                <div className="container mx-auto px-4">
                  <FadeIn direction="up">
                    <h2 className="font-serif text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-accent" />
                      Featured Events
                    </h2>
                  </FadeIn>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {highlightedEvents.map((event, index) => (
                      <EventCard key={event.id} event={event} index={index} />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* All Events with Tabs */}
            <section className="py-12 bg-background">
              <div className="container mx-auto px-4">
                <Tabs defaultValue="upcoming" className="w-full">
                  <FadeIn direction="up">
                    <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                      <TabsTrigger value="upcoming" className="gap-2">
                        <CalendarDays className="h-4 w-4" />
                        Upcoming ({upcomingEvents.length})
                      </TabsTrigger>
                      <TabsTrigger value="past" className="gap-2">
                        <History className="h-4 w-4" />
                        Past ({pastEvents.length})
                      </TabsTrigger>
                    </TabsList>
                  </FadeIn>

                  <TabsContent value="upcoming">
                    {upcomingEvents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingEvents.map((event, index) => (
                          <EventCard key={event.id} event={event} index={index} />
                        ))}
                      </div>
                    ) : (
                      <FadeIn direction="up">
                        <div className="text-center py-12">
                          <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground text-lg">
                            No upcoming events at the moment. Check back soon!
                          </p>
                        </div>
                      </FadeIn>
                    )}
                  </TabsContent>

                  <TabsContent value="past">
                    {pastEvents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pastEvents.map((event, index) => (
                          <EventCard key={event.id} event={event} index={index} />
                        ))}
                      </div>
                    ) : (
                      <FadeIn direction="up">
                        <div className="text-center py-12">
                          <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground text-lg">
                            No past events to show.
                          </p>
                        </div>
                      </FadeIn>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  )
}
