"use client"

import { AuthProvider } from "@/lib/portal/auth-context"
import { I18nProvider } from "@/lib/portal/i18n-context"
import { ThemeProvider } from "next-themes"

import { motion, AnimatePresence } from "framer-motion"
import "./portal.css"

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <I18nProvider>
          <AuthProvider>
            <div className="portal-theme min-h-screen bg-background text-foreground transition-colors duration-300 font-sans fluid-bg overflow-hidden flex flex-col">
              <AnimatePresence mode="wait">
                <motion.main
                  key="portal-main-transition"
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.02, y: -10 }}
                  transition={{ 
                    duration: 0.2, 
                    ease: "easeInOut"
                  }}
                  className="min-h-screen w-full flex-1"
                >
                  {children}
                </motion.main>
              </AnimatePresence>
            </div>
          </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}
