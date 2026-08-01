"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, Lock, User, ShieldCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

import { signInWithEmailAndPassword, signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

// Admin account email (matches /admin/settings display). Plain "admin" username maps to this.
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@dampellamv.lk"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const loginEmail = email.trim().includes("@")
        ? email.trim().toLowerCase()
        : ADMIN_EMAIL

      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, password)

      // Verify the account has the admin role in Firestore (mirrors rules isAdmin())
      const docSnap = await getDoc(doc(db, "profiles", userCredential.user.uid))
      const profile = docSnap.exists() ? docSnap.data() : null
      const role = (profile?.role || profile?.role_class || "").toLowerCase()

      if (role !== "admin") {
        await signOut(auth)
        toast.error("Access Denied: This account is not an admin in this database.")
        setIsLoading(false)
        return
      }

      sessionStorage.setItem("admin_auth", "true")
      toast.success("Welcome to Admin Panel!")
      router.replace("/admin")
    } catch (err: any) {
      console.error("Admin login error:", err)
      if (err.code === "auth/invalid-credential") {
        toast.error("Invalid username or password")
      } else {
        toast.error(err.message || "Login failed. Please try again.")
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.03)_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      {/* Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-card border border-border/50 rounded-3xl shadow-2xl p-8 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-primary/30 shadow-lg shadow-primary/20 mx-auto mb-4">
              <Image src="/dmvlogo.jpg" alt="School Logo" width={80} height={80} className="object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">MR/ Dampella M.V · Restricted Access</p>
          </div>

          {/* Security badge */}
          <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 mb-6">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <span className="text-xs text-muted-foreground">Secure area — authorized personnel only</span>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Username / Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  placeholder="Enter email or admin"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-11 pl-10 rounded-xl"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-11 pl-10 pr-10 rounded-xl"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl gap-2 shadow-lg shadow-primary/20 mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
              ) : (
                <><ShieldCheck className="h-4 w-4" /> Sign In to Admin Panel</>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            <a href="/" className="hover:text-primary transition-colors">← Back to website</a>
          </p>
        </div>
      </div>
    </div>
  )
}
