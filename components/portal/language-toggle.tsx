"use client"

import * as React from "react"
import { Languages } from "lucide-react"
import { useI18n } from "@/lib/portal/i18n-context"
import { Button } from "@/components/ui/button"

export function LanguageToggle() {
  const { language, setLanguage } = useI18n()

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "si" : "en")
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 shrink-0 font-medium"
      onClick={toggleLanguage}
    >
      <Languages className="size-4" />
      {language === "en" ? "සිංහල" : "English"}
    </Button>
  )
}
