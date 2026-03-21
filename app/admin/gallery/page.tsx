"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Trash2, Grid, LayoutGrid, Loader2, ImageIcon } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"

interface GalleryImage {
  id: string
  src: string
  alt: string
  category: string
  created_at: string
}

const PRESET_CATEGORIES = ["Sports", "Academic", "Cultural", "Events", "Campus", "Clubs"]

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [newSrc, setNewSrc] = useState("")
  const [newAlt, setNewAlt] = useState("")
  const [newCategory, setNewCategory] = useState("")

  const supabase = createClient()

  const fetchImages = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setImages(data || [])
    } catch (err) {
      console.error("Error fetching gallery:", err)
      toast.error("Failed to load gallery images")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [])

  const categories = useMemo(() => {
    const cats = new Set(images.map(img => img.category).filter(Boolean))
    return ["all", ...Array.from(cats)]
  }, [images])

  const filteredImages = images.filter(image => {
    const matchesSearch = (image.alt || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (image.category || "").toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || image.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAddImage = async () => {
    if (!newSrc.trim() || !newAlt.trim()) {
      toast.error("Image URL and description are required")
      return
    }
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('gallery_images')
        .insert({
          src: newSrc.trim(),
          alt: newAlt.trim(),
          category: newCategory || "General"
        })
      if (error) throw error
      toast.success("Image added to gallery")
      setNewSrc("")
      setNewAlt("")
      setNewCategory("")
      setIsDialogOpen(false)
      fetchImages()
    } catch (err) {
      console.error("Error adding image:", err)
      toast.error("Failed to add image")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this image from the gallery?")) return
    try {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', id)
      if (error) throw error
      setImages(images.filter(img => img.id !== id))
      toast.success("Image removed")
    } catch (err) {
      console.error("Error deleting image:", err)
      toast.error("Failed to remove image")
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Gallery</h1>
          <p className="text-muted-foreground">
            Manage photos and images displayed on the website
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 h-11 rounded-xl">
              <Plus className="h-4 w-4" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>Add Gallery Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="img-src">Image URL *</Label>
                <Input
                  id="img-src"
                  placeholder="https://example.com/image.jpg"
                  value={newSrc}
                  onChange={e => setNewSrc(e.target.value)}
                  className="h-11 rounded-xl"
                />
                <p className="text-xs text-muted-foreground">Paste a direct link to the image (Imgur, Cloudinary, etc.)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="img-alt">Description / Caption *</Label>
                <Input
                  id="img-alt"
                  placeholder="e.g. Students at Annual Sports Day"
                  value={newAlt}
                  onChange={e => setNewAlt(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="img-category">Category</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger id="img-category" className="h-11 rounded-xl">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESET_CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {newSrc && (
                <div className="relative rounded-xl overflow-hidden border aspect-video bg-muted">
                  <Image src={newSrc} alt="Preview" fill className="object-cover" onError={() => {}} />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddImage} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Add Image
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <Card className="rounded-2xl border-muted/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{images.length}</p>
            <p className="text-sm text-muted-foreground">Total Images</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-muted/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{categories.length - 1}</p>
            <p className="text-sm text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-muted/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{filteredImages.length}</p>
            <p className="text-sm text-muted-foreground">Filtered</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search images..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-11 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-11 rounded-xl w-full sm:w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(c => (
                <SelectItem key={c} value={c} className="capitalize">
                  {c === "all" ? "All Categories" : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 border rounded-xl p-1 shrink-0">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="h-8 w-8 rounded-lg p-0"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="h-8 w-8 rounded-lg p-0"
              onClick={() => setViewMode("list")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <Card className="rounded-2xl overflow-hidden border-muted/50">
        <CardContent className="p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading gallery...</p>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium">No images found</p>
              <p className="text-sm text-muted-foreground">Add images using the button above</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredImages.map(image => (
                <div key={image.id} className="group relative aspect-square rounded-xl overflow-hidden bg-muted">
                  <Image src={image.src} alt={image.alt} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDelete(image.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary" className="text-xs">{image.category}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredImages.map(image => (
                <div key={image.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                    <Image src={image.src} alt={image.alt} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{image.alt}</p>
                    <Badge variant="outline" className="text-xs mt-1">{image.category}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={() => handleDelete(image.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
