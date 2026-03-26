"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  ArrowRight,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Users,
  RefreshCw,
  CalendarClock,
  Trophy,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface StudentProfile {
  id: string
  full_name: string
  email: string
  grade_class: string | null
  student_id: string | null
}

interface ValidStudent {
  student_id: string
  full_name: string
  grade: string | null
}

const GRADE_ORDER = [
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
]

function nextGrade(current: string | null): string | null {
  if (!current) return null
  const idx = GRADE_ORDER.indexOf(current)
  if (idx === -1) return current // unknown grade, leave as-is
  if (idx === GRADE_ORDER.length - 1) return "Graduated" // Grade 11 → graduated
  return GRADE_ORDER[idx + 1]
}

function gradeColor(grade: string | null) {
  switch (grade) {
    case "Grade 6": return "bg-violet-500/10 text-violet-600 border-violet-500/20"
    case "Grade 7": return "bg-blue-500/10 text-blue-600 border-blue-500/20"
    case "Grade 8": return "bg-cyan-500/10 text-cyan-600 border-cyan-500/20"
    case "Grade 9": return "bg-teal-500/10 text-teal-600 border-teal-500/20"
    case "Grade 10": return "bg-amber-500/10 text-amber-600 border-amber-500/20"
    case "Grade 11": return "bg-orange-500/10 text-orange-600 border-orange-500/20"
    case "Graduated": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    default: return "bg-muted text-muted-foreground border-muted"
  }
}

