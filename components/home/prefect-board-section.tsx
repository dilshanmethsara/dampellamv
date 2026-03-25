"use client"

import { motion } from "framer-motion"
import { SectionHeader } from "@/components/ui/section-header"
import { User, Shield, GraduationCap } from "lucide-react"
import { prefects } from "@/lib/data"
import Image from "next/image"

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } }
}

export function PrefectBoardSection() {
  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5 mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))" />

      <div className="container mx-auto px-4 relative z-10">
        <SectionHeader
          title="Prefect Board"
          subtitle="Meet the exemplary student leaders of our school"
        />

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {prefects.map((prefect) => {
            const isHead = prefect.role.toLowerCase().includes("head") && !prefect.role.toLowerCase().includes("deputy")
            
            return (
              <motion.div key={prefect.id} variants={item}>
                <div className={`group h-full glass-card rounded-[2.5rem] p-8 text-center flex flex-col items-center hover:shadow-2xl transition-all duration-500 overflow-hidden relative ${isHead ? 'border-primary/30 ring-1 ring-primary/20 bg-primary/5' : ''}`}>
                  
                  {/* Decorative background shape */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500" />
                  
                  {isHead && (
                    <div className="absolute top-4 left-4">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <GraduationCap className="h-4 w-4 text-amber-500" />
                      </div>
                    </div>
                  )}

                  <div className="mb-6 relative group-hover:-translate-y-2 transition-transform duration-500">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-[6px] border-background shadow-xl">
                      {prefect.image ? (
                        <Image 
                          src={prefect.image} 
                          alt={prefect.name} 
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                          <User className="h-12 w-12 text-primary/40" />
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute -bottom-2 right-2 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30">
                      <Shield className="h-4 w-4" />
                    </div>
                  </div>

                  <h3 className="font-bold text-xl mb-1 group-hover:text-primary transition-colors text-foreground">
                    {prefect.name}
                  </h3>
                  <p className="text-secondary font-semibold text-sm mb-4 tracking-wide uppercase">
                    {prefect.role}
                  </p>

                  {prefect.quote && (
                    <div className="mt-auto pt-6 border-t border-border/50 w-full">
                      <p className="text-muted-foreground text-sm italic line-clamp-2 text-pretty font-serif">
                        "{prefect.quote}"
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
