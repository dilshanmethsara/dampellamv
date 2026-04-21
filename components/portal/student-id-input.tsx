"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type IdStatus = "idle" | "loading" | "found" | "not_found"

interface StudentIdInputProps {
  value?: string
  onChange?: (value: string) => void
  length?: number
  disabled?: boolean
  status?: IdStatus
}

export function StudentIdInput({
  value = "",
  onChange,
  length = 4,
  disabled = false,
  status = "idle",
}: StudentIdInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.replace(/[^0-9]/g, "")
    if (!val) return

    const newValue = value.split("")
    newValue[index] = val.slice(-1)
    const joinedValue = newValue.join("").slice(0, length)
    onChange?.(joinedValue)

    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        const newValue = value.split("")
        newValue[index - 1] = ""
        onChange?.(newValue.join(""))
        inputRefs.current[index - 1]?.focus()
      } else {
        const newValue = value.split("")
        newValue[index] = ""
        onChange?.(newValue.join(""))
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").replace(/[^0-9]/g, "").slice(0, length)
    onChange?.(pastedData)
    const focusIndex = Math.min(pastedData.length, length - 1)
    inputRefs.current[focusIndex]?.focus()
  }

  // Status-based styles
  const getStatusClass = () => {
    switch (status) {
      case "found": return "bg-emerald-500/10 text-emerald-600 shadow-xl shadow-emerald-500/5"
      case "not_found": return "bg-red-500/10 text-red-600"
      case "loading": return "bg-primary/5 animate-pulse"
      default: return "bg-surface-container-high"
    }
  }

  return (
    <div
      className="flex gap-4 justify-between items-center py-2"
      onPaste={handlePaste}
    >
      {Array.from({ length }).map((_, i) => (
        <div key={i} className="relative group flex-1">
          <input
            ref={(el) => { inputRefs.current[i] = el }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={value[i] || ""}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            disabled={disabled}
            className={cn(
              "w-full h-20 rounded-2xl text-center text-3xl font-bold transition-all duration-300 border-none",
              "focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/10 focus:shadow-xl",
              "text-primary placeholder:text-muted-foreground/10",
              getStatusClass()
            )}
            placeholder="•"
          />
        </div>
      ))}
      <input type="hidden" name="studentId" value={value} />
    </div>
  )
}
