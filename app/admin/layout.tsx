"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  GraduationCap, 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Image, 
  Settings,
  Mail,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Users,
  ClipboardList,
  BookOpen,
  Loader2,
  TrendingUp
} from "lucide-react"

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/gallery", label: "Gallery", icon: Image },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/valid-students", label: "Valid Students", icon: ClipboardList },
  { href: "/admin/grade-promotion", label: "Grade Promotion", icon: TrendingUp },
  { href: "/admin/past-papers", label: "Past Papers", icon: BookOpen },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  // Auth guard — skip for login page itself
  useEffect(() => {
    if (pathname === "/admin/login") {
      setIsAuthed(true)
      return
    }
    const auth = sessionStorage.getItem("admin_auth")
    if (auth === "true") {
      setIsAuthed(true)
    } else {
      router.replace("/admin/login")
    }
  }, [pathname])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth")
    router.replace("/admin/login")
  }

  // Show loader while checking auth
  if (isAuthed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Login page renders without layout chrome
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b z-50 flex items-center justify-between px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold">Admin Panel</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-background border-r z-40 transition-transform duration-300 lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 border-b flex items-center px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-semibold text-sm">Admin Panel</span>
              <p className="text-xs text-muted-foreground">MR/ Dampella M.V</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
                {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t space-y-2">
          <Button
            variant="destructive"
            className="w-full gap-2 justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
          <Link href="/">
            <Button variant="outline" className="w-full gap-2 justify-start">
              Back to Website
            </Button>
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  )
}
