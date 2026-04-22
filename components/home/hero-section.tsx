"use client"

import { useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronDown, BookOpen, Users, Sparkles, ArrowRight } from "lucide-react"
import { useSettings } from "@/lib/hooks/use-settings"

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

export function HeroSection() {
  const { settings } = useSettings()
  const sectionRef = useRef<HTMLElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background"
    >
      {/* Dynamic Backgrounds */}
      <motion.div style={{ y, opacity }} className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.15)_0%,transparent_60%)]" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-blob" />
        <div className="absolute top-40 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] mix-blend-screen opacity-50 animate-blob animation-delay-2000" />
      </motion.div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.03]" />

      <div className="container mx-auto px-4 relative z-10 pt-28 sm:pt-32">
        <motion.div 
          className="max-w-5xl mx-auto text-center"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={fadeIn} className="flex justify-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium tracking-wide text-foreground/80">
                Government School · Southern Province · Sri Lanka
              </span>
            </div>
          </motion.div>

          {/* Logo */}
          <motion.div variants={fadeIn} className="flex justify-center mb-6 sm:mb-8">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-3xl overflow-hidden ring-4 ring-background shadow-2xl shadow-primary/20 bg-white">
              <Image src="/dmvlogo.jpg" alt="School Logo" fill className="object-contain p-2" priority />
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            variants={fadeIn}
            className="text-4xl sm:text-7xl md:text-8xl font-black tracking-tight mb-4 sm:mb-6"
          >
            <span className="block text-foreground">Welcome to</span>
            <span className="block text-gradient pb-2">
              {settings?.name || "MR/ Dampella M.V"}
            </span>
          </motion.h1>

          <h2 className="sr-only">Dampella Maha Vidyalaya</h2>

          {/* Motto */}
          <motion.div variants={fadeIn} className="flex items-center justify-center gap-6 mb-8 sm:mb-12">
            <div className="h-[1px] w-8 sm:w-24 bg-gradient-to-r from-transparent to-primary/30" />
            <p className="text-base sm:text-xl md:text-2xl text-muted-foreground font-serif italic text-pretty max-w-2xl px-4">
              "{settings?.motto}"
            </p>
            <div className="h-[1px] w-8 sm:w-24 bg-gradient-to-l from-transparent to-primary/30" />
          </motion.div>

          {/* Buttons */}
          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 sm:mb-20">
            <Link href="/about">
              <Button size="lg" className="h-14 px-8 text-base shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all">
                <BookOpen className="h-5 w-5 mr-2" />
                Discover Our School
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/portal">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base glass hover:bg-primary/5 hover:border-primary/50 transition-all">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Student Portal
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce cursor-pointer"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
      >
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-[0.2em]">Scroll</span>
        <ChevronDown className="h-5 w-5 text-muted-foreground/70" />
      </motion.div>
    </section>
  )
}
