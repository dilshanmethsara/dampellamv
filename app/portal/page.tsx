"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { EmailVerificationScreen } from "@/components/portal/email-verification-screen"

function PortalApp() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isUpdatingProfile = searchParams.get('update') === 'profile'
  const [view, setView] = useState<"role-select" | "auth" | "dashboard">("role-select")
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [hasIgnoredVerification, setHasIgnoredVerification] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  // Load state from sessionStorage
  useEffect(() => {
    const savedView = sessionStorage.getItem("portal_view")
    const savedRole = sessionStorage.getItem("portal_role")
    
    if (savedView) setView(savedView as any)
    if (savedRole) setSelectedRole(savedRole as any)
    setHasLoaded(true)
  }, [])

  // Save state to sessionStorage
  useEffect(() => {
    if (!hasLoaded) return
    sessionStorage.setItem("portal_view", view)
    if (selectedRole) {
      sessionStorage.setItem("portal_role", selectedRole)
    } else {
      sessionStorage.removeItem("portal_role")
    }
  }, [view, selectedRole, hasLoaded])

  if (isLoading || !hasLoaded) {
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
    // Stage 1: Email Verification Prompt (Non-blocking)
    if (!user.emailVerified && !hasIgnoredVerification && user.role !== 'admin') {
      return (
        <EmailVerificationScreen 
          user={user} 
          onLogout={handleLogout} 
          onContinue={() => setHasIgnoredVerification(true)} 
        />
      )
    }

    // NEW: Check if teacher needs to complete profile (for old users) or explicit update
    const hasSubjects = user.subjectsTaught && Array.isArray(user.subjectsTaught) && user.subjectsTaught.length > 0;
    if (user.role === "teacher" && (isUpdatingProfile || !hasSubjects)) {
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

  // If we are waiting for user profile after login
  if (view === "dashboard" || isLoading) {
    return <LoadingScreen />
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
    <div className="min-h-screen portal-theme font-sans relative overflow-hidden bg-background">
      <RoleSelector onSelectRole={handleSelectRole} />
    </div>
  )
}

export default function PortalPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <PortalApp />
    </Suspense>
  )
}