export default function GradePromotionPage() {
  const [profiles, setProfiles] = useState<StudentProfile[]>([])
  const [validStudents, setValidStudents] = useState<ValidStudent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPromoting, setIsPromoting] = useState(false)
  const [lastPromotedAt, setLastPromotedAt] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const supabase = createClient()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [profilesRes, validRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, grade_class, student_id").eq("role", "student").order("grade_class"),
        supabase.from("valid_students").select("student_id, full_name, grade").order("grade"),
      ])
      setProfiles(profilesRes.data ?? [])
      setValidStudents(validRes.data ?? [])

      // Load last promotion timestamp from localStorage
      const saved = localStorage.getItem("last_grade_promotion")
      if (saved) setLastPromotedAt(saved)
    } catch {
      toast.error("Failed to load student data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // Preview: what each student will become
  const promotionPreview = profiles
    .filter(p => p.grade_class && p.grade_class !== "Graduated")
    .map(p => ({
      ...p,
      newGrade: nextGrade(p.grade_class),
    }))

  const gradeStats = GRADE_ORDER.reduce<Record<string, number>>((acc, g) => {
    acc[g] = profiles.filter(p => p.grade_class === g).length
    return acc
  }, {})

  const handlePromote = async () => {
    setIsPromoting(true)
    setConfirmOpen(false)
    try {
      let promotedCount = 0
      let graduatedCount = 0
      const errors: string[] = []

      // --- 1. Update profiles table ---
      for (const p of promotionPreview) {
        const { error } = await supabase
          .from("profiles")
          .update({ grade_class: p.newGrade })
          .eq("id", p.id)

        if (error) {
          errors.push(`Profile ${p.full_name}: ${error.message}`)
        } else {
          promotedCount++
          if (p.newGrade === "Graduated") graduatedCount++
        }
      }

      // --- 2. Update valid_students table ---
      for (const vs of validStudents) {
        const ng = nextGrade(vs.grade)
        if (!ng || ng === vs.grade) continue
        const { error } = await supabase
          .from("valid_students")
          .update({ grade: ng === "Graduated" ? null : ng })
          .eq("student_id", vs.student_id)

        if (error) errors.push(`Valid student ${vs.student_id}: ${error.message}`)
      }

      if (errors.length > 0) {
        toast.warning(`Promotion completed with ${errors.length} error(s). Check console.`)
        console.error("Promotion errors:", errors)
      } else {
        const now = new Date().toLocaleString()
        localStorage.setItem("last_grade_promotion", now)
        setLastPromotedAt(now)
        toast.success(
          `✓ ${promotedCount} students promoted! ${graduatedCount > 0 ? `${graduatedCount} graduated.` : ""}`
        )
      }

      await fetchData()
    } catch (err) {
      console.error(err)
      toast.error("Grade promotion failed. Please try again.")
    } finally {
      setIsPromoting(false)
    }
  }

  const graduatedCount = profiles.filter(p => p.grade_class === "Graduated").length
  const eligibleCount = promotionPreview.length

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Grade Promotion</h1>
          <p className="text-muted-foreground text-sm">
            Promote all students to the next grade at the start of a new academic year.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchData} disabled={isLoading} className="gap-2 h-10 rounded-xl">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 h-10 rounded-xl" disabled={isLoading || isPromoting || eligibleCount === 0}>
                {isPromoting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Promoting...</>
                ) : (
                  <><GraduationCap className="h-4 w-4" /> Promote All Grades</>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Confirm Grade Promotion
                </DialogTitle>
                <DialogDescription className="pt-2">
                  This will promote <strong>{eligibleCount} students</strong> to the next grade.
                  Students in Grade 11 will be marked as <strong>Graduated</strong>.
                  <br /><br />
                  This affects both the <strong>portal profiles</strong> and the <strong>valid students list</strong>.
                  This action cannot be automatically undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                <Button onClick={handlePromote} className="gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Yes, Promote All
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Info Bar */}
      {lastPromotedAt && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl px-4 py-2.5 mb-6 border border-muted">
          <CalendarClock className="h-4 w-4 shrink-0" />
          Last promotion ran: <strong>{lastPromotedAt}</strong>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card className="rounded-2xl border-muted/50">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardDescription className="text-xs">Total Students</CardDescription>
            <CardTitle className="text-3xl flex items-center justify-between">
              {profiles.length}
              <Users className="h-5 w-5 text-muted-foreground/30" />
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl border-muted/50">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardDescription className="text-xs">Will Be Promoted</CardDescription>
            <CardTitle className="text-3xl text-primary">
              {eligibleCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl border-muted/50">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardDescription className="text-xs">Will Graduate</CardDescription>
            <CardTitle className="text-3xl text-amber-500">
              {promotionPreview.filter(p => p.newGrade === "Graduated").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl border-muted/50">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardDescription className="text-xs">Already Graduated</CardDescription>
            <CardTitle className="text-3xl text-emerald-500">
              {graduatedCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Grade Distribution */}
      <Card className="rounded-2xl border-muted/50 mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Current Grade Distribution</CardTitle>
          <CardDescription className="text-xs">After promotion, each row shifts one grade up.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {GRADE_ORDER.map(grade => (
              <div key={grade} className={`rounded-xl border p-3 text-center ${gradeColor(grade)}`}>
                <p className="text-xs font-medium mb-1">{grade}</p>
                <p className="text-2xl font-bold">{gradeStats[grade] ?? 0}</p>
                <div className="flex items-center justify-center gap-1 mt-1 text-[10px] opacity-70">
                  <ArrowRight className="h-3 w-3" />
                  <span>{nextGrade(grade)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Student Preview Table */}
      <Card className="rounded-2xl overflow-hidden border-muted/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Promotion Preview</CardTitle>
          <CardDescription className="text-xs">All {eligibleCount} students eligible for promotion this cycle.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Loading students...</p>
            </div>
          ) : promotionPreview.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-emerald-400" />
              <p className="font-medium">All students have already been promoted!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-left py-3 px-5 font-semibold">Student</th>
                    <th className="text-left py-3 px-5 font-semibold">Student ID</th>
                    <th className="text-left py-3 px-5 font-semibold">Current Grade</th>
                    <th className="text-center py-3 px-5 font-semibold">→</th>
                    <th className="text-left py-3 px-5 font-semibold">New Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {promotionPreview.map(s => (
                    <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-5">
                        <p className="font-medium text-foreground">{s.full_name}</p>
                        <p className="text-xs text-muted-foreground">{s.email}</p>
                      </td>
                      <td className="py-3 px-5">
                        <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono">
                          {s.student_id ?? "—"}
                        </code>
                      </td>
                      <td className="py-3 px-5">
                        <Badge variant="outline" className={gradeColor(s.grade_class)}>
                          {s.grade_class ?? "—"}
                        </Badge>
                      </td>
                      <td className="py-3 px-5 text-center text-muted-foreground">
                        <ArrowRight className="h-4 w-4 mx-auto" />
                      </td>
                      <td className="py-3 px-5">
                        <Badge
                          variant="outline"
                          className={s.newGrade === "Graduated"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1"
                            : gradeColor(s.newGrade)
                          }
                        >
                          {s.newGrade === "Graduated" && <Trophy className="h-3 w-3" />}
                          {s.newGrade}
                        </Badge>
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
