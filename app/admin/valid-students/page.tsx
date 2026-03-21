"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Search, 
  Trash2,
  Plus,
  GraduationCap,
  Loader2,
  MoreHorizontal,
  Filter
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"
import { format } from "date-fns"

interface ValidStudent {
  student_id: string
  full_name: string
  grade: string | null
  created_at: string
}

const GRADES = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"]

export default function AdminValidStudentsPage() {
  const [students, setStudents] = useState<ValidStudent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [gradeFilter, setGradeFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [newId, setNewId] = useState("")
  const [newName, setNewName] = useState("")
  const [newGrade, setNewGrade] = useState("")

  const supabase = createClient()

  const fetchStudents = async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('valid_students')
        .select('*')
        .order('created_at', { ascending: false })

      if (gradeFilter !== "all") {
        query = query.eq('grade', gradeFilter)
      }

      const { data, error } = await query
      if (error) throw error
      setStudents(data || [])
    } catch (error) {
      console.error("Error fetching valid students:", error)
      toast.error("Failed to load students")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [gradeFilter])

  const handleAddStudent = async () => {
    if (!newId.trim() || !newName.trim()) {
      toast.error("Student ID and Full Name are required")
      return
    }
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('valid_students')
        .insert({
          student_id: newId.trim().toUpperCase(),
          full_name: newName.trim(),
          grade: newGrade || null
        })

      if (error) {
        if (error.code === '23505') {
          toast.error("A student with this ID already exists")
        } else {
          throw error
        }
        return
      }

      toast.success("Student added successfully")
      setNewId("")
      setNewName("")
      setNewGrade("")
      setIsDialogOpen(false)
      fetchStudents()
    } catch (error) {
      console.error("Error adding student:", error)
      toast.error("Failed to add student")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (studentId: string) => {
    if (!confirm(`Remove "${studentId}" from the valid students list? This student will no longer be able to sign up.`)) return

    try {
      const { error } = await supabase
        .from('valid_students')
        .delete()
        .eq('student_id', studentId)

      if (error) throw error

      setStudents(students.filter(s => s.student_id !== studentId))
      toast.success("Student removed from whitelist")
    } catch (error) {
      console.error("Error deleting student:", error)
      toast.error("Failed to remove student")
    }
  }

  const filteredStudents = students.filter(s =>
    s.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Valid Students</h1>
          <p className="text-muted-foreground">
            Manage the whitelist of authorized Student IDs for portal registration
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 h-11 rounded-xl">
              <Plus className="h-4 w-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>Add Valid Student</DialogTitle>
              <DialogDescription>
                Add a student ID to allow that student to register in the portal.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="student-id">Student ID *</Label>
                <Input
                  id="student-id"
                  placeholder="e.g. STU-2024-001"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  className="h-11 rounded-xl"
                />
                <p className="text-xs text-muted-foreground">This is the ID the student will enter when signing up.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-name">Full Name *</Label>
                <Input
                  id="student-name"
                  placeholder="e.g. Jane Doe"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-grade">Grade</Label>
                <Select value={newGrade} onValueChange={setNewGrade}>
                  <SelectTrigger id="student-grade" className="h-11 rounded-xl">
                    <SelectValue placeholder="Select grade..." />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map(g => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddStudent} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Add Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID or name..."
            className="pl-9 h-11 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 h-11 rounded-xl shrink-0">
              <Filter className="h-4 w-4" />
              Grade: {gradeFilter === "all" ? "All" : gradeFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setGradeFilter("all")}>All Grades</DropdownMenuItem>
            {GRADES.map(g => (
              <DropdownMenuItem key={g} onClick={() => setGradeFilter(g)}>{g}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card className="rounded-2xl border-muted/50">
          <CardHeader className="pb-2">
            <CardDescription>Total Valid IDs</CardDescription>
            <CardTitle className="text-3xl flex items-center justify-between">
              {students.length}
              <GraduationCap className="h-6 w-6 text-primary opacity-20" />
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl border-muted/50">
          <CardHeader className="pb-2">
            <CardDescription>Showing</CardDescription>
            <CardTitle className="text-3xl">
              {filteredStudents.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Table */}
      <Card className="rounded-2xl overflow-hidden border-muted/50 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium">No valid students found</p>
              <p className="text-sm mt-1">Add student IDs to allow portal registration</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold">Student ID</th>
                    <th className="text-left py-4 px-6 font-semibold">Full Name</th>
                    <th className="text-left py-4 px-6 font-semibold">Grade</th>
                    <th className="text-left py-4 px-6 font-semibold">Added</th>
                    <th className="text-right py-4 px-6 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStudents.map((student) => (
                    <tr key={student.student_id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-6">
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono font-bold">{student.student_id}</code>
                      </td>
                      <td className="py-4 px-6 font-medium">{student.full_name}</td>
                      <td className="py-4 px-6">
                        {student.grade ? (
                          <Badge variant="secondary">{student.grade}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">
                        {format(new Date(student.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDelete(student.student_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
