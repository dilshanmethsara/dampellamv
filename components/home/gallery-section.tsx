"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { FadeIn } from "@/components/ui/fade-in"
import { SectionHeader } from "@/components/ui/section-header"
import { ArrowRight, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export function GallerySection() {
  const [images, setImages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchImages() {
      try {
        const { data, error } = await supabase
          .from('gallery_images')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6)
        if (error) throw error
        setImages(data || [])
      } catch (err) {
        console.error("Error fetching gallery images:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchImages()
  }, [])

  const openLightbox = (index: number) => setSelectedIndex(index)
  const closeLightbox = () => setSelectedIndex(null)

  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1)
    }
  }

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1)
    }
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="School Gallery"
          subtitle="Glimpses of our vibrant school life and memorable moments"
        />

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>No gallery images yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <FadeIn key={image.id} delay={index * 50} direction="up">
                <button
                  onClick={() => openLightbox(index)}
                  className="group relative w-full aspect-square overflow-hidden rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 block"
                >
                  <Image
                    src={image.src || image.image_url}
                    alt={image.alt || image.title || "Gallery image"}
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
        )}

        <FadeIn direction="up" delay={300}>
          <div className="text-center mt-10">
            <Link href="/gallery">
              <Button variant="outline" size="lg" className="gap-2">
                View Full Gallery
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </FadeIn>

        {/* Lightbox Dialog */}
        <Dialog open={selectedIndex !== null} onOpenChange={() => closeLightbox()}>
          <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
            <VisuallyHidden>
              <DialogTitle>Gallery Image</DialogTitle>
            </VisuallyHidden>
            {selectedIndex !== null && images[selectedIndex] && (
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>

                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>

                <div className="aspect-video relative">
                  <Image
                    src={images[selectedIndex].src || images[selectedIndex].image_url}
                    alt={images[selectedIndex].alt || images[selectedIndex].title || "Gallery image"}
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="p-4 text-center">
                  <p className="text-white font-medium">{images[selectedIndex].alt || images[selectedIndex].title}</p>
                  <p className="text-white/60 text-sm">{images[selectedIndex].category}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}
