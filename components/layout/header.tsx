"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSettings } from "@/lib/hooks/use-settings"
import { ThemeToggle } from "@/components/portal/theme-toggle"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/news", label: "News" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/academics", label: "Academics" },
  { href: "/clubs", label: "Clubs" },
  { href: "/contact", label: "Contact" },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { settings } = useSettings()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-md py-2"
          : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className={cn(
              "rounded-xl overflow-hidden transition-all duration-300 shrink-0",
              isScrolled ? "h-10 w-10 shadow-sm" : "h-12 w-12 shadow-md"
            )}>
              <Image
                src="/dmvlogo.jpg"
                alt="School Logo"
                width={48}
                height={48}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className={cn(
                "font-serif font-bold text-lg leading-tight transition-colors",
                isScrolled ? "text-foreground" : "text-foreground"
              )}>
                {settings?.name || "MR/ Dampella M.V"}
              </span>
              <span className={cn(
                "text-xs transition-colors hidden sm:block",
                isScrolled ? "text-muted-foreground" : "text-muted-foreground"
              )}>
                {settings?.address?.split(',').pop()?.trim() || "Southern Province"}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname === link.href
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/portal">
              <Button variant="default" size="sm" className="ml-2">
                Student Portal
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" size="sm">
                Admin
              </Button>
            </Link>
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-1 lg:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300",
            isMobileMenuOpen ? "max-h-96 mt-4" : "max-h-0"
          )}
        >
          <div className="bg-card rounded-lg border shadow-lg p-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname === link.href
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/portal" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="default" className="w-full mt-2">
                Student Portal
              </Button>
            </Link>
            <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full mt-2">
                Admin Panel
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
