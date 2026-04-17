"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  FileText,
  Plus,
  Trash2,
  Search,
  Loader2,
  Upload,
  MoreHorizontal,
  ExternalLink,
  Filter,
  GraduationCap,
} from "lucide-react"
import { db, storage } from "@/lib/firebase"
import { 
  collection, 
  query as firestoreQuery, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  orderBy, 
  where,
  Timestamp 
} from "firebase/firestore"
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"

interface PastPaper {
  id: string
  title: string
  subject: string
  grade: string
  term: string | null
  year: number | null
  file_url: string
  file_name: string
  created_at: any
}

const GRADES = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"]
const SUBJECTS = ["Sinhala", "English", "Science", "Mathematics", "Geography", "ICT", "Agri", "Home Science", "History"]
const TERMS = ["Term 1", "Term 2", "Term 3"]
const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020]

export default function AdminPastPapersPage() {
  const [papers, setPapers] = useState<PastPaper[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [gradeFilter, setGradeFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  // Form state
  const [formTitle, setFormTitle] = useState("")
  const [formSubject, setFormSubject] = useState("")
  const [formGrade, setFormGrade] = useState("")
  const [formTerm, setFormTerm] = useState("")
  const [formYear, setFormYear] = useState("")
  const [formFile, setFormFile] = useState<File | null>(null)

  const fetchPapers = async () => {
    setIsLoading(true)
    try {
      const papersRef = collection(db, 'past_papers')
      let q
      if (gradeFilter !== "all") {
        q = firestoreQuery(papersRef, where('grade', '==', gradeFilter), orderBy('created_at', 'desc'))
      } else {
        q = firestoreQuery(papersRef, orderBy('created_at', 'desc'))
      }
      
      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        // We keep created_at as is, formatDate will handle it
      })) as PastPaper[]
      
      setPapers(data)
    } catch (err) {
      console.error("Error fetching papers:", err)
      toast.error("Failed to load past papers. Make sure you have created the required composite index in Firestore.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPapers()
  }, [gradeFilter])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed")
        e.target.value = ""
        return
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error("File size must be under 20MB")
        e.target.value = ""
        return
      }
      setFormFile(file)
    }
  }

  const handleUpload = async () => {
    if (!formTitle || !formSubject || !formGrade || !formFile) {
      toast.error("Title, subject, grade, and PDF file are required")
      return
    }

    setIsSubmitting(true)
    try {
      setUploadProgress("Uploading PDF...")
      const fileName = `${Date.now()}_${formFile.name.replace(/\s+/g, '_')}`
      const storagePath = `past-papers/${formGrade.replace(/\s+/g, '_')}/${fileName}`
      const fileRef = ref(storage, storagePath)

      // Upload to Firebase Storage
      await uploadBytes(fileRef, formFile)
      const downloadURL = await getDownloadURL(fileRef)

      setUploadProgress("Saving paper details...")

      // Save metadata to Firestore
      await addDoc(collection(db, 'past_papers'), {
        title: formTitle,
        subject: formSubject,
        grade: formGrade,
        term: formTerm || null,
        year: formYear ? parseInt(formYear) : null,
        file_url: downloadURL,
        file_name: formFile.name,
        storage_path: storagePath,
        created_at: Timestamp.now()
      })

      toast.success("Past paper uploaded successfully!")
      setIsDialogOpen(false)
      resetForm()
      fetchPapers()
    } catch (err) {
      console.error("Upload error:", err)
      toast.error("Failed to upload paper")
    } finally {
      setIsSubmitting(false)
      setUploadProgress("")
    }
  }

  const handleDelete = async (paper: any) => {
    if (!confirm(`Delete "${paper.title}"? This cannot be undone.`)) return
    try {
      // Delete from Firebase Storage
      if (paper.storage_path) {
        const fileRef = ref(storage, paper.storage_path)
        await deleteObject(fileRef)
      } else if (paper.file_url) {
        // Fallback: try to extract from URL if storage_path is missing
        try {
          const decodedUrl = decodeURIComponent(paper.file_url)
          const pathStart = decodedUrl.indexOf('/o/') + 3
          const pathEnd = decodedUrl.indexOf('?')
          const fullPath = decodedUrl.substring(pathStart, pathEnd)
          const fileRef = ref(storage, fullPath)
          await deleteObject(fileRef)
        } catch (e) {
          console.error("Could not delete file from storage:", e)
        }
      }

      await deleteDoc(doc(db, 'past_papers', paper.id))
      setPapers(papers.filter(p => p.id !== paper.id))
      toast.success("Paper deleted")
    } catch (err) {
      console.error("Delete error:", err)
      toast.error("Failed to delete paper")
    }
  }

  const resetForm = () => {
    setFormTitle("")
    setFormSubject("")
    setFormGrade("")
    setFormTerm("")
    setFormYear("")
    setFormFile(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  const filteredPapers = papers.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Past Papers</h1>
          <p className="text-muted-foreground">Upload PDF past papers for students by grade</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild>
            <Button className="gap-2 h-11 rounded-xl">
              <Plus className="h-4 w-4" />
              Upload Paper
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle>Upload Past Paper</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  placeholder="e.g. Mathematics Term 1 2025"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Select value={formSubject} onValueChange={setFormSubject}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Grade *</Label>
                  <Select value={formGrade} onValueChange={setFormGrade}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Term</Label>
                  <Select value={formTerm} onValueChange={setFormTerm}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      {TERMS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select value={formYear} onValueChange={setFormYear}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>PDF File *</Label>
                <div
                  className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  {formFile ? (
                    <div>
                      <p className="text-sm font-medium text-primary">{formFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(formFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-muted-foreground">Click to browse PDF file</p>
                      <p className="text-xs text-muted-foreground mt-1">Max 20MB</p>
                    </div>
                  )}
                  <Input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpload} disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {uploadProgress || "Uploading..."}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="rounded-2xl border-muted/50">
          <CardHeader className="pb-2"><CardDescription>Total Papers</CardDescription>
            <CardTitle className="text-3xl flex items-center justify-between">
              {papers.length}
              <FileText className="h-6 w-6 text-primary opacity-20" />
            </CardTitle>
          </CardHeader>
        </Card>
        {["Grade 10", "Grade 11", "Grade 9"].map(g => (
          <Card key={g} className="rounded-2xl border-muted/50">
            <CardHeader className="pb-2"><CardDescription>{g}</CardDescription>
              <CardTitle className="text-3xl flex items-center justify-between">
                {papers.filter(p => p.grade === g).length}
                <GraduationCap className="h-6 w-6 text-primary opacity-20" />
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or subject..."
            className="pl-9 h-11 rounded-xl"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
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

      {/* Table */}
      <Card className="rounded-2xl overflow-hidden border-muted/50 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading papers...</p>
            </div>
          ) : filteredPapers.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium">No past papers found</p>
              <p className="text-sm mt-1">Upload a PDF to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold">Paper</th>
                    <th className="text-left py-4 px-6 font-semibold">Grade</th>
                    <th className="text-left py-4 px-6 font-semibold">Subject</th>
                    <th className="text-left py-4 px-6 font-semibold">Term / Year</th>
                    <th className="text-left py-4 px-6 font-semibold">Uploaded</th>
                    <th className="text-right py-4 px-6 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPapers.map(paper => (
                    <tr key={paper.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5 text-red-500" />
                          </div>
                          <div>
                            <div className="font-semibold">{paper.title}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">{paper.file_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="secondary">{paper.grade}</Badge>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">{paper.subject}</td>
                      <td className="py-4 px-6 text-muted-foreground">
                        {paper.term && <span>{paper.term}</span>}
                        {paper.term && paper.year && <span> · </span>}
                        {paper.year && <span>{paper.year}</span>}
                        {!paper.term && !paper.year && <span>—</span>}
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">
                        {formatDate(paper.created_at)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 rounded-xl">
                            <DropdownMenuItem onClick={() => window.open(paper.file_url, '_blank')}>
                              <ExternalLink className="h-4 w-4 mr-2" /> View PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:bg-destructive/10"
                              onClick={() => handleDelete(paper)}
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
    </div>
  )
}
