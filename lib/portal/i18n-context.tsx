"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { translations, Language } from "./translations"

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("portal-language") as Language
    if (saved && (saved === "en" || saved === "si")) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("portal-language", lang)
  }

  const t = (key: string) => {
    const keys = key.split('.')
    let current: any = translations[language]
    for (const k of keys) {
      if (current === undefined || current[k] === undefined) return key
      current = current[k]
    }
    return current as string
  }

  if (!mounted) {
    return <div className="min-h-screen bg-background" /> // Prevent hydration mismatch
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
