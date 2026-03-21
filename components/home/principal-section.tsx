"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/ui/fade-in"
import { SectionHeader } from "@/components/ui/section-header"
import { Quote, ArrowRight, User } from "lucide-react"
import { useSettings } from "@/lib/hooks/use-settings"

export function PrincipalSection() {
  const { settings } = useSettings()
  
  // Get first paragraph for preview
  const previewMessage = settings?.principal_message?.split('\n\n')[0] || "Welcome to our school..."

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="Principal's Message"
          subtitle="Words of wisdom and guidance from our school leader"
        />

        <div className="max-w-4xl mx-auto">
          <FadeIn direction="up">
            <div className="bg-card rounded-2xl border p-8 md:p-12 relative overflow-hidden">
              {/* Decorative Quote */}
              <div className="absolute top-4 left-4 opacity-10">
                <Quote className="h-24 w-24 text-primary" />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                {/* Principal Avatar */}
                <div className="shrink-0">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center">
                    <User className="h-12 w-12 md:h-16 md:w-16 text-primary" />
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1">
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6 text-pretty">
                    {previewMessage}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-foreground">{settings?.principal_name || "Mr. K. Perera"}</p>
                      <p className="text-sm text-muted-foreground">Principal, {settings?.name || "MR/ Dampella M.V"}</p>
                    </div>

                    <Link href="/about#principal-message">
                      <Button variant="outline" className="gap-2">
                        Read Full Message
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
