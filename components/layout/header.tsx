"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from "framer-motion"
import { Menu, X, ArrowRight } from "lucide-react"
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
  const [hoveredPath, setHoveredPath] = useState<string | null>(null)
  
  const pathname = usePathname()
  const { settings } = useSettings()

  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20)
  })

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 70, damping: 20, mass: 1 }}
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 flex justify-center pt-4 sm:pt-6 pointer-events-none"
      >
        <motion.div
          layout
          initial={false}
          animate={{
            width: isScrolled ? "100%" : "1280px",
            borderRadius: isScrolled ? "24px" : "40px",
            y: isScrolled ? -10 : 0
          }}
          transition={{ 
            type: "spring", 
            stiffness: 80, 
            damping: 20, 
            mass: 0.8 
          }}
          className={cn(
            "relative flex items-center justify-between pointer-events-auto border transition-colors duration-700 overflow-hidden",
            isScrolled 
              ? "bg-background/70 backdrop-blur-2xl border-white/5 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)] dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.8)] px-5 py-3" 
              : "bg-background/40 backdrop-blur-xl border-white/10 shadow-2xl px-6 py-4"
          )}
        >
          {/* Subtle noise/gradient overlay for premium feel */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 opacity-50 pointer-events-none" />

          {/* Logo */}
          <Link href="/" className="relative z-10 flex items-center gap-4 group">
            <motion.div 
              layout
              className="relative rounded-2xl overflow-hidden ring-2 ring-primary/20 shadow-lg bg-white"
              animate={{ 
                height: isScrolled ? 40 : 48, 
                width: isScrolled ? 40 : 48,
                borderRadius: isScrolled ? 12 : 16
              }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              <Image
                src="/dmvlogo.jpg"
                alt="School Logo"
                fill
                className="object-contain p-1 group-hover:scale-110 transition-transform duration-700 ease-out"
                priority
              />
            </motion.div>
            <div className="flex flex-col">
              <motion.span 
                layout
                className="font-serif font-black text-lg sm:text-xl tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
              >
                {settings?.name || "MR/ Dampella"}
              </motion.span>
              <motion.span 
                layout
                animate={{ opacity: isScrolled ? 0 : 1, height: isScrolled ? 0 : 'auto' }}
                className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-primary uppercase origin-left"
              >
                Excellence in Education
              </motion.span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav 
            className="hidden lg:flex relative z-10 items-center justify-center p-1 rounded-full"
            onMouseLeave={() => setHoveredPath(null)}
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              const isHovered = hoveredPath === link.href

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => setHoveredPath(link.href)}
                  className="relative px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
                >
                  {isHovered && !isActive && (
                    <motion.div
                      layoutId="nav-hover"
                      className="absolute inset-0 bg-muted/60 rounded-full -z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 bg-primary rounded-full -z-10 shadow-md shadow-primary/30"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                  <span className={cn(
                    "relative z-10 transition-colors duration-300",
                    isActive ? "text-primary-foreground" : "text-foreground/80 hover:text-foreground"
                  )}>
                    {link.label}
                  </span>
                </Link>
              )
            })}
          </nav>

          {/* Desktop Actions */}
          <motion.div layout className="hidden lg:flex relative z-10 items-center gap-3">
            <div className="bg-background/20 backdrop-blur-md rounded-full border border-border/50 flex items-center p-1 shadow-inner">
              <ThemeToggle />
            </div>
            
            <Link href="/portal">
              <Button className="rounded-full px-7 gap-2 shadow-lg shadow-primary/20 bg-primary/90 hover:bg-primary hover:-translate-y-0.5 transition-all duration-300 h-11 group">
                Portal
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.div layout className="flex items-center gap-2 lg:hidden relative z-10">
            <div className="bg-background/20 backdrop-blur-md rounded-full border border-border/50 p-0.5 shadow-inner">
              <ThemeToggle />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10 bg-background/50 border border-white/10 shadow-sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </motion.div>
      </motion.header>

      {/* Mobile Navigation Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm lg:hidden pointer-events-auto"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 250, damping: 25 }}
              className="fixed inset-x-4 top-28 sm:top-32 z-50 lg:hidden pointer-events-auto origin-top"
            >
              <div className="bg-card/95 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-6 flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none" />
                
                {navLinks.map((link, index) => {
                  const isActive = pathname === link.href
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "relative block px-6 py-4 rounded-2xl text-base font-bold transition-all duration-300 overflow-hidden group",
                          isActive
                            ? "text-primary"
                            : "text-foreground/80 hover:text-foreground"
                        )}
                      >
                        {isActive && (
                          <div className="absolute inset-0 bg-primary/10 -z-10" />
                        )}
                        <span className="relative z-10 flex items-center justify-between">
                          {link.label}
                          {isActive && <motion.div layoutId="mobile-indicator" className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </span>
                      </Link>
                    </motion.div>
                  )
                })}
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navLinks.length * 0.05 + 0.1, type: "spring", stiffness: 300, damping: 25 }}
                  className="mt-4 pt-4 border-t border-border/50 relative z-10"
                >
                  <Link href="/portal" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full rounded-2xl h-14 text-lg shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all gap-2 group">
                      Student Portal
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
