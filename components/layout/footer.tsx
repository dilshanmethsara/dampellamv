"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { MapPin, Phone, Mail, ArrowRight, Instagram, Linkedin, Twitter, Facebook, Send, GraduationCap } from "lucide-react"
import { useSettings } from "@/lib/hooks/use-settings"

const discoverLinks = [
  { href: "/about", label: "About Us" },
  { href: "/academics", label: "Academics" },
  { href: "/news", label: "News & Updates" },
  { href: "/events", label: "Upcoming Events" },
]

const visitLinks = [
  { href: "/gallery", label: "Life on Campus" },
  { href: "/clubs", label: "Clubs & Societies" },
  { href: "/contact", label: "Contact Us" },
  { href: "/portal", label: "Student Portal" },
]

const socials = [
  { icon: Facebook, label: "Facebook" },
  { icon: Twitter, label: "Twitter" },
  { icon: Instagram, label: "Instagram" },
  { icon: Linkedin, label: "LinkedIn" },
]

export function Footer() {
  const { settings } = useSettings()
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  return (
    <footer className="relative overflow-hidden pt-20 pb-8 bg-[#0d1230] text-slate-300">
      {/* Top gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#1B2A6B] via-[#9333EA] to-[#EC4899]" />

      {/* Ambient glows */}
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-[#5B35D5]/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-32 w-[520px] h-[520px] bg-[#9333EA]/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-14">
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-7">
            <Link href="/" className="inline-flex items-center gap-4 group">
              <div className="relative">
                <div className="absolute -inset-[3px] opacity-60 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[#5B35D5] to-[#9333EA] blur-[4px]" />
                <div className="relative w-12 h-12 bg-white ring-2 ring-[#5B35D5]/20 overflow-hidden transition-all duration-300 group-hover:ring-[#9333EA]/60">
                  <Image
                    src="/dmvlogo.jpg"
                    alt="School Logo"
                    width={48}
                    height={48}
                    className="object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-black text-2xl tracking-tight text-white">
                  {settings?.name || "MR/ Dampella M.V"}
                </span>
                <span className="text-xs font-medium text-[#9DA3C6] uppercase tracking-widest mt-1">
                  Established 1954
                </span>
              </div>
            </Link>

            <p className="text-[#9DA3C6] leading-relaxed max-w-md">
              {settings?.motto || "Knowledge is Power, Education is the Key."} — Empowering the next generation of leaders with excellence, integrity, and innovation.
            </p>

            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-[#9DA3C6] hover:text-white hover:border-transparent hover:bg-gradient-to-br hover:from-[#5B35D5] hover:to-[#9333EA] transition-all duration-300 hover:shadow-lg hover:shadow-[#9333EA]/30 hover:-translate-y-0.5"
                >
                  <Icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Discover */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Discover</h3>
            <ul className="space-y-3.5">
              {discoverLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#9DA3C6] hover:text-white transition-colors flex items-center gap-2 group font-medium"
                  >
                    <span className="w-1 h-1 bg-gradient-to-r from-[#5B35D5] to-[#9333EA] group-hover:scale-150 transition-transform" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Visit */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Visit</h3>
            <ul className="space-y-3.5">
              {visitLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#9DA3C6] hover:text-white transition-colors flex items-center gap-2 group font-medium"
                  >
                    <span className="w-1 h-1 bg-gradient-to-r from-[#9333EA] to-[#EC4899] group-hover:scale-150 transition-transform" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Get in Touch</h3>
            <ul className="space-y-5 mb-7">
              <li className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-[#A78BFA]" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Location</p>
                  <p className="text-sm text-[#9DA3C6]">{settings?.address || "Dampella, Southern Province, Sri Lanka"}</p>
                </div>
              </li>
              <li className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4 text-[#A78BFA]" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Phone</p>
                  <p className="text-sm text-[#9DA3C6]">{settings?.phone || "+94 XX XXX XXXX"}</p>
                </div>
              </li>
              <li className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-[#A78BFA]" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Email</p>
                  <p className="text-sm text-[#9DA3C6]">{settings?.email || "info@dampellamv.lk"}</p>
                </div>
              </li>
            </ul>

            {/* Newsletter */}
            <div>
              <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Send className="h-3.5 w-3.5 text-[#A78BFA]" /> Newsletter
              </p>
              {subscribed ? (
                <p className="text-sm text-emerald-400 font-medium bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-4 py-3">
                  ✓ Subscribed! Welcome aboard.
                </p>
              ) : (
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (email.trim()) setSubscribed(true)
                  }}
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[#6b7199] focus:outline-none focus:ring-2 focus:ring-[#9333EA]/50 focus:border-transparent transition-all"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe"
                    className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-[#5B35D5] to-[#9333EA] flex items-center justify-center text-white hover:opacity-90 hover:shadow-lg hover:shadow-[#9333EA]/40 transition-all duration-300 active:scale-95"
                  >
                    <ArrowRight className="h-4.5 w-4.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-7 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-5">
          <p className="text-sm font-medium text-[#9DA3C6] text-center md:text-left">
            &copy; {new Date().getFullYear()} {settings?.name}. All rights reserved.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-sm font-semibold text-[#9DA3C6]">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-white/15" />
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>

          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-sm">
            <GraduationCap className="h-3.5 w-3.5 text-[#A78BFA]" />
            <span className="text-[#9DA3C6] text-[10px] uppercase tracking-widest font-medium">Project by</span>
            <span className="h-3 w-px bg-white/10" />
            <span className="text-white font-bold tracking-tight text-sm">
              Dilshan Methsara
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
