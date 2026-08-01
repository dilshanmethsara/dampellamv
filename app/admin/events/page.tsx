"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Edit, Trash2, Sparkles, Calendar, Clock, MapPin, Eye, Loader2 } from "lucide-react"
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

export default function AdminEventsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dbEvents, setDbEvents] = useState<any[]>([])

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    image_url: "",
    description: "",
    is_highlighted: false
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    setIsLoading(true)
    try {
      const eventsRef = collection(db, 'events')
      const q = query(eventsRef, orderBy('date', 'desc'))
      const querySnapshot = await getDocs(q)
      
      const now = new Date()
      const data = querySnapshot.docs.map(doc => {
        const eventData = doc.data()
        return { 
          id: doc.id, 
          ...eventData,
          is_past: new Date(eventData.date) < now
        }
      })
      
      setDbEvents(data)
    } catch (error: any) {
      toast.error("Failed to fetch events: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateEvent() {
    if (!formData.title || !formData.date) {
      toast.error("Please fill in more required fields (Title and Date)")
      return
    }

    setIsSubmitting(true)
    try {
      const eventsRef = collection(db, 'events')
      await addDoc(eventsRef, {
        ...formData
      })
      
      toast.success("Event created successfully!")
      setIsCreateDialogOpen(false)
      setFormData({
        title: "",
        date: "",
        time: "",
        location: "",
        image_url: "",
        description: "",
        is_highlighted: false
      })
      fetchEvents()
    } catch (error: any) {
      toast.error("Failed to create event: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteEvent(id: string) {
    if (!confirm("Are you sure you want to delete this event?")) return
    try {
      await deleteDoc(doc(db, 'events', id))
      toast.success("Event deleted successfully!")
      fetchEvents()
    } catch (error: any) {
      toast.error("Failed to delete event: " + error.message)
    }
  }

  const upcomingEvents = dbEvents.filter(e => !e.is_past)
  const pastEvents = dbEvents.filter(e => e.is_past)

  const filterEvents = (eventList: any[]) => {
    return eventList.filter((event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const EventTable = ({ eventList, onDelete }: { eventList: any[]; onDelete: (id: string) => void }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Event</TableHead>
            <TableHead className="hidden md:table-cell">Date & Time</TableHead>
            <TableHead className="hidden lg:table-cell">Location</TableHead>
            <TableHead className="hidden sm:table-cell">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filterEvents(eventList).map((event) => (
            <TableRow key={event.id}>
              <TableCell>
                <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-muted">
                  {event.image_url ? (
                    <Image
                      src={event.image_url}
                      alt={event.title}
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
                  <p className="font-medium line-clamp-1">{event.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1 md:hidden">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(event.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {event.time}
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="flex flex-col gap-1">
                  {event.is_highlighted && (
                    <Badge className="gap-1 w-fit">
                      <Sparkles className="h-3 w-3" />
                      Featured
                    </Badge>
                  )}
                  <Badge variant={event.is_past ? "outline" : "secondary"} className="w-fit">
                    {event.is_past ? "Past" : "Upcoming"}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon-sm" aria-label="View event">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label="Edit event">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" className="text-destructive" aria-label="Delete event" onClick={() => onDelete(event.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filterEvents(eventList).length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No events found.</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Events</h1>
          <p className="text-muted-foreground">
            Manage school events and activities
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="title">Event Title</FieldLabel>
                  <Input 
                    id="title" 
                    placeholder="Enter event title" 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="date">Date</FieldLabel>
                    <Input 
                      id="date" 
                      type="date" 
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="time">Time</FieldLabel>
                    <Input 
                      id="time" 
                      placeholder="e.g., 9:00 AM - 3:00 PM" 
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="location">Location</FieldLabel>
                  <Input 
                    id="location" 
                    placeholder="e.g., School Auditorium" 
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
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
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea 
                    id="description" 
                    placeholder="Event description" 
                    rows={4} 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Field>

                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="highlighted" className="mb-0">Featured Event</FieldLabel>
                    <Switch 
                      id="highlighted" 
                      checked={formData.is_highlighted}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_highlighted: checked })}
                    />
                  </div>
                </Field>
              </FieldGroup>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreateEvent} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Events Tabs */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="upcoming">
              <div className="border-b px-4 pt-4">
                <TabsList>
                  <TabsTrigger value="upcoming">
                    Upcoming ({upcomingEvents.length})
                  </TabsTrigger>
                  <TabsTrigger value="past">
                    Past ({pastEvents.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="upcoming" className="m-0">
                <EventTable eventList={upcomingEvents} onDelete={handleDeleteEvent} />
              </TabsContent>

              <TabsContent value="past" className="m-0">
                <EventTable eventList={pastEvents} onDelete={handleDeleteEvent} />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
