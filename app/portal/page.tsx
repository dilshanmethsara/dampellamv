"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth, type UserRole } from "@/lib/portal/auth-context"
import { RoleSelector } from "@/components/portal/role-selector"
import { AuthForms } from "@/components/portal/auth-forms"
import {
  StudentDashboard,
  TeacherDashboard,
  PendingApprovalScreen,
  ProfileCompletionScreen,
} from "@/components/portal/dashboards"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { LoadingScreen, ClosingScreen, SignOutScreen } from "@/components/portal/loading-screen"

function PortalApp() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [view, setView] = useState<"role-select" | "auth" | "dashboard">("role-select")
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  if (isLoading) {
    return <LoadingScreen />
  }

  if (isClosing) {
    return <ClosingScreen />
  }

  if (isSigningOut) {
    return <SignOutScreen />
  }

  const handleBackToWebsite = () => {
    setIsClosing(true)
    setTimeout(() => {
      router.push('/')
    }, 2000)
  }

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
    setIsSigningOut(true)
    setTimeout(() => {
      logout()
      setSelectedRole(null)
      setView("role-select")
      setIsSigningOut(false)
    }, 2000)
  }

  // If user is logged in, show appropriate dashboard
  if (user) {
    // NEW: Check if teacher needs to complete profile (for old users) - high priority
    const hasSubjects = user.subjectsTaught && Array.isArray(user.subjectsTaught) && user.subjectsTaught.length > 0;
    if (user.role === "teacher" && !hasSubjects) {
      return <ProfileCompletionScreen user={user} onLogout={handleLogout} />
    }

    // Check if teacher is pending approval
    if (user.role === "teacher" && (user.approvalStatus === "pending" || !user.approvalStatus)) {
      return <PendingApprovalScreen user={user} onLogout={handleLogout} onBackToWebsite={handleBackToWebsite} />
    }

    // Show role-specific dashboard
    if (user.role === "student") {
      return <StudentDashboard user={user} onLogout={handleLogout} onBackToWebsite={handleBackToWebsite} />
    }

    return <TeacherDashboard user={user} onLogout={handleLogout} onBackToWebsite={handleBackToWebsite} />
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
  return (
    <div className="min-h-screen bg-background portal-theme font-sans transition-colors duration-500 relative overflow-hidden">
      {/* Background Mesh Gradient */}
      {view === "dashboard" && (
        <div className="absolute inset-0 mesh-gradient opacity-[0.07] pointer-events-none -z-10 animate-pulse" />
      )}
      
      <div className="absolute top-6 left-6 z-10">
        <Button variant="outline" onClick={handleBackToWebsite} className="rounded-xl shadow-sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Website
        </Button>
      </div>
      <RoleSelector onSelectRole={handleSelectRole} />
    </div>
  )
}

export default function PortalPage() {
  return <PortalApp />
}
