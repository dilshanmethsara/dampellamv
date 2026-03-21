"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronDown, BookOpen, Users, Award, Sparkles, ArrowRight } from "lucide-react"
import { useSettings } from "@/lib/hooks/use-settings"

function FloatingParticle({ delay, x, y, size }: { delay: number; x: number; y: number; size: number }) {
  return (
    <div
      className="absolute rounded-full bg-primary/30 blur-sm animate-pulse"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDelay: `${delay}ms`,
        animationDuration: `${3000 + delay}ms`,
      }}
    />
  )
}

const particles = [
  { x: 10, y: 20, size: 8, delay: 0 },
  { x: 85, y: 15, size: 12, delay: 500 },
  { x: 25, y: 70, size: 6, delay: 1000 },
  { x: 70, y: 60, size: 10, delay: 200 },
  { x: 50, y: 85, size: 7, delay: 800 },
  { x: 90, y: 80, size: 9, delay: 300 },
  { x: 5, y: 50, size: 5, delay: 1200 },
  { x: 60, y: 10, size: 11, delay: 700 },
]

export function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const { settings } = useSettings()
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
      })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Rich layered background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--secondary)/0.12)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.08)_0%,transparent_60%)]" />

      {/* Animated grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.04)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.04)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_60%,transparent_100%)]" />

      {/* Floating orbs - parallax */}
      <div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] bg-primary/10 pointer-events-none transition-transform duration-1000 ease-out"
        style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] bg-secondary/10 pointer-events-none transition-transform duration-1000 ease-out"
        style={{ transform: `translate(${-mousePos.x * 0.3}px, ${-mousePos.y * 0.3}px)` }}
      />

      {/* Floating particles */}
      {particles.map((p, i) => <FloatingParticle key={i} {...p} />)}

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">

          {/* Logo + Badge combined row — centered */}
          <div
            className={`flex items-center justify-center gap-3 mb-8 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            {/* Logo — slightly left of text by being before it in the flex row */}
            <div className="relative h-14 w-14 rounded-2xl overflow-hidden ring-2 ring-primary/30 shadow-lg shadow-primary/20 shrink-0">
              <Image src="/dmvlogo.jpg" alt="School Logo" fill className="object-contain" priority />
            </div>

            {/* Badge text */}
            <div className="flex items-center gap-2 px-5 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm text-primary">
              <Sparkles className="h-4 w-4 animate-pulse shrink-0" />
              <span className="text-sm font-semibold tracking-wide">Government School · Southern Province · Sri Lanka</span>
            </div>
          </div>

          {/* Main heading with gradient */}
          <h1
            className={`font-serif font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05] mb-6 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <span className="text-foreground block">Welcome to</span>
            <span className="block bg-gradient-to-r from-primary via-blue-400 to-secondary bg-clip-text text-transparent">
              {settings?.name || "MR/ Dampella M.V"}
            </span>
          </h1>

          {/* Motto with decorative lines */}
          <div
            className={`flex items-center justify-center gap-4 mb-8 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent to-primary/40" />
            <p className="text-lg md:text-xl text-muted-foreground font-medium italic px-2">
              "{settings?.motto}"
            </p>
            <div className="h-px flex-1 max-w-24 bg-gradient-to-l from-transparent to-primary/40" />
          </div>

          {/* CTA buttons */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-700 delay-400 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <Link href="/about">
              <Button size="lg" className="gap-2 text-base h-13 px-8 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow">
                <BookOpen className="h-5 w-5" />
                Discover Our School
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <Link href="/portal">
              <Button size="lg" variant="outline" className="gap-2 text-base h-13 px-8 backdrop-blur-sm border-primary/30 hover:bg-primary/10 hover:border-primary/60 transition-all">
                <Users className="h-5 w-5" />
                Student Portal
              </Button>
            </Link>
          </div>

          {/* Glassmorphism quick stats */}
          <div
            className={`grid grid-cols-3 gap-4 max-w-lg mx-auto transition-all duration-700 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            {[
              { label: "Students", value: `${settings?.students || 0}+`, color: "text-primary" },
              { label: "Teachers", value: settings?.teachers || 0, color: "text-blue-400" },
              { label: "Years", value: `${settings?.yearsOfExcellence || 0}+`, color: "text-secondary" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="backdrop-blur-sm bg-background/30 border border-white/10 rounded-2xl p-4 hover:bg-background/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`text-2xl md:text-3xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-muted-foreground font-medium mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
        <span className="text-xs text-muted-foreground tracking-widest uppercase">Scroll</span>
        <ChevronDown className="h-5 w-5 text-muted-foreground" />
      </div>
    </section>
  )
}
