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

  // Status-based border color for the boxes
  const statusBoxClass =
    status === "found"
      ? "border-emerald-500/60 bg-emerald-500/5"
      : status === "not_found"
      ? "border-destructive/60 bg-destructive/5"
      : status === "loading"
      ? "border-primary/30 animate-pulse"
      : value.length > 0
      ? "border-primary/50 bg-primary/5"
      : ""

  return (
    <div
      className="flex gap-3 justify-center items-center py-2"
      onPaste={handlePaste}
    >
      {Array.from({ length }).map((_, i) => (
        <div key={i} className="relative group">
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
              "sleek-input w-12 h-14 text-center text-2xl font-bold transition-all duration-300",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "text-foreground placeholder:text-muted-foreground/30",
              "group-hover:border-primary/20",
              value[i] ? statusBoxClass : ""
            )}
            placeholder="•"
          />
          <div className={cn(
            "absolute -inset-0.5 rounded-xl blur opacity-0 transition-opacity duration-300 pointer-events-none",
            status === "found" ? "bg-emerald-500/20 group-focus-within:opacity-100" :
            status === "not_found" ? "bg-destructive/20 opacity-30" :
            "bg-primary/20 group-focus-within:opacity-100"
          )} />
        </div>
      ))}
      <input type="hidden" name="studentId" value={value} />
    </div>
  )
}
