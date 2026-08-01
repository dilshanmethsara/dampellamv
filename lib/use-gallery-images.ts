"use client"

import { useEffect, useState } from "react"
import { collection, onSnapshot, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { GalleryImage } from "@/lib/data"

export function useGalleryImages() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, "gallery_images"), orderBy("created_at", "desc"))
    const unsub = onSnapshot(
      q,
      snap => {
        setImages(snap.docs.map(d => ({ id: d.id, ...d.data() })) as GalleryImage[])
        setLoading(false)
      },
      err => {
        console.error("Error fetching gallery images:", err)
        setLoading(false)
      }
    )
    return () => unsub()
  }, [])

  return { images, loading }
}
