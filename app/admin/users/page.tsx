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
import { cn, formatDate } from "@/lib/utils"
import { db } from "@/lib/firebase"
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore"
import { toast } from "sonner"

interface Profile {
  id: string
  email: string
  full_name: string
  role: 'student' | 'teacher'
  grade_class: string | null
  teacher_id: string | null
  student_id: string | null
  whatsapp_number: string | null
  approval_status: 'pending' | 'approved'
  created_at: any
}

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const fetchProfiles = async () => {
    setIsLoading(true)
    try {
      const profilesRef = collection(db, "profiles")
      let q = query(profilesRef)

      if (roleFilter !== "all" && statusFilter !== "all") {
        q = query(profilesRef, where("role", "==", roleFilter), where("approvalStatus", "==", statusFilter))
      } else if (roleFilter !== "all") {
        q = query(profilesRef, where("role", "==", roleFilter))
      } else if (statusFilter !== "all") {
        q = query(profilesRef, where("approvalStatus", "==", statusFilter))
      }

      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map(doc => {
        const d = doc.data()
        return {
          id: doc.id,
          email: d.email,
          full_name: d.fullName || d.full_name,
          role: (d.role || "student").toLowerCase().trim(),
          grade_class: d.gradeClass || d.grade_class,
          teacher_id: d.teacherId || d.teacher_id,
          student_id: d.studentId || d.student_id,
          whatsapp_number: d.whatsappNumber || d.whatsapp_number,
          approval_status: (d.approvalStatus || d.approval_status || 'pending').toLowerCase().trim(),
          created_at: d.createdAt || d.created_at
        } as Profile
      })

      // In-memory sorting since orderBy fails if some docs miss the field
      data.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        return dateB - dateA
      })

      setProfiles(data)
    } catch (error: any) {
      console.error("Error fetching profiles:", error)
      if (error.code === 'permission-denied') {
        toast.error("Access Denied: You are not an Admin in this database.")
      } else {
        toast.error(`Error: ${error.message || "Failed to load users."}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [roleFilter, statusFilter])

  const handleUpdateStatus = async (id: string, newStatus: Profile['approval_status']) => {
    try {
      const docRef = doc(db, "profiles", id)
      await updateDoc(docRef, { approvalStatus: newStatus })
      
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
      const docRef = doc(db, "profiles", id)
      await deleteDoc(docRef)
      
      setProfiles(profiles.filter(p => p.id !== id))
      toast.success("User deleted")
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Failed to delete user")
    }
  }

  const filteredProfiles = profiles.filter(p => 
    (p.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (p.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
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
                            {(profile.full_name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-foreground">{profile.full_name}</div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{profile.email}</span>
                              {profile.whatsapp_number && (
                                <a 
                                  href={`https://wa.me/${profile.whatsapp_number.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-0.5"
                                >
                                  <svg className="size-3 fill-current" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.877 1.215 3.076.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 0 0012.05 0C5.414 0 .018 5.393 0 12.03c0 2.122.541 4.19 1.57 6.014L0 24l6.135-1.61a11.786 0 005.91 1.586h.006c6.635 0 12.032-5.396 12.033-12.034a11.814 0 00-3.535-8.503" />
                                  </svg>
                                  WA
                                </a>
                              )}
                            </div>
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
                        {profile.created_at ? formatDate(profile.created_at) : 'Recently'}
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
