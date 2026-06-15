"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Settings, 
  LogOut,
  Search,
  Menu,
  X,
  User as UserIcon,
  ChevronsLeft,
  Microscope
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/portal/theme-toggle"
import { LanguageToggle } from "@/components/portal/language-toggle"
import { NotificationBell } from "@/components/portal/notification-bell"
import { cn } from "@/lib/utils"
import { useAuth, type User } from "@/lib/portal/auth-context"
import { AlertCircle, RefreshCcw, Send, MailCheck } from "lucide-react"

interface SidebarLayoutProps {
  user: User
  onLogout: () => void
  activeTab?: string
  onTabChange?: (tabId: string) => void
  children: React.ReactNode
}

export function ProSidebarLayout({ user, onLogout, activeTab = "overview", onTabChange, children }: SidebarLayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = React.useState(true)
  const [isMobileOpen, setMobileOpen] = React.useState(false)

  const navItems = [
    { name: "Overview", icon: LayoutDashboard, id: "overview" },
    { name: "Content", icon: BookOpen, id: "courses" },
    { name: "Tasks", icon: FileText, id: "assignments" },
    { name: "Labs", icon: Microscope, id: "labs" },
    { name: "Messages", icon: MessageSquare, id: "messages" },
  ]

  const handleTabClick = (id: string) => {
    if (onTabChange) onTabChange(id)
    setMobileOpen(false)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-900 border-r border-border">
      <div className="flex items-center h-16 px-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-foreground text-background flex items-center justify-center shadow-sm">
            <GraduationCap className="size-4" />
          </div>
          {isSidebarOpen && <span className="font-black text-foreground tracking-tight">Pro-Portal</span>}
        </div>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            onClick={() => handleTabClick(item.id)}
            className={cn(
              "w-full justify-start rounded-xl h-12 mb-1",
              activeTab === item.id ? "bg-primary/10 text-primary font-bold shadow-sm" : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
            )}
          >
            <item.icon className="size-5 mr-3" />
            {isSidebarOpen && <span>{item.name}</span>}
          </Button>
        ))}
      </div>

      <div className="p-4 border-t border-border/50 grid gap-2">
        <Button 
          variant="ghost" 
          onClick={() => handleTabClick("settings")}
          className={cn(
            "w-full justify-start h-12 rounded-xl mb-1",
            activeTab === "settings" ? "bg-primary/10 text-primary font-bold shadow-sm" : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
          )}
        >
          <Settings className="size-5 mr-3" />
          {isSidebarOpen && <span>Settings</span>}
        </Button>
        <Button variant="ghost" onClick={onLogout} className="w-full justify-start h-12 text-destructive hover:bg-destructive/10 hover:text-destructive">
          <LogOut className="size-5 mr-3" />
          {isSidebarOpen && <span>Logout</span>}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background overflow-hidden portal-theme">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="hidden lg:block h-full relative z-20 shrink-0"
      >
        <SidebarContent />
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 size-6 rounded-full border border-border shadow-sm z-30"
        >
          <ChevronsLeft className={cn("size-3 transition-transform", !isSidebarOpen && "rotate-180")} />
        </Button>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          >
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-64 h-full"
              onClick={e => e.stopPropagation()}
            >
              <SidebarContent />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-background/80 backdrop-blur-md border-b border-border/50 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="size-5" />
            </Button>
            <div className="hidden md:flex items-center relative">
              <Search className="size-4 absolute left-3 text-muted-foreground" />
              <Input placeholder="Search records..." className="h-9 w-64 pl-9 rounded-lg bg-muted/50 border-none focus-visible:ring-1" />
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <LanguageToggle />
            <ThemeToggle />
            <NotificationBell user={user} />
            <div className="h-8 w-[1px] bg-border mx-2 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold leading-none">{user.fullName}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mt-1">{user.role}</p>
              </div>
              <Avatar className="size-9 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">{user.fullName[0]}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <div className="flex-1 overflow-y-auto w-full custom-scrollbar bg-zinc-50 dark:bg-black/20">
          <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto space-y-6">
            {!user.emailVerified && user.role !== 'admin' && (
              <VerificationBanner user={user} />
            )}
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
function VerificationBanner({ user }: { user: User }) {
  const { resendVerificationLink, checkEmailVerificationStatus } = useAuth()
  const [loading, setLoading] = React.useState(false)
  const [checking, setChecking] = React.useState(false)

  const handleResend = async () => {
    setLoading(true)
    await resendVerificationLink()
    setLoading(false)
  }

  const handleCheck = async () => {
    setChecking(true)
    await checkEmailVerificationStatus()
    setChecking(false)
  }

  return (
    <motion.div 
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      className="overflow-hidden"
    >
      <div className="bg-indigo-600 rounded-3xl p-4 md:p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl shadow-indigo-600/20 mb-2">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
            <MailCheck className="size-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-white/90">Identity Verification Required</p>
            <p className="text-[10px] font-bold text-white/60 tracking-wider">Please verify <span className="text-white">{user.email}</span> to secure your academic records.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleResend}
            disabled={loading}
            className="flex-1 md:flex-none h-10 rounded-xl bg-white/10 hover:bg-white/20 border-none text-white font-black text-[9px] uppercase tracking-widest transition-all"
          >
            {loading ? <RefreshCcw className="size-3 animate-spin mr-2" /> : <Send className="size-3 mr-2" />}
            Resend link
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleCheck}
            disabled={checking}
            className="flex-1 md:flex-none h-10 rounded-xl bg-white text-indigo-600 hover:bg-white/90 border-none font-black text-[9px] uppercase tracking-widest shadow-sm transition-all"
          >
            {checking ? <RefreshCcw className="size-3 animate-spin mr-2" /> : <RefreshCcw className="size-3 mr-2" />}
            I've Verified
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
