import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Calendar, 
  Image, 
  Users, 
  TrendingUp, 
  Plus,
  Eye,
  Star
} from "lucide-react"
import { announcements, events, galleryImages, schoolInfo } from "@/lib/data"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "School website administration panel",
}

export default function AdminDashboardPage() {
  // Calculate stats
  const totalPosts = announcements.length
  const featuredPosts = announcements.filter(a => a.featured).length
  const upcomingEvents = events.filter(e => !e.isPast).length
  const totalImages = galleryImages.length

  const recentPosts = announcements.slice(0, 4)
  const upcomingEventsList = events.filter(e => !e.isPast).slice(0, 3)

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the admin panel. Manage your school website content here.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{totalPosts}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 text-amber-500" />
              <span className="text-muted-foreground">{featuredPosts} featured</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Events</p>
                <p className="text-2xl font-bold">{upcomingEvents}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <Calendar className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span>Active events</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gallery Images</p>
                <p className="text-2xl font-bold">{totalImages}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Image className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
              <Eye className="h-4 w-4 text-purple-500" />
              <span>Photos uploaded</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="text-2xl font-bold">{schoolInfo.students}+</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
              <span>{schoolInfo.teachers} teachers</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <Link href="/admin/posts">
          <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500 transition-colors">
                <Plus className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="font-semibold">Add New Post</h3>
                <p className="text-sm text-muted-foreground">Create announcement or news</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/events">
          <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500 transition-colors">
                <Plus className="h-6 w-6 text-emerald-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="font-semibold">Add New Event</h3>
                <p className="text-sm text-muted-foreground">Schedule a school event</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/gallery">
          <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10 group-hover:bg-purple-500 transition-colors">
                <Plus className="h-6 w-6 text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="font-semibold">Upload Images</h3>
                <p className="text-sm text-muted-foreground">Add photos to gallery</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Posts</CardTitle>
                <CardDescription>Latest announcements and news</CardDescription>
              </div>
              <Link href="/admin/posts">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{post.title}</h4>
                      {post.featured && (
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Scheduled school events</CardDescription>
              </div>
              <Link href="/admin/events">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEventsList.map((event) => (
                <div key={event.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="shrink-0 w-12 text-center p-2 bg-primary/10 rounded-lg">
                    <div className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                    <div className="font-bold text-primary">
                      {new Date(event.date).getDate()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{event.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">{event.location}</p>
                  </div>
                  {event.isHighlighted && (
                    <Badge className="shrink-0 text-xs">Featured</Badge>
                  )}
                </div>
              ))}
              {upcomingEventsList.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No upcoming events</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
