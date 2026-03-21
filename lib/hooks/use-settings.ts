import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { schoolInfo } from "@/lib/data"

export function useSettings() {
  const [settings, setSettings] = useState<any>(schoolInfo)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('school_settings')
          .select('*')
          .eq('id', 1)
          .single()
        
        if (error) throw error
        if (data) {
          // Map database fields to the structure expected by components if necessary
          // or just provide the data as is. 
          // For now, we'll merge with static schoolInfo as a fallback.
          setSettings({
            ...schoolInfo,
            ...data,
            // Handle naming differences if any
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
