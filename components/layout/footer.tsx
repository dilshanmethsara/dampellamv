"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { GraduationCap, MapPin, Phone, Mail, ArrowRight, Instagram, Linkedin, Twitter, Facebook } from "lucide-react"
import { useSettings } from "@/lib/hooks/use-settings"
import { Button } from "@/components/ui/button"

const quickLinks = [
  { href: "/about", label: "About Us" },
  { href: "/news", label: "News & Updates" },
  { href: "/events", label: "Upcoming Events" },
  { href: "/gallery", label: "Life on Campus" },
]

const academicLinks = [
  { href: "/academics", label: "Academics" },
  { href: "/clubs", label: "Clubs & Societies" },
  { href: "/contact", label: "Contact Us" },
  { href: "/portal", label: "Student Portal" },
]

export function Footer() {
  const { settings } = useSettings()

  return (
    <footer className="relative bg-card overflow-hidden pt-24 pb-8 border-t border-border/50">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Main Brand Column */}
          <div className="lg:col-span-5 space-y-8">
            <Link href="/" className="inline-flex items-center gap-4 group">
              <div className="relative w-16 h-16 rounded-2xl bg-white shadow-lg shadow-primary/10 border-2 border-primary/20 overflow-hidden shrink-0">
                <Image
                  src="/dmvlogo.jpg"
                  alt="School Logo"
                  fill
                  className="object-contain p-1.5 group-hover:scale-110 transition-transform"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-black text-2xl tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {settings?.name || "MR/ Dampella M.V"}
                </span>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-1">
                  Established 1954
                </span>
              </div>
            </Link>

            <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
              {settings?.motto || "Knowledge is Power, Education is the Key."} — Empowering the next generation of leaders with excellence, integrity, and innovation.
            </p>

            <div className="flex items-center gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-3">
            <h3 className="text-lg font-bold text-foreground mb-6">Discover</h3>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:scale-150 transition-transform" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h3 className="text-lg font-bold text-foreground mb-6">Contact & Info</h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-background border flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Location</p>
                  <p className="text-sm text-muted-foreground">{settings?.address || "Dampella, Southern Province, Sri Lanka"}</p>
                </div>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-background border flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Phone</p>
                  <p className="text-sm text-muted-foreground">{settings?.phone || "+94 XX XXX XXXX"}</p>
                </div>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-background border flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Email</p>
                  <p className="text-sm text-muted-foreground">{settings?.email || "info@dampellamv.lk"}</p>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-muted-foreground font-medium text-sm md:text-base text-center md:text-left">
            &copy; {new Date().getFullYear()} {settings?.name}. All rights reserved.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-sm font-semibold text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-border" />
            <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>

          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-background border shadow-sm">
            <span className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Project by</span>
            <span className="h-4 w-px bg-border" />
            <span className="text-foreground font-bold tracking-tight">
              Dilshan Methsara
            </span>
          </div>
        </div>

      </div>
    </footer>
  )
}
