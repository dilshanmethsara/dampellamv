"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { FadeIn } from "@/components/ui/fade-in"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Search, Star, ArrowRight, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { categories } from "@/lib/data"

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

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('date', { ascending: false })
        
        if (error) throw error
        setPosts(data || [])
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const filteredAnnouncements = useMemo(() => {
    return posts.filter((announcement) => {
      const matchesSearch = announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.summary.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || announcement.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory, posts])

  const featuredAnnouncements = filteredAnnouncements.filter(a => a.featured)
  const regularAnnouncements = filteredAnnouncements.filter(a => !a.featured)

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
                  News & Announcements
                </h1>
                <p className="text-lg text-muted-foreground text-pretty">
                  Stay updated with the latest news, events, and achievements from our school community.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Search & Filter */}
        <section className="py-8 bg-background border-b">
          <div className="container mx-auto px-4">
            <FadeIn direction="up">
              <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search announcements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </FadeIn>
          </div>
        </section>

        {isLoading ? (
          <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground animate-pulse">Loading news...</p>
          </div>
        ) : (
          <>
            {/* Featured Announcements */}
            {featuredAnnouncements.length > 0 && (
              <section className="py-12 bg-muted/30">
                <div className="container mx-auto px-4">
                  <FadeIn direction="up">
                    <h2 className="font-serif text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                      <Star className="h-6 w-6 text-accent" />
                      Featured
                    </h2>
                  </FadeIn>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {featuredAnnouncements.map((announcement, index) => (
                      <FadeIn key={announcement.id} delay={index * 100} direction="up">
                        <Link href={`/news/${announcement.id}`}>
                          <Card className="group h-full overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="flex flex-col md:flex-row h-full">
                              <div className="relative w-full md:w-2/5 h-48 md:h-auto shrink-0">
                                {announcement.image_url ? (
                                  <Image
                                    src={announcement.image_url}
                                    alt={announcement.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <Star className="h-10 w-10 text-muted-foreground/30" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 md:bg-gradient-to-l" />
                              </div>
                              <CardContent className="flex-1 p-6 flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-3">
                                  <Badge className={categoryColors[announcement.category]}>
                                    {categoryLabels[announcement.category]}
                                  </Badge>
                                  <Badge className="bg-accent text-accent-foreground gap-1">
                                    <Star className="h-3 w-3" />
                                    Featured
                                  </Badge>
                                </div>
                                
                                <h3 className="font-semibold text-xl mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                  {announcement.title}
                                </h3>
                                
                                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                  {announcement.summary}
                                </p>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  <time dateTime={announcement.date}>
                                    {new Date(announcement.date).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </time>
                                </div>
                              </CardContent>
                            </div>
                          </Card>
                        </Link>
                      </FadeIn>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* All Announcements */}
            <section className="py-12 bg-background">
              <div className="container mx-auto px-4">
                {regularAnnouncements.length > 0 ? (
                  <>
                    <FadeIn direction="up">
                      <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
                        All Announcements
                      </h2>
                    </FadeIn>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {regularAnnouncements.map((announcement, index) => (
                        <FadeIn key={announcement.id} delay={index * 50} direction="up">
                          <Link href={`/news/${announcement.id}`}>
                            <Card className="group h-full overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                              <div className="relative h-48 overflow-hidden">
                                {announcement.image_url ? (
                                  <Image
                                    src={announcement.image_url}
                                    alt={announcement.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <Calendar className="h-10 w-10 text-muted-foreground/30" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                
                                <div className="absolute bottom-3 left-3">
                                  <Badge className={categoryColors[announcement.category]}>
                                    {categoryLabels[announcement.category]}
                                  </Badge>
                                </div>
                              </div>

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
                                  {announcement.summary}
                                </p>
                              </CardContent>
                            </Card>
                          </Link>
                        </FadeIn>
                      ))}
                    </div>
                  </>
                ) : (
                  <FadeIn direction="up">
                    <div className="text-center py-12">
                      <p className="text-muted-foreground text-lg mb-4">
                        No announcements found matching your criteria.
                      </p>
                      <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}>
                        Clear Filters
                      </Button>
                    </div>
                  </FadeIn>
                )}
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  )
}
