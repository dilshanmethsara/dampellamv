"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { galleryImages as fallbackImages, type GalleryImage } from "@/lib/data"

export function useGalleryImages() {
  const [images, setImages] = useState<GalleryImage[]>(fallbackImages)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const q = query(collection(db, "gallery_images"), orderBy("created_at", "desc"))
        const snap = await getDocs(q)
        if (cancelled) return
        if (snap.empty) return // keep fallback
        setImages(snap.docs.map(d => ({ id: d.id, ...d.data() })) as GalleryImage[])
      } catch (err) {
        console.error("Error fetching gallery images:", err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  return { images, loading }
}
