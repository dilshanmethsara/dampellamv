"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SectionHeader } from "@/components/ui/section-header"
import { ArrowRight, Calendar, Star, Loader2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore"

const categoryColors: Record<string, string> = {
  announcement: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  "special-event": "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  "upcoming-event": "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  achievement: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  sports: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  club: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
}

const categoryLabels: Record<string, string> = {
  announcement: "Announcement",
  "special-event": "Special Event",
  "upcoming-event": "Upcoming Event",
  achievement: "Achievement",
  sports: "Sports",
  club: "Club Activity",
}

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

export function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const announcementsRef = collection(db, 'announcements')
        const q = query(announcementsRef, orderBy('date', 'desc'), limit(3))
        const querySnapshot = await getDocs(q)
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setAnnouncements(data)
      } catch (err) {
        console.error("Error fetching announcements:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPosts()
  }, [])

  return (
    <section className="py-24 bg-muted/20">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="Latest Announcements"
          subtitle="Stay updated with the latest news and events from our school"
        />

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground bg-card/50 rounded-3xl border border-dashed border-border/50">
            <p>No announcements yet. Check back soon!</p>
          </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {announcements.map((announcement) => (
              <motion.div key={announcement.id} variants={item}>
                <Link href={`/news/${announcement.id}`} className="block h-full">
                  <div className="group h-full glass-card rounded-[2rem] overflow-hidden flex flex-col">
                    {announcement.image && (
                      <div className="relative h-56 overflow-hidden">
                        <Image
                          src={announcement.image}
                          alt={announcement.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                        
                        {announcement.featured && (
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-400 text-white border-none shadow-lg gap-1.5 py-1 px-3">
                              <Star className="h-3 w-3 fill-current" />
                              Featured
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        {announcement.category && (
                          <Badge variant="outline" className={`border ${categoryColors[announcement.category] || "bg-gray-100 text-gray-800"}`}>
                            {categoryLabels[announcement.category] || announcement.category}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <time dateTime={announcement.date}>
                            {new Date(announcement.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </time>
                        </div>
                      </div>

                      <h3 className="font-bold text-xl mb-3 line-clamp-2 group-hover:text-primary transition-colors text-foreground">
                        {announcement.title}
                      </h3>

                      <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1 text-pretty">
                        {announcement.summary || announcement.content}
                      </p>

                      <div className="mt-auto flex items-center text-sm font-semibold text-primary opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        Read More <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </Link>
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
          <Link href="/news">
            <Button size="lg" className="rounded-full px-8 gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow">
              View All Announcements
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
