"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, Star, Calendar, Eye, Loader2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  orderBy 
} from "firebase/firestore"
import { toast } from "sonner"
import { categories } from "@/lib/data"

const categoryLabels: Record<string, string> = {
  announcement: "Announcement",
  "special-event": "Special Event",
  "upcoming-event": "Upcoming Event",
  achievement: "Achievement",
  sports: "Sports",
  club: "Club Activity",
}

export default function AdminPostsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dbPosts, setDbPosts] = useState<any[]>([])

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    summary: "",
    content: "",
    image_url: "",
    featured: false
  })

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    setIsLoading(true)
    try {
      const announcementsRef = collection(db, 'announcements')
      const q = query(announcementsRef, orderBy('date', 'desc'))
      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      
      setDbPosts(data)
    } catch (error: any) {
      toast.error("Failed to fetch posts: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreatePost() {
    if (!formData.title || !formData.category || !formData.content) {
      toast.error("Please fill in required fields (Title, Category, Content)")
      return
    }

    setIsSubmitting(true)
    try {
      const announcementsRef = collection(db, 'announcements')
      await addDoc(announcementsRef, {
        ...formData,
        date: new Date().toISOString().split('T')[0] // Set current date as post date
      })
      
      toast.success("Post created successfully!")
      setIsCreateDialogOpen(false)
      setFormData({
        title: "",
        category: "",
        summary: "",
        content: "",
        image_url: "",
        featured: false
      })
      fetchPosts()
    } catch (error: any) {
      toast.error("Failed to create post: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeletePost(id: string) {
    if (!confirm("Are you sure you want to delete this post?")) return
    try {
      await deleteDoc(doc(db, 'announcements', id))
      toast.success("Post deleted successfully!")
      fetchPosts()
    } catch (error: any) {
      toast.error("Failed to delete post: " + error.message)
    }
  }


  const filteredPosts = dbPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Posts</h1>
          <p className="text-muted-foreground">
            Manage announcements, news, and updates
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="title">Title</FieldLabel>
                  <Input 
                    id="title" 
                    placeholder="Enter post title" 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="category">Category</FieldLabel>
                  <Select 
                    value={formData.category} 
                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c.value !== "all").map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="image">Image URL</FieldLabel>
                  <Input 
                    id="image" 
                    placeholder="https://example.com/image.jpg" 
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="summary">Summary</FieldLabel>
                  <Textarea 
                    id="summary" 
                    placeholder="Brief summary of the post" 
                    rows={2} 
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="content">Content</FieldLabel>
                  <Textarea 
                    id="content" 
                    placeholder="Full post content" 
                    rows={6} 
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </Field>

                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="featured" className="mb-0">Featured Post</FieldLabel>
                    <Switch 
                      id="featured" 
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                    />
                  </div>
                </Field>
              </FieldGroup>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreatePost} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Post
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
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
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-muted">
                          {post.image_url ? (
                            <Image
                              src={post.image_url}
                              alt={post.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="min-w-[200px]">
                          <p className="font-medium line-clamp-1">{post.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1 md:hidden">
                            {categoryLabels[post.category]}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{categoryLabels[post.category]}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(post.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {post.featured ? (
                          <Badge className="gap-1">
                            <Star className="h-3 w-3" />
                            Featured
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Published</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" aria-label="View post">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" aria-label="Edit post">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" className="text-destructive" aria-label="Delete post" onClick={() => handleDeletePost(post.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!isLoading && filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
