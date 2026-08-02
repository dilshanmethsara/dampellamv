"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Mail, Phone, Quote } from "lucide-react"
import { useSettings } from "@/lib/hooks/use-settings"

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/academics", label: "Academics" },
  { href: "/news", label: "News" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/clubs", label: "Clubs" },
  { href: "/contact", label: "Contact" },
]

// School-appropriate quotes
const SCHOOL_QUOTES = [
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "Intelligence plus character — that is the goal of true education.", author: "Martin Luther King Jr." },
  { text: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle" },
  { text: "Education is not preparation for life; education is life itself.", author: "John Dewey" },
  { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
  { text: "Learning is a treasure that will follow its owner everywhere.", author: "Chinese Proverb" },
  { text: "Excellence is not a skill, it's an attitude.", author: "Ralph Marston" },
]

// Typing quote component with Framer Motion
function TypingQuotes() {
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [pause, setPause] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const currentQuote = SCHOOL_QUOTES[quoteIndex]
  const typingSpeed = 40
  const deletingSpeed = 25
  const pauseTime = 3000

  useEffect(() => {
    if (pause) {
      timeoutRef.current = setTimeout(() => {
        setPause(false)
        setIsDeleting(true)
      }, pauseTime)
      return () => clearTimeout(timeoutRef.current)
    }

    if (isDeleting) {
      if (displayedText.length === 0) {
        setIsDeleting(false)
        setQuoteIndex((prev) => (prev + 1) % SCHOOL_QUOTES.length)
      } else {
        timeoutRef.current = setTimeout(() => {
          setDisplayedText(currentQuote.text.substring(0, displayedText.length - 1))
        }, deletingSpeed)
      }
    } else {
      if (displayedText === currentQuote.text) {
        setPause(true)
      } else {
        timeoutRef.current = setTimeout(() => {
          setDisplayedText(currentQuote.text.substring(0, displayedText.length + 1))
        }, typingSpeed)
      }
    }

    return () => clearTimeout(timeoutRef.current)
  }, [displayedText, isDeleting, pause, currentQuote.text, quoteIndex])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-start gap-3 mt-6 p-4 sm:p-5 bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-lg shadow-[#1B2A6B]/5 max-w-md self-start"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5B35D5, #9333EA)', boxShadow: '0 4px 12px rgba(91,53,213,0.3)' }}>
        <Quote className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <motion.p
          key={quoteIndex}
          className="text-sm sm:text-base text-gray-700 font-medium leading-relaxed italic"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          "{displayedText}"
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            className="ml-1 font-normal"
          >
            |
          </motion.span>
        </motion.p>
        <motion.p
          key={`author-${quoteIndex}`}
          className="text-xs font-semibold mt-2 text-right"
          style={{ color: '#5B35D5' }}
        >
          — {currentQuote.author}
        </motion.p>
      </div>
    </motion.div>
  )
}

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] } },
}

const slideUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } 
  },
}

const slideUpDelay = (delay: number) => ({
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay } 
  },
})

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
}

const textReveal = {
  hidden: { opacity: 0, y: "100%" },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  },
}

function ShieldCrest() {
  return (
    <svg width="48" height="56" viewBox="0 0 48 56" fill="none" className="flex-shrink-0">
      <path d="M24 2L4 10v18c0 13 8.5 21 20 26 11.5-5 20-13 20-26V10L24 2z" fill="#1B2A6B" stroke="#3B4FBB" strokeWidth="1.5"/>
      <path d="M24 8L8 15v13c0 9.5 6 15.5 16 20 10-4.5 16-10.5 16-20V15L24 8z" fill="none" stroke="#7B8FDB" strokeWidth="1"/>
      <text x="24" y="30" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="serif">M</text>
      <path d="M16 34h16M16 37h16" stroke="#7B8FDB" strokeWidth="1"/>
    </svg>
  )
}

function GraduationIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1B2A6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  )
}

function PeopleIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1B2A6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}

function TrophyIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1B2A6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="8 21 12 17 16 21"/>
      <line x1="12" y1="17" x2="12" y2="11"/>
      <path d="M7 4H4a1 1 0 0 0-1 1v3a4 4 0 0 0 4 4h.5M17 4h3a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4h-.5"/>
      <path d="M7 4h10v7a5 5 0 0 1-10 0V4z"/>
    </svg>
  )
}

