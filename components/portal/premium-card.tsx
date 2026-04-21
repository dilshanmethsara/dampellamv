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
        whileHover={{ y: -5, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "glass-card relative overflow-hidden rounded-[2rem] p-6 border border-white/10",
          glow && "after:absolute after:inset-0 after:bg-primary/5 after:blur-3xl after:-z-10",
          className
        )}
        {...props}
      >
        {/* Subtle Shimmer Overlay */}
        <div className="shimmer absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" />
        
        {children}
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
