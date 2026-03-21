"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Trash2, 
  User, 
  MoreHorizontal,
  Filter,
  Loader2,
  CheckCircle,
  XCircle,
  ShieldCheck,
  GraduationCap
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"
import { format } from "date-fns"

interface Profile {
  id: string
  email: string
  full_name: string
  role: 'student' | 'teacher'
  grade_class: string | null
  teacher_id: string | null
  student_id: string | null
  approval_status: 'pending' | 'approved'
  created_at: string
}

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const supabase = createClient()

  const fetchProfiles = async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (roleFilter !== "all") {
        query = query.eq('role', roleFilter)
      }
      if (statusFilter !== "all") {
        query = query.eq('approval_status', statusFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setProfiles(data || [])
    } catch (error) {
      console.error("Error fetching profiles:", error)
      toast.error("Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [roleFilter, statusFilter])

  const handleUpdateStatus = async (id: string, newStatus: Profile['approval_status']) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ approval_status: newStatus })
        .eq('id', id)

      if (error) throw error
      
      setProfiles(profiles.map(p => p.id === id ? { ...p, approval_status: newStatus } : p))
      toast.success(`User marked as ${newStatus}`)
    } catch (error) {
      console.error("Error updating user status:", error)
      toast.error("Failed to update status")
    }
  }

  const handleDeleteProfile = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setProfiles(profiles.filter(p => p.id !== id))
      toast.success("User deleted")
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Failed to delete user")
    }
  }

  const filteredProfiles = profiles.filter(p => 
    p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: Profile['approval_status']) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="text-amber-600 border-amber-600 bg-amber-50">Pending</Badge>
      case 'approved': return <Badge variant="outline" className="text-emerald-600 border-emerald-600 bg-emerald-50">Approved</Badge>
      default: return null
    }
  }

  const getRoleBadge = (role: Profile['role']) => {
    switch (role) {
      case 'student': return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">Student</Badge>
      case 'teacher': return <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100">Teacher</Badge>
      default: return null
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">User Management</h1>
          <p className="text-muted-foreground">
            Manage LMS users, students, and teacher approvals
          </p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search users by name or email..." 
            className="pl-9 h-11 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 h-11 rounded-xl">
                <Filter className="h-4 w-4" />
                Role: {roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setRoleFilter("all")}>All Roles</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter("student")}>Students</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter("teacher")}>Teachers</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 h-11 rounded-xl">
                <Filter className="h-4 w-4" />
                Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Statuses</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("approved")}>Approved</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Users List */}
      <Card className="rounded-2xl overflow-hidden border-muted/50 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Loading users...</p>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold">User</th>
                    <th className="text-left py-4 px-6 font-semibold">Role</th>
                    <th className="text-left py-4 px-6 font-semibold">Details</th>
                    <th className="text-left py-4 px-6 font-semibold">Status</th>
                    <th className="text-left py-4 px-6 font-semibold">Joined</th>
                    <th className="text-right py-4 px-6 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredProfiles.map((profile) => (
                    <tr 
                      key={profile.id} 
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {profile.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-foreground">{profile.full_name}</div>
                            <div className="text-xs text-muted-foreground">{profile.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {getRoleBadge(profile.role)}
                      </td>
                      <td className="py-4 px-6">
                        {profile.role === 'student' ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-foreground">{profile.grade_class}</span>
                            <span className="text-[10px] text-muted-foreground">{profile.student_id || 'No ID'}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-foreground">{profile.teacher_id || 'Faculty'}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(profile.approval_status)}
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">
                        {format(new Date(profile.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl">
                            {profile.role === 'teacher' && profile.approval_status === 'pending' && (
                              <DropdownMenuItem 
                                className="text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
                                onClick={() => handleUpdateStatus(profile.id, 'approved')}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" /> Approve Teacher
                              </DropdownMenuItem>
                            )}
                            {profile.role === 'teacher' && profile.approval_status === 'approved' && (
                              <DropdownMenuItem 
                                className="text-amber-600 focus:text-amber-700 focus:bg-amber-50"
                                onClick={() => handleUpdateStatus(profile.id, 'pending')}
                              >
                                <XCircle className="h-4 w-4 mr-2" /> Revoke Approval
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <ShieldCheck className="h-4 w-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:bg-destructive/10"
                              onClick={() => handleDeleteProfile(profile.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete User
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

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <Card className="rounded-2xl border-muted/50 shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription>Total Students</CardDescription>
            <CardTitle className="text-3xl flex items-center justify-between">
              {profiles.filter(p => p.role === 'student').length}
              <GraduationCap className="h-6 w-6 text-blue-500 opacity-20" />
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl border-muted/50 shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription>Total Teachers</CardDescription>
            <CardTitle className="text-3xl flex items-center justify-between">
              {profiles.filter(p => p.role === 'teacher').length}
              <ShieldCheck className="h-6 w-6 text-purple-500 opacity-20" />
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl border-muted/50 shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription>Pending Approvals</CardDescription>
            <CardTitle className="text-3xl flex items-center justify-between">
              {profiles.filter(p => p.approval_status === 'pending').length}
              <CheckCircle className="h-6 w-6 text-amber-500 opacity-20" />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
