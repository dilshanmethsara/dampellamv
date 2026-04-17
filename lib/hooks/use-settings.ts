import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { schoolInfo } from "@/lib/data"

export function useSettings() {
  const [settings, setSettings] = useState<any>(schoolInfo)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const docRef = doc(db, 'school_settings', '1')
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          const data = docSnap.data()
          if (data) {
            setSettings({
              ...schoolInfo,
              ...data,
              name: data.name,
              fullName: data.full_name,
              address: data.address,
              phone: data.phone,
              email: data.email,
              motto: data.motto,
              students: data.students,
              teachers: data.teachers,
              achievements: data.achievements,
              yearsOfExcellence: data.years_of_excellence,
              principalName: data.principal_name,
              principalMessage: data.principal_message,
              history: data.history,
              vision: data.vision,
              mission: data.mission,
              values: data.values || [],
            })
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return { settings, isLoading }
}