export function HeroSection() {
  const { settings } = useSettings()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <section className="relative overflow-hidden">
      {/* Top Bar */}
      <div className="relative text-white text-xs overflow-hidden" style={{ background: 'linear-gradient(90deg, #141E4E, #1B2A6B 40%, #5B35D5 100%)' }}>
        {/* Animated sheen */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'linear-gradient(100deg, transparent 20%, rgba(255,255,255,0.35) 50%, transparent 80%)', animation: 'sheenMove 6s ease-in-out infinite' }} />
        <div className="relative max-w-6xl mx-auto flex items-center justify-between gap-3 py-2 px-4 md:px-8">
          {/* Announcement marquee */}
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            <span className="flex-shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold tracking-wide bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              NEW
            </span>
            <div className="relative flex-1 overflow-hidden min-w-0">
              <p className="truncate font-medium tracking-wide text-white/90">
                Welcome to Dampella Maha Vidyalaya — 60 Years of Excellence
              </p>
            </div>
          </div>
          {/* Contact info */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="flex items-center gap-1.5 text-white/85 hover:text-white transition-colors cursor-pointer">
              <span className="w-6 h-6 rounded-md bg-white/10 ring-1 ring-white/20 flex items-center justify-center">
                <Mail className="h-3 w-3" />
              </span>
              <span className="hidden sm:inline">info@dampellamv.lk</span>
            </span>
            <span className="w-px h-4 bg-white/25" />
            <span className="flex items-center gap-1.5 text-white/85 hover:text-white transition-colors cursor-pointer">
              <span className="w-6 h-6 rounded-md bg-white/10 ring-1 ring-white/20 flex items-center justify-center">
                <Phone className="h-3 w-3" />
              </span>
              <span className="hidden sm:inline">+94 41 2 123 456</span>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
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
              <div className="absolute -inset-[3px] opacity-60 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, #5B35D5, #9333EA)', filter: 'blur(4px)' }} />
              <div className="relative overflow-hidden bg-white ring-2 ring-[#5B35D5]/20 transition-all duration-300 group-hover:ring-[#5B35D5]/50">
                <Image
                  src="/dmvlogo.jpg"
                  alt="MR/ Dampella M.V Logo"
                  width={48}
                  height={48}
                  className="object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </div>
            <div>
              <div className="font-extrabold text-base leading-tight tracking-tight text-[#1B2A6B]">
                MR/ Dampella M.V
              </div>
              <div className="text-[9px] font-bold uppercase tracking-[0.18em] mt-0.5" style={{ background: 'linear-gradient(90deg, #5B35D5, #9333EA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Excellence in Education
              </div>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {NAV_LINKS.map((link) => {
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
            {NAV_LINKS.map((link) => {
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

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ backgroundColor: '#F3F0FF' }}>
        {/* Decorative background elements */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, #7C3AED, transparent 70%)' }} />
        <div className="absolute top-1/3 -left-40 w-96 h-96 rounded-full opacity-25 blur-3xl" style={{ background: 'radial-gradient(circle, #4F46E5, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #EC4899, transparent 70%)' }} />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#1B2A6B 1px, transparent 1px), linear-gradient(90deg, #1B2A6B 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="max-w-6xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-0 min-h-[500px]">

          {/* Left text */}
          <div className="flex flex-col justify-center py-10 lg:py-14 gap-6 relative z-10">
            <motion.div
              variants={slideUpDelay(0)}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-white/70 backdrop-blur-sm border shadow-sm"
              style={{ color: '#5B35D5', borderColor: '#5B35D5/20' }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#5B35D5' }} />
              Welcome to MR/ Dampella M.V
            </motion.div>
            <motion.h1
              className="text-5xl md:text-6xl font-extrabold leading-[1.1]"
              style={{ fontFamily: "'Playfair Display', serif", color: '#0F172A' }}
            >
              <motion.span
                variants={textReveal}
                initial="hidden"
                animate="visible"
                className="block"
              >
                Inspiring Minds.
              </motion.span>
              <motion.span
                variants={textReveal}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.15 }}
                className="block"
              >
                Building{' '}
                <span style={{ background: 'linear-gradient(90deg, #5B35D5, #9333EA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Futures.
                </span>
              </motion.span>
            </motion.h1>
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="rounded-full"
              style={{ width: 56, height: 4, background: 'linear-gradient(90deg, #5B35D5, #9333EA)' }}
            />
            <motion.p
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="text-gray-600 text-base leading-relaxed max-w-md"
            >
              Dedicated to excellence in education and character development. Empowering students to become responsible citizens and future leaders.
            </motion.p>

            {/* Typing Quotes */}
            <TypingQuotes />

            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-4 mt-1"
            >
              <Link href="/about" className="group">
                <Button className="inline-flex items-center gap-2 text-white text-sm font-semibold px-7 py-3.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-95" style={{ backgroundColor: '#1B2A6B', boxShadow: '0 8px 24px rgba(27,42,107,0.35)' }}>
                  Discover Our School
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/academics">
                <Button variant="outline" className="inline-flex items-center gap-2 text-sm font-semibold px-7 py-3.5 rounded-full border-2 bg-white/60 backdrop-blur-sm hover:bg-[#1B2A6B] hover:text-white hover:border-[#1B2A6B] transition-all duration-300 hover:scale-[1.03] active:scale-95" style={{ color: '#1B2A6B', borderColor: '#1B2A6B' }}>
                  Explore Academics
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap items-center gap-x-8 gap-y-4 mt-4 pt-5 border-t border-[#1B2A6B]/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white shadow-sm border border-[#1B2A6B]/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" style={{ color: '#1B2A6B' }} />
                </div>
                <div>
                  <div className="text-xl font-extrabold leading-tight" style={{ color: '#1B2A6B' }}>6–13</div>
                  <div className="text-xs text-gray-500 font-medium">Grades Offered</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white shadow-sm border border-[#1B2A6B]/10 flex items-center justify-center">
                  <PeopleIcon />
                </div>
                <div>
                  <div className="text-xl font-extrabold leading-tight" style={{ color: '#1B2A6B' }}>50+</div>
                  <div className="text-xs text-gray-500 font-medium">Teachers</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white shadow-sm border border-[#1B2A6B]/10 flex items-center justify-center">
                  <TrophyIcon />
                </div>
                <div>
                  <div className="text-xl font-extrabold leading-tight" style={{ color: '#1B2A6B' }}>25+</div>
                  <div className="text-xs text-gray-500 font-medium">Years of Excellence</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right visual */}
          <div className="relative hidden lg:flex items-center justify-center py-2">
            {/* Decorative blobs */}
            <div className="absolute top-6 right-8 w-40 h-40 rounded-full opacity-25 blur-3xl" style={{ background: 'radial-gradient(circle, #7C3AED, transparent 70%)' }} />
            <div className="absolute bottom-10 left-4 w-44 h-44 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #EC4899, transparent 70%)' }} />

            {/* Main image card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[480px]"
            >
              {/* Gradient ring frame */}
              <div className="absolute -inset-[6px] rounded-[2.2rem]" style={{ background: 'linear-gradient(135deg, #5B35D5, #9333EA 50%, #EC4899)', filter: 'blur(2px)', opacity: 0.85 }} />
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-[#1B2A6B]/30 bg-white ring-1 ring-white/60">
                <Image
                  src="/heroimg.jpg"
                  alt="MR/ Dampella M.V students"
                  width={960}
                  height={720}
                  className="object-cover w-full h-auto"
                  priority
                />
                {/* Bottom gradient scrim */}
                <div className="absolute inset-x-0 bottom-0 h-28 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(27,42,107,0.55), transparent)' }} />
              </div>

              {/* Floating badge: students */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="absolute -left-8 top-10 bg-white/90 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl shadow-[#1B2A6B]/15 ring-1 ring-[#5B35D5]/10 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5B35D5, #9333EA)', boxShadow: '0 4px 12px rgba(91,53,213,0.3)' }}>
                  <GraduationIcon />
                </div>
                <div>
                  <div className="text-2xl font-extrabold leading-tight text-[#1B2A6B]">99.4%</div>
                  <div className="text-xs font-medium text-gray-500">Pass Rate</div>
                </div>
              </motion.div>

              {/* Floating badge: excellence */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
                className="absolute -right-6 bottom-14 bg-white/90 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl shadow-[#1B2A6B]/15 ring-1 ring-[#5B35D5]/10 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #EC4899, #F97316)', boxShadow: '0 4px 12px rgba(236,72,153,0.3)' }}>
                  <TrophyIcon />
                </div>
                <div>
                  <div className="text-lg font-extrabold leading-tight text-[#1B2A6B]">25+ Years</div>
                  <div className="text-[11px] font-medium text-gray-500">of Excellence</div>
                </div>
              </motion.div>

              {/* Floating chip: motto */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-full px-5 py-2 shadow-lg shadow-[#1B2A6B]/15 ring-1 ring-[#5B35D5]/15 flex items-center gap-2 whitespace-nowrap"
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#5B35D5' }} />
                <span className="text-xs font-bold tracking-wide text-[#1B2A6B]">Inspiring Minds. Building Futures.</span>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Mobile hero image */}
        <div className="lg:hidden px-4 pt-1 pb-8">
          <div className="relative rounded-3xl overflow-hidden shadow-xl shadow-[#1B2A6B]/20 ring-1 ring-white/60" style={{ boxShadow: '0 0 0 5px rgba(91,53,213,0.15)' }}>
            <Image
              src="/heroimg.jpg"
              alt="MR/ Dampella M.V students"
              width={960}
              height={720}
              className="object-cover w-full h-auto"
              priority
            />
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(27,42,107,0.35), transparent 40%)' }} />
          </div>
        </div>
      </div>
    </section>
  )
}
