"use client"

import { useState } from "react"
import { useAuth, type UserRole } from "@/lib/portal/auth-context"
import { RoleSelector } from "@/components/portal/role-selector"
import { AuthForms } from "@/components/portal/auth-forms"
import {
  StudentDashboard,
  TeacherDashboard,
  PendingApprovalScreen,
} from "@/components/portal/dashboards"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

function PortalApp() {
  const { user, logout } = useAuth()
  const [view, setView] = useState<"role-select" | "auth" | "dashboard">("role-select")
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role)
    setView("auth")
  }

  const handleBack = () => {
    setSelectedRole(null)
    setView("role-select")
  }

  const handleAuthSuccess = () => {
    setView("dashboard")
  }

  const handleLogout = () => {
    logout()
    setSelectedRole(null)
    setView("role-select")
  }

  // If user is logged in, show appropriate dashboard
  if (user && (view === "dashboard" || view === "auth")) {
    // Check if teacher is pending approval
    if (user.role === "teacher" && user.approvalStatus === "pending") {
      return <PendingApprovalScreen user={user} onLogout={handleLogout} />
    }

    // Show role-specific dashboard
    if (user.role === "student") {
      return <StudentDashboard user={user} onLogout={handleLogout} />
    }

    return <TeacherDashboard user={user} onLogout={handleLogout} />
  }

  // Show auth forms
  if (view === "auth" && selectedRole) {
    return (
      <AuthForms
        role={selectedRole}
        onBack={handleBack}
        onSuccess={handleAuthSuccess}
      />
    )
  }

  // Show role selection
  return <RoleSelector onSelectRole={handleSelectRole} />
}

export default function PortalPage() {
  return <PortalApp />
}
