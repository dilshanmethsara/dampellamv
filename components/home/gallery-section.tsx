"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SectionHeader } from "@/components/ui/section-header"
import { Expand, ArrowRight } from "lucide-react"
import { galleryImages } from "@/lib/data"

export function GallerySection() {
  const displayImages = galleryImages.slice(0, 6)

  return (
    <section className="py-24 bg-muted/20 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <SectionHeader
          title="Campus Life"
          subtitle="Glimpses of daily life, events, and activities at our school"
        />

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {displayImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="break-inside-avoid"
            >
              <div className="group relative rounded-3xl overflow-hidden glass-card shadow-lg hover:shadow-2xl transition-all duration-500">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Hover Overlay Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="inline-block px-3 py-1 mb-2 text-xs font-semibold bg-primary/90 text-primary-foreground rounded-full w-fit backdrop-blur-sm">
                      {image.category}
                    </span>
                    <h3 className="text-white font-medium text-lg capitalize">{image.alt}</h3>
                  </div>

                  {/* Expand Icon */}
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 hover:bg-primary text-white cursor-pointer">
                    <Expand className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link href="/gallery">
            <Button size="lg" className="rounded-full px-8 gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow">
              View Complete Gallery
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
