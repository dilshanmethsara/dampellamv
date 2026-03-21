"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"

export type UserRole = "student" | "teacher" | "admin" | null

export interface User {
  email: string
  fullName: string
  role: string
  gradeClass?: string
  approvalStatus?: string
}

interface AuthContextType {
  role: UserRole
  setRole: (role: UserRole) => void
  user: User | null
  login: (email: string, pass: string, role: UserRole) => Promise<void>
  signup: (userData: any) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const login = async (email: string, pass: string, newRole: UserRole) => {
    setIsLoading(true)
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .single()

      if (error || !profile) {
        toast.error("No account found with this email address.")
        return
      }

      // Check password
      if (profile.password && profile.password !== pass) {
        toast.error("Incorrect password. Please try again.")
        return
      }

      setRole(profile.role as UserRole)
      setUser({
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role,
        gradeClass: profile.grade_class,   // ← grade loaded from DB
        approvalStatus: profile.approval_status
      })
      toast.success("Welcome back, " + profile.full_name.split(" ")[0] + "!")
    } catch (err) {
      console.error("Login error:", err)
      toast.error("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (userData: any): Promise<boolean> => {
    setIsLoading(true)
    try {
      // For students, validate their ID against the whitelist
      if (userData.role === 'student') {
        const { data: valid, error: validErr } = await supabase
          .from('valid_students')
          .select('student_id')
          .eq('student_id', userData.studentId?.trim().toUpperCase())
          .single()

        if (validErr || !valid) {
          toast.error("Invalid Student ID. Please check your ID and try again.")
          return false
        }
      }

      // Check if email already registered
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userData.email.trim().toLowerCase())
        .single()

      if (existing) {
        toast.error("An account with this email already exists. Please sign in.")
        return false
      }

      const { error } = await supabase
        .from('profiles')
        .insert({
          email: userData.email.trim().toLowerCase(),
          full_name: userData.fullName,
          role: userData.role,
          grade_class: userData.gradeClass,      // ← grade saved to DB
          teacher_id: userData.teacherId,
          student_id: userData.studentId?.trim().toUpperCase(),
          password: userData.password,            // ← password saved (plaintext for demo)
          approval_status: userData.role === 'teacher' ? 'pending' : 'approved'
        })

      if (error) throw error

      setRole(userData.role)
      setUser({
        email: userData.email.trim().toLowerCase(),
        fullName: userData.fullName,
        role: userData.role,
        gradeClass: userData.gradeClass,          // ← grade set in state immediately
        approvalStatus: userData.role === 'teacher' ? 'pending' : 'approved'
      })
      toast.success("Account created successfully!")
      return true
    } catch (err) {
      console.error("Signup error:", err)
      toast.error("Failed to create account")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setRole(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ role, setRole, user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
