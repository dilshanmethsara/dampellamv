"use client"

import { useEffect, useState } from "react"
import { collection, onSnapshot, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { galleryImages as fallbackImages, type GalleryImage } from "@/lib/data"

export function useGalleryImages() {
  const [images, setImages] = useState<GalleryImage[]>(fallbackImages)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, "gallery_images"), orderBy("created_at", "desc"))
    const unsub = onSnapshot(
      q,
      snap => {
        if (snap.empty) return // keep fallback
        setImages(snap.docs.map(d => ({ id: d.id, ...d.data() })) as GalleryImage[])
        setLoading(false)
      },
      err => console.error("Error fetching gallery images:", err)
    )
    return () => unsub()
  }, [])

  return { images, loading }
}
