"use client"

import { AuthProvider } from "@/lib/portal/auth-context"
import { I18nProvider } from "@/lib/portal/i18n-context"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"

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
            <div className="portal-theme min-h-screen bg-background text-foreground transition-colors duration-300 font-sans">
              {children}
            </div>
            <Toaster position="top-center" richColors />
          </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}
