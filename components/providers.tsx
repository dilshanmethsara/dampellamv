"use client"

import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange={false}
      storageKey="site-theme"
    >
      {children}
      <Toaster position="top-right" richColors />
    </ThemeProvider>
  )
}
