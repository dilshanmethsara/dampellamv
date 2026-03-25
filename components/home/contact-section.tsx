"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SectionHeader } from "@/components/ui/section-header"
import { useSettings } from "@/lib/hooks/use-settings"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"
import emailjs from "@emailjs/browser"

export function ContactSection() {
  const { settings } = useSettings()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.from("contact_messages").insert([data])

      if (error) throw error

      // Send confirmation email via EmailJS
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          to_name: data.name,
          to_email: data.email,
          subject: data.subject,
          message: data.message,
          reply_to: data.email,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      )

      setIsSuccess(true)
      toast.success("Message sent successfully! A confirmation email has been sent.")
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-24 bg-background relative" id="contact">
      <div className="container mx-auto px-4 relative z-10">
        <SectionHeader
          title="Get In Touch"
          subtitle="We'd love to hear from you. Reach out with any questions or inquiries."
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
          {/* Contact Info (takes up 2 columns) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="glass-card rounded-3xl p-8 h-full bg-primary/5 border-primary/10">
              <h3 className="text-2xl font-bold mb-6 text-foreground">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <MapPin className="h-5 w-5 text-primary group-hover:text-current" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Our Location</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{settings?.address || "Dampella, Southern Province, Sri Lanka"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Phone className="h-5 w-5 text-primary group-hover:text-current" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Phone Number</h4>
                    <p className="text-muted-foreground text-sm">{settings?.phone || "+94 XX XXX XXXX"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Mail className="h-5 w-5 text-primary group-hover:text-current" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Email Address</h4>
                    <p className="text-muted-foreground text-sm">{settings?.email || "info@dampellamv.lk"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Clock className="h-5 w-5 text-primary group-hover:text-current" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Office Hours</h4>
                    <p className="text-muted-foreground text-sm">Mon - Fri: 7:30 AM - 1:30 PM<br/>Sat - Sun: Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact form (takes up 3 columns) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-8 md:p-10 shadow-xl space-y-6 relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[80px] -z-10 pointer-events-none" />
              
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-bounce">
                    <CheckCircle className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Message Sent!</h3>
                  <p className="text-muted-foreground max-w-xs">
                    Thank you for reaching out. Our team will review your message and get back to you shortly.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsSuccess(false)}
                    className="mt-4 rounded-xl px-8"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mb-2 text-foreground">Send us a Message</h3>
                  <p className="text-muted-foreground text-sm mb-6">Fill out the form below and our administrative team will get back to you as soon as possible.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</label>
                      <Input id="name" name="name" placeholder="John Doe" required className="bg-background/50 border-white/10 focus-visible:ring-primary/50 h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</label>
                      <Input id="email" name="email" type="email" placeholder="john@example.com" required className="bg-background/50 border-white/10 focus-visible:ring-primary/50 h-12 rounded-xl" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-foreground">Subject</label>
                    <Input id="subject" name="subject" placeholder="How can we help?" required className="bg-background/50 border-white/10 focus-visible:ring-primary/50 h-12 rounded-xl" />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-foreground">Message</label>
                    <Textarea id="message" name="message" placeholder="Write your message here..." required className="bg-background/50 border-white/10 focus-visible:ring-primary/50 min-h-[150px] rounded-xl resize-none" />
                  </div>
                  
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isSubmitting}
                    className="w-full sm:w-auto h-12 px-8 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </>
              )}
            </form>
          </motion.div>
        </div>

        {/* Full-width Map Area */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto mt-12 glass-card rounded-3xl p-3 h-[400px] w-full bg-primary/5 border-primary/10 shadow-xl overflow-hidden relative group"
        >
          <div className="absolute inset-0 bg-primary/5 pointer-events-none z-10 rounded-3xl transition-opacity group-hover:opacity-0" />
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d743.0890524879925!2d80.50194759651778!3d6.046827263850894!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae1410b26f4b969%3A0xf6a05949edb8ab64!2sMR%20Dampalle%20Maha%20Vidyalaya!5e0!3m2!1sen!2slk!4v1774454713243!5m2!1sen!2slk" 
            className="w-full h-full rounded-[1.5rem] filter invert dark:invert-0 dark:hue-rotate-180 dark:contrast-75 transition-all duration-500 hover:filter-none"
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>
      </div>
    </section>
  )
}
