"use client"

import * as React from "react"
import { motion, HTMLMotionProps, Variants } from "framer-motion"
import { cn } from "@/lib/utils"

interface PremiumCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  className?: string
  glow?: boolean
}

export const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ children, className, glow = false, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{ y: -1 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={cn(
          "sleek-card relative overflow-hidden p-8",
          glow && "after:absolute after:inset-0 after:bg-primary/5 after:blur-3xl after:-z-10",
          className
        )}
        {...props}
      >
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    )
  }
)

PremiumCard.displayName = "PremiumCard"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const AnimatedContainer = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <motion.div
    initial="hidden"
    animate="show"
    variants={containerVariants}
    className={className}
  >
    {children}
  </motion.div>
)

export const childVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
}
