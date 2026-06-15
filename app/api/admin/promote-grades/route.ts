import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { 
  collection, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  where 
} from "firebase/firestore"

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
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  // Only enforce secret if it's set
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const results = { profiles: 0, validStudents: 0, graduated: 0, errors: [] as string[] }

  try {
    // --- 1. Promote profiles ---
    const profilesRef = collection(db, "profiles")
    const pSnap = await getDocs(query(profilesRef, where("role", "==", "student")))

    for (const pDoc of pSnap.docs) {
      const data = pDoc.data()
      const gc = data.gradeClass || data.grade_class
      if (!gc || gc === "Graduated") continue
      
      const ng = nextGrade(gc)
      if (!ng || ng === gc) continue
      
      try {
        await updateDoc(doc(db, "profiles", pDoc.id), {
          gradeClass: ng,
          updatedAt: new Date().toISOString()
        })
        results.profiles++
        if (ng === "Graduated") results.graduated++
      } catch (error: any) {
        results.errors.push(`Profile ${pDoc.id}: ${error.message}`)
      }
    }

    // --- 2. Promote valid_students ---
    const validRef = collection(db, "valid_students")
    const vSnap = await getDocs(validRef)

    for (const vDoc of vSnap.docs) {
      const data = vDoc.data()
      const grade = data.grade
      if (!grade) continue
      
      const ng = nextGrade(grade)
      if (!ng || ng === grade) continue
      
      try {
        await updateDoc(doc(db, "valid_students", vDoc.id), {
          grade: ng === "Graduated" ? null : ng
        })
        results.validStudents++
      } catch (error: any) {
        results.errors.push(`ValidStudent ${vDoc.id}: ${error.message}`)
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
