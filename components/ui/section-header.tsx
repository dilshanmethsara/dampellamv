import { cn } from "@/lib/utils"
import { FadeIn } from "./fade-in"

interface SectionHeaderProps {
  title: string
  subtitle?: string
  className?: string
  centered?: boolean
}

export function SectionHeader({
  title,
  subtitle,
  className,
  centered = true,
}: SectionHeaderProps) {
  return (
    <FadeIn className={cn("mb-12", centered && "text-center", className)}>
      <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
          {subtitle}
        </p>
      )}
      <div className={cn("mt-4 flex gap-2", centered ? "justify-center" : "justify-start")}>
        <div className="h-1 w-12 rounded-full bg-primary" />
        <div className="h-1 w-6 rounded-full bg-secondary" />
        <div className="h-1 w-3 rounded-full bg-accent" />
      </div>
    </FadeIn>
  )
}
