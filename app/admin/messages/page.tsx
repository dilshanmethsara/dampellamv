"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Mail, 
  MailOpen, 
  Trash2, 
  Clock, 
  User, 
  Phone, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  CheckCircle,
  Archive,
  ArrowLeft
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"
import { format } from "date-fns"

interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: 'unread' | 'read' | 'replied' | 'archived'
  created_at: string
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const supabase = createClient()

  const fetchMessages = async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast.error("Failed to load messages")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [statusFilter])

  const handleUpdateStatus = async (id: string, newStatus: ContactMessage['status']) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
      
      setMessages(messages.map(m => m.id === id ? { ...m, status: newStatus } : m))
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, status: newStatus })
      }
      toast.success(`Message marked as ${newStatus}`)
    } catch (error) {
      console.error("Error updating message status:", error)
      toast.error("Failed to update status")
    }
  }

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return
    
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setMessages(messages.filter(m => m.id !== id))
      setIsViewOpen(false)
      toast.success("Message deleted")
    } catch (error) {
      console.error("Error deleting message:", error)
      toast.error("Failed to delete message")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message)
    setIsViewOpen(true)
    if (message.status === 'unread') {
      handleUpdateStatus(message.id, 'read')
    }
  }

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: ContactMessage['status']) => {
    switch (status) {
      case 'unread': return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Unread</Badge>
      case 'read': return <Badge variant="secondary">Read</Badge>
      case 'replied': return <Badge variant="outline" className="text-emerald-600 border-emerald-600">Replied</Badge>
      case 'archived': return <Badge variant="outline">Archived</Badge>
      default: return null
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Messages</h1>
          <p className="text-muted-foreground">
            Manage contact form submissions
          </p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search messages..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Messages</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("unread")}>Unread</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("read")}>Read</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("replied")}>Replied</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("archived")}>Archived</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No messages found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Sender</th>
                    <th className="text-left py-3 px-4 font-medium">Subject</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredMessages.map((message) => (
                    <tr 
                      key={message.id} 
                      className={cn(
                        "hover:bg-muted/30 transition-colors cursor-pointer",
                        message.status === 'unread' && "bg-blue-50/30"
                      )}
                      onClick={() => handleViewMessage(message)}
                    >
                      <td className="py-3 px-4">
                        {getStatusBadge(message.status)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{message.name}</div>
                        <div className="text-xs text-muted-foreground">{message.email}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate">
                        {message.subject}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {format(new Date(message.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewMessage(message)}>
                              <MailOpen className="h-4 w-4 mr-2" /> View Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleUpdateStatus(message.id, 'replied')}>
                              <CheckCircle className="h-4 w-4 mr-2" /> Mark as Replied
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(message.id, 'archived')}>
                              <Archive className="h-4 w-4 mr-2" /> Archive
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:bg-destructive/10"
                              onClick={() => handleDeleteMessage(message.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Message Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between mb-2">
              {selectedMessage && getStatusBadge(selectedMessage.status)}
              <span className="text-xs text-muted-foreground">
                {selectedMessage && format(new Date(selectedMessage.created_at), 'MMMM dd, yyyy @ h:mm a')}
              </span>
            </div>
            <DialogTitle className="text-xl">{selectedMessage?.subject}</DialogTitle>
            <DialogDescription asChild>
              <div className="flex flex-col gap-1 pt-2">
                <div className="flex items-center gap-2 text-foreground">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedMessage?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedMessage?.email}</span>
                </div>
                {selectedMessage?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedMessage.phone}</span>
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6 p-6 bg-muted/50 rounded-xl whitespace-pre-wrap leading-relaxed">
            {selectedMessage?.message}
          </div>

          <DialogFooter className="mt-8 flex sm:justify-between items-center gap-4">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleUpdateStatus(selectedMessage!.id, 'replied')}
                disabled={selectedMessage?.status === 'replied'}
              >
                Mark as Replied
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleUpdateStatus(selectedMessage!.id, 'archived')}
                disabled={selectedMessage?.status === 'archived'}
              >
                Archive
              </Button>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => handleDeleteMessage(selectedMessage!.id)}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              <span className="ml-2">Delete</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
