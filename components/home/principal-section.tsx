"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SectionHeader } from "@/components/ui/section-header"
import { Quote, ArrowRight, User } from "lucide-react"
import { useSettings } from "@/lib/hooks/use-settings"

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

export function PrincipalSection() {
  const { settings } = useSettings()
  
  // Get first paragraph for preview
  const previewMessage = settings?.principal_message?.split('\n\n')[0] || "Welcome to our school. We focus on character building, critical thinking, and preparing our students for the challenges of the modern world while staying rooted in our cultural values."

  return (
    <section className="py-16 bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <SectionHeader
          title="Principal's Message"
          subtitle="Words of wisdom and guidance from our school leader"
        />

        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="glass-card rounded-[2.5rem] p-8 md:p-14 relative"
          >
            {/* Large Decorative Quote */}
            <div className="absolute -top-6 -left-4 md:-top-16 md:-left-8 opacity-[0.03] rotate-12 pointer-events-none">
              <Quote className="h-40 w-40 md:h-52 md:w-52 text-foreground" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row gap-10 md:gap-16 items-center md:items-start">
              {/* Principal Avatar */}
              <motion.div 
                whileHover={{ scale: 1.05, rotate: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="shrink-0 relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-br from-primary to-secondary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md pointer-events-none" />
                <div className="relative w-28 h-28 md:w-40 md:h-40 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-background shadow-2xl flex items-center justify-center overflow-hidden">
                  <User className="h-14 w-14 md:h-20 md:w-20 text-slate-400 dark:text-slate-600" />
                </div>
              </motion.div>

              {/* Message Content */}
              <div className="flex-1 text-center md:text-left">
                <Quote className="h-8 w-8 text-primary/40 mb-6 mx-auto md:mx-0" />
                
                <p className="text-xl md:text-2xl text-foreground leading-relaxed font-serif italic mb-8 text-pretty">
                  "{previewMessage}"
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6 border-t border-border/50">
                  <div>
                    <h4 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {settings?.principal_name || "Mr. K. Perera"}
                    </h4>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">
                      Principal, {settings?.name || "MR/ Dampella M.V"}
                    </p>
                  </div>

                  <Link href="/about#principal-message">
                    <Button variant="outline" className="gap-2 group rounded-full border-primary/20 hover:bg-primary/5 hover:border-primary/50 transition-all">
                      Read Full Letter
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
