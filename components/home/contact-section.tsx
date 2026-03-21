"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FadeIn } from "@/components/ui/fade-in"
import { SectionHeader } from "@/components/ui/section-header"
import { MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react"
import { useSettings } from "@/lib/hooks/use-settings"

export function ContactSection() {
  const { settings } = useSettings()

  const contactInfo = [
    {
      icon: MapPin,
      title: "Address",
      content: settings?.address || "Dampella, Southern Province, Sri Lanka",
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      icon: Phone,
      title: "Phone",
      content: settings?.phone || "+94 XX XXX XXXX",
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      icon: Mail,
      title: "Email",
      content: settings?.email || "info@dampellamv.lk",
      color: "bg-amber-500/10 text-amber-600",
    },
    {
      icon: Clock,
      title: "Office Hours",
      content: "Mon - Fri: 7:30 AM - 3:30 PM",
      color: "bg-rose-500/10 text-rose-600",
    },
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="Get in Touch"
          subtitle="We'd love to hear from you. Reach out to us for any inquiries."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contactInfo.map((info, index) => (
              <FadeIn key={info.title} delay={index * 100} direction="up">
                <Card className="h-full hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-5">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${info.color}`}>
                      <info.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{info.title}</h3>
                    <p className="text-muted-foreground text-sm">{info.content}</p>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>

          {/* Map Placeholder */}
          <FadeIn direction="left" delay={200}>
            <Card className="h-full min-h-[300px] overflow-hidden">
              <CardContent className="p-0 h-full">
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <div className="text-center p-8">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">Our Location</h3>
                    <p className="text-muted-foreground text-sm mb-4">{settings?.address}</p>
                    <Link href="/contact">
                      <Button className="gap-2">
                        View on Map
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        <FadeIn direction="up" delay={400}>
          <div className="text-center mt-10">
            <Link href="/contact">
              <Button size="lg" className="gap-2">
                Contact Us
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
