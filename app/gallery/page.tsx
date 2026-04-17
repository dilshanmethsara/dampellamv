"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { FadeIn } from "@/components/ui/fade-in"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { X, ChevronLeft, ChevronRight, Grid, LayoutGrid } from "lucide-react"
import { galleryImages } from "@/lib/data"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "masonry">("grid")

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(galleryImages.map(img => img.category))
    return ["all", ...Array.from(cats)]
  }, [])

  // Filter images
  const filteredImages = useMemo(() => {
    if (selectedCategory === "all") return galleryImages
    return galleryImages.filter(img => img.category === selectedCategory)
  }, [selectedCategory])

  const openLightbox = (index: number) => setSelectedIndex(index)
  const closeLightbox = () => setSelectedIndex(null)
  
  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? filteredImages.length - 1 : selectedIndex - 1)
    }
  }
  
  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === filteredImages.length - 1 ? 0 : selectedIndex + 1)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (selectedIndex === null) return
    if (e.key === "ArrowLeft") goToPrevious()
    if (e.key === "ArrowRight") goToNext()
    if (e.key === "Escape") closeLightbox()
  }

  return (
    <>
      <Header />
      <main className="pt-24" onKeyDown={handleKeyDown}>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="container mx-auto px-4">
            <FadeIn direction="up">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
                  Photo Gallery
                </h1>
                <p className="text-lg text-muted-foreground text-pretty">
                  Explore memorable moments and events from our school life through our photo collection.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Filters & View Toggle */}
        <section className="py-8 bg-background border-b sticky top-16 z-30">
          <div className="container mx-auto px-4">
            <FadeIn direction="up">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Category Filter */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="capitalize"
                    >
                      {category === "all" ? "All Photos" : category}
                    </Button>
                  ))}
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon-sm"
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "masonry" ? "default" : "outline"}
                    size="icon-sm"
                    onClick={() => setViewMode("masonry")}
                    aria-label="Masonry view"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.map((image, index) => (
                  <FadeIn key={image.id} delay={index * 30} direction="up">
                    <button
                      onClick={() => openLightbox(index)}
                      className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 w-full"
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                        <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary/80 px-3 py-1 rounded-full text-sm">
                          {image.category}
                        </span>
                      </div>
                    </button>
                  </FadeIn>
                ))}
              </div>
            ) : (
              <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {filteredImages.map((image, index) => (
                  <FadeIn key={image.id} delay={index * 30} direction="up">
                    <button
                      onClick={() => openLightbox(index)}
                      className="group relative overflow-hidden rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 w-full break-inside-avoid"
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={400}
                        height={index % 3 === 0 ? 500 : index % 3 === 1 ? 300 : 400}
                        className="w-full object-cover transition-transform duration-500 group-hover:scale-110 rounded-xl"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center rounded-xl">
                        <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary/80 px-3 py-1 rounded-full text-sm">
                          {image.category}
                        </span>
                      </div>
                    </button>
                  </FadeIn>
                ))}
              </div>
            )}

            {filteredImages.length === 0 && (
              <FadeIn direction="up">
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No photos found in this category.
                  </p>
                </div>
              </FadeIn>
            )}
          </div>
        </section>

        {/* Lightbox Dialog */}
        <Dialog open={selectedIndex !== null} onOpenChange={() => closeLightbox()}>
          <DialogContent className="max-w-5xl p-0 bg-black/95 border-none">
            <VisuallyHidden>
              <DialogTitle>Gallery Image</DialogTitle>
            </VisuallyHidden>
            {selectedIndex !== null && (
              <div className="relative">
                <button
                  onClick={closeLightbox}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5 text-white" />
                </button>

                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>

                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>

                <div className="aspect-video relative">
                  <Image
                    src={filteredImages[selectedIndex].src}
                    alt={filteredImages[selectedIndex].alt}
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="p-4 text-center">
                  <p className="text-white font-medium">{filteredImages[selectedIndex].alt}</p>
                  <p className="text-white/60 text-sm mt-1">
                    {filteredImages[selectedIndex].category} &bull; {selectedIndex + 1} of {filteredImages.length}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </>
  )
}
