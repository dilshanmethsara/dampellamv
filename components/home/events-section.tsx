"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SectionHeader } from "@/components/ui/section-header"
import { ArrowRight, Calendar, Clock, MapPin, Sparkles, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase"

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
}

const item = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

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
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="Upcoming Events"
          subtitle="Mark your calendars for these exciting school events"
        />

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground glass-card rounded-[2rem]">
            <Calendar className="h-16 w-16 mx-auto mb-6 opacity-20" />
            <p className="text-lg">No upcoming events at the moment. Check back soon!</p>
          </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {events.map((event) => (
              <motion.div key={event.id} variants={item}>
                <div className={`group h-full glass-card rounded-[2rem] overflow-hidden flex flex-col relative ${
                  event.is_highlighted ? 'ring-2 ring-primary/50 shadow-primary/10' : ''
                }`}>
                  
                  {/* Floating Date Badge */}
                  <div className="absolute top-6 left-6 z-20 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md rounded-2xl w-16 h-16 shadow-xl border border-border/50 transform group-hover:-translate-y-1 group-hover:scale-110 transition-all duration-300">
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-2xl font-black text-foreground leading-none">{new Date(event.date).getDate()}</span>
                  </div>

                  {event.image ? (
                    <div className="relative h-60 overflow-hidden">
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-90" />
                      
                      {event.is_highlighted && (
                        <div className="absolute top-6 right-6 z-20">
                          <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 py-1 px-3 shadow-lg">
                            <Sparkles className="h-3 w-3" />
                            Featured
                          </Badge>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-24 bg-gradient-to-br from-primary/10 to-secondary/10" />
                  )}

                  <div className={`p-8 pt-6 flex-1 flex flex-col ${event.image ? '-mt-16 z-10' : ''}`}>
                    <h3 className="font-bold text-2xl mb-4 text-foreground group-hover:text-primary transition-colors leading-tight">
                      {event.title}
                    </h3>

                    {event.description && (
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-6 text-pretty">
                        {event.description}
                      </p>
                    )}

                    <div className="space-y-3 mt-auto pt-6 border-t border-border/50 text-sm font-medium">
                      {event.time && (
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Clock className="h-4 w-4 text-primary" />
                          </div>
                          <span>{event.time}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                            <MapPin className="h-4 w-4 text-secondary" />
                          </div>
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link href="/events">
            <Button variant="outline" size="lg" className="rounded-full px-8 gap-2 glass hover:bg-primary/5 hover:border-primary/50 transition-all">
              Explore All Events
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
