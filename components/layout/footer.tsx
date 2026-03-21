"use client"

import Link from "next/link"
import { GraduationCap, MapPin, Phone, Mail, Facebook, Youtube } from "lucide-react"
import { useSettings } from "@/lib/hooks/use-settings"

const quickLinks = [
  { href: "/about", label: "About Us" },
  { href: "/news", label: "News & Updates" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/academics", label: "Academics" },
  { href: "/clubs", label: "Clubs & Societies" },
  { href: "/contact", label: "Contact" },
  { href: "/portal", label: "Student Portal" },
]

const academicLinks = [
  { href: "/academics#grades", label: "Grades & Subjects" },
  { href: "/academics#exams", label: "Examinations" },
  { href: "/clubs", label: "Extra Curricular" },
  { href: "/gallery", label: "School Life" },
]

export function Footer() {
  const { settings } = useSettings()

  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* School Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg leading-tight">
                  {settings?.name || "MR/ Dampella M.V"}
                </span>
                <span className="text-xs text-background/70">
                  {settings?.address?.split(',').pop()?.trim() || "Southern Province"}
                </span>
              </div>
            </Link>
            <p className="text-sm text-background/70 leading-relaxed">
              {settings?.motto}
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="p-2 rounded-full bg-background/10 hover:bg-background/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-background/10 hover:bg-background/20 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Academic */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Academic</h3>
            <ul className="space-y-2">
              {academicLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5 text-background/70" />
                <span className="text-sm text-background/70">{settings?.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-background/70" />
                <span className="text-sm text-background/70">{settings?.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-background/70" />
                <span className="text-sm text-background/70">{settings?.email}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
              <div className="text-background/50 text-center md:text-left">
                <p>&copy; {new Date().getFullYear()} {settings?.name}. All rights reserved.</p>
                <p className="mt-1">Empowering students through quality education</p>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border backdrop-blur-sm shadow-sm">
                <span className="text-slate-500 text-xs uppercase tracking-widest font-bold">Project by</span>
                <span className="h-4 w-px bg-slate-200" />
                <span className="text-black font-bold tracking-tight">
                  Designed and developed by Dilshan Methsara
                </span>
              </div>
            </div>
        </div>
      </div>
    </footer>
  )
}
