"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth, type UserRole } from "@/lib/portal/auth-context"
import { AuthForms } from "@/components/portal/auth-forms"
import { StudentDashboard } from "@/components/portal/dashboards/student"
import { TeacherDashboard } from "@/components/portal/dashboards/teacher"
import { AdminDashboard } from "@/components/portal/dashboards/admin"
import { 
  PendingApprovalScreen, 
  ProfileCompletionScreen 
} from "@/components/portal/dashboards/shared"
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
    return (
      <SignOutScreen 
        onReturnToLogin={() => {
          setSelectedRole(null)
          setView("role-select")
          setIsSigningOut(false)
        }}
        onViewSite={() => {
          router.push('/')
        }}
      />
    )
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
    logout()
    setIsSigningOut(true)
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

    if (user.role === "admin") {
      return <AdminDashboard user={user} onLogout={handleLogout} onBackToWebsite={handleBackToWebsite} />
    }

    return <TeacherDashboard user={user} onLogout={handleLogout} onBackToWebsite={handleBackToWebsite} />
  }

  // Show auth forms directly since unified design handles roles internally
  return (
    <div className="min-h-screen portal-theme font-sans relative overflow-hidden bg-background">
      <AuthForms onSuccess={handleAuthSuccess} />
    </div>
  )
}

export default function PortalPage() {
  return <PortalApp />
}
