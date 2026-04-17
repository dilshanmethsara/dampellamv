"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { FadeIn } from "@/components/ui/fade-in"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowLeft, Star, Share2, Loader2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore"

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

interface PageProps {
  params: Promise<{ id: string }>
}

export default function NewsDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const [announcement, setAnnouncement] = useState<any>(null)
  const [relatedAnnouncements, setRelatedAnnouncements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const docRef = doc(db, "announcements", id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as any
          setAnnouncement(data)

          // Fetch related
          const announcementsRef = collection(db, "announcements")
          const q = query(
            announcementsRef,
            where("category", "==", data.category),
            limit(4) // 3 + current
          )
          const querySnapshot = await getDocs(q)
          const related = querySnapshot.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(d => d.id !== id)
            .slice(0, 3)
          setRelatedAnnouncements(related)
        } else {
          setAnnouncement(null)
        }
      } catch (error) {
        console.error("Error fetching announcement details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="pt-24 min-h-screen flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground animate-pulse">Loading announcement...</p>
        </main>
        <Footer />
      </>
    )
  }

  if (!announcement) {
    notFound()
  }

  return (
    <>
      <Header />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative h-[400px] md:h-[500px]">
          {announcement.image ? (
            <Image
              src={announcement.image}
              alt={announcement.title}
              fill
              className="object-cover"
              priority
            />
          ) : announcement.image_url ? (
            <Image
              src={announcement.image_url}
              alt={announcement.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
               <Calendar className="h-20 w-20 text-muted-foreground/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          <div className="absolute inset-0 flex items-end">
            <div className="container mx-auto px-4 pb-12">
              <FadeIn direction="up">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className={categoryColors[announcement.category] || "bg-gray-100 text-gray-800"}>
                      {categoryLabels[announcement.category] || announcement.category}
                    </Badge>
                    {announcement.featured && (
                      <Badge className="bg-accent text-accent-foreground gap-1">
                        <Star className="h-3 w-3" />
                        Featured
                      </Badge>
                    )}
                  </div>

                  <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 text-balance">
                    {announcement.title}
                  </h1>

                  <div className="flex items-center gap-4 text-white/80">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <time dateTime={announcement.date}>
                        {new Date(announcement.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              {/* Back Button */}
              <FadeIn direction="right">
                <Link href="/news">
                  <Button variant="ghost" className="mb-8 gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to News
                  </Button>
                </Link>
              </FadeIn>

              {/* Article Content */}
              <FadeIn direction="up">
                <article className="prose prose-lg max-w-none">
                  {announcement.summary && (
                    <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                      {announcement.summary}
                    </p>
                  )}
                  
                  <div className="text-foreground leading-relaxed space-y-4">
                    {(announcement.content || "").split('\n\n').map((paragraph: string, index: number) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </article>
              </FadeIn>

              {/* Share Section */}
              <FadeIn direction="up" delay={200}>
                <div className="mt-12 pt-8 border-t">
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">Share this announcement</p>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Related Announcements */}
        {relatedAnnouncements.length > 0 && (
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4">
              <FadeIn direction="up">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
                  Related Announcements
                </h2>
              </FadeIn>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedAnnouncements.map((related, index) => (
                  <FadeIn key={related.id} delay={index * 100} direction="up">
                    <Link href={`/news/${related.id}`}>
                      <Card className="group h-full overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="relative h-40 overflow-hidden">
                          {related.image ? (
                             <Image
                               src={related.image}
                               alt={related.title}
                               fill
                               className="object-cover transition-transform duration-500 group-hover:scale-110"
                             />
                          ) : related.image_url ? (
                            <Image
                              src={related.image_url}
                              alt={related.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <Calendar className="h-10 w-10 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                            {related.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {related.summary}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
