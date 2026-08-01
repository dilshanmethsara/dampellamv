"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/lib/hooks/use-settings"
import { ThemeToggle } from "@/components/portal/theme-toggle"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/academics", label: "Academics" },
  { href: "/news", label: "News" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/clubs", label: "Clubs" },
  { href: "/contact", label: "Contact" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { settings } = useSettings()
  const showThemeToggle = pathname !== "/"

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl shadow-lg shadow-[#1B2A6B]/5 border-b border-[#5B35D5]/10">
        {/* Animated gradient accent bar */}
        <div className="relative h-[3px] w-full overflow-hidden" style={{ background: 'linear-gradient(90deg, #1B2A6B, #5B35D5, #9333EA, #EC4899)' }}>
          <div className="absolute inset-y-0 w-1/3 bg-white/40 blur-sm" style={{ animation: 'sheenMove 3.5s ease-in-out infinite' }} />
        </div>
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-2.5 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0 group cursor-pointer">
            <div className="relative">
              {/* Glowing ring behind logo */}
              <div className="absolute -inset-[3px] rounded-lg opacity-60 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, #5B35D5, #9333EA)', filter: 'blur(4px)' }} />
              <div className="relative rounded-lg overflow-hidden bg-white ring-2 ring-[#5B35D5]/20 transition-all duration-300 group-hover:ring-[#5B35D5]/50">
                <Image
                  src="/dmvlogo.jpg"
                  alt="School Logo"
                  width={48}
                  height={48}
                  className="object-contain transition-transform duration-300 group-hover:scale-110"
                  priority
                />
              </div>
            </div>
            <div>
              <div className="font-extrabold text-base leading-tight tracking-tight text-[#1B2A6B]">
                {settings?.name || "MR/ Dampella M.V"}
              </div>
              <div className="text-[9px] font-bold uppercase tracking-[0.18em] mt-0.5" style={{ background: 'linear-gradient(90deg, #5B35D5, #9333EA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Excellence in Education
              </div>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-1.5 rounded-lg transition-colors duration-200 group ${
                    isActive ? 'text-[#5B35D5] font-semibold' : 'text-[#4B5563] hover:text-[#5B35D5] hover:bg-[#5B35D5]/5'
                  }`}
                >
                  {link.label}
                  {/* Animated gradient underline */}
                  <span
                    className={`absolute left-1/2 -translate-x-1/2 bottom-0.5 h-0.5 rounded-full transition-all duration-300 ${
                      isActive ? 'w-5' : 'w-0 group-hover:w-5'
                    }`}
                    style={{ background: 'linear-gradient(90deg, #5B35D5, #9333EA)' }}
                  />
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            {showThemeToggle && <ThemeToggle />}
            <Link href="/portal" className="group relative">
              {/* Pulsing glow ring */}
              <span className="absolute -inset-1 rounded-full opacity-60 blur-md transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'linear-gradient(135deg, #5B35D5, #EC4899)', animation: 'glowPulse 2.5s ease-in-out infinite' }} />
              {/* Shine sweep on hover */}
              <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                <span className="absolute top-0 left-[-100%] w-1/2 h-full skew-x-[-20deg] bg-white/30 transition-all duration-700 group-hover:left-[150%]" />
              </span>
              <Button className="relative hidden lg:inline-flex items-center gap-1.5 text-white text-sm font-semibold px-5 py-2 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-95 whitespace-nowrap" style={{ background: 'linear-gradient(135deg, #1B2A6B, #5B35D5)' }}>
                Student Portal
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            {/* Animated hamburger / X */}
            <button
              className="lg:hidden relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 bg-[#5B35D5]/5 hover:bg-[#5B35D5]/10 text-[#1B2A6B]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300">
                {mobileMenuOpen ? (
                  <>
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="18" y1="6" x2="6" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#1B2A6B]/10 bg-white/95 backdrop-blur-md px-4 py-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                    isActive ? 'text-[#5B35D5] bg-[#5B35D5]/5 font-semibold' : 'text-[#4B5563] hover:text-[#5B35D5] hover:bg-[#5B35D5]/5'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              )
            })}
            <Link href="/portal">
              <Button className="mt-2 text-white text-sm font-semibold px-5 py-3 rounded-full w-full transition-all hover:scale-[1.02] active:scale-95 shadow-md" style={{ background: 'linear-gradient(135deg, #1B2A6B, #5B35D5)' }}>
                Student Portal
              </Button>
            </Link>
          </div>
        )}
      </nav>
    </>
  )
}
