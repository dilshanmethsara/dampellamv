import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

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
  if (idx === -1) return current
  if (idx === GRADE_ORDER.length - 1) return "Graduated"
  return GRADE_ORDER[idx + 1]
}

// GET /api/admin/promote-grades
// Protected by a secret header. Call this with:
//   Authorization: Bearer <CRON_SECRET from .env.local>
// Schedule with Vercel Cron: "0 0 1 1 *" (Jan 1st, midnight)
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  // Only enforce secret if it's set (optional for local dev)
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createClient()
  const results = { profiles: 0, validStudents: 0, graduated: 0, errors: [] as string[] }

  try {
    // --- 1. Promote profiles ---
    const { data: students, error: fetchErr } = await supabase
      .from("profiles")
      .select("id, grade_class")
      .eq("role", "student")
      .not("grade_class", "is", null)
      .neq("grade_class", "Graduated")

    if (fetchErr) throw fetchErr

    for (const s of students ?? []) {
      const ng = nextGrade(s.grade_class)
      if (!ng || ng === s.grade_class) continue
      const { error } = await supabase
        .from("profiles")
        .update({ grade_class: ng })
        .eq("id", s.id)

      if (error) {
        results.errors.push(`Profile ${s.id}: ${error.message}`)
      } else {
        results.profiles++
        if (ng === "Graduated") results.graduated++
      }
    }

    // --- 2. Promote valid_students ---
    const { data: validStudents, error: vsErr } = await supabase
      .from("valid_students")
      .select("student_id, grade")
      .not("grade", "is", null)

    if (vsErr) throw vsErr

    for (const vs of validStudents ?? []) {
      const ng = nextGrade(vs.grade)
      if (!ng || ng === vs.grade) continue
      const { error } = await supabase
        .from("valid_students")
        .update({ grade: ng === "Graduated" ? null : ng })
        .eq("student_id", vs.student_id)

      if (error) {
        results.errors.push(`ValidStudent ${vs.student_id}: ${error.message}`)
      } else {
        results.validStudents++
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      promoted: { profiles: results.profiles, validStudents: results.validStudents },
      graduated: results.graduated,
      errors: results.errors,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
