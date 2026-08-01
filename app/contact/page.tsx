"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { FadeIn } from "@/components/ui/fade-in"
import { SectionHeader } from "@/components/ui/section-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from "lucide-react"
import { useSettings } from "@/lib/hooks/use-settings"
import { db } from "@/lib/firebase"
import { collection, addDoc } from "firebase/firestore"
import { toast } from "sonner"
import emailjs from "@emailjs/browser"

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
      content: "Monday - Friday: 7:30 AM - 3:30 PM",
      color: "bg-rose-500/10 text-rose-600",
    },
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    }

    try {
      await addDoc(collection(db, 'contact_messages'), {
        ...data,
        created_at: new Date().toISOString()
      })

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

      setIsSubmitted(true)
      toast.success("Message sent successfully! A confirmation email has been sent.")
    } catch (err: any) {
      console.error("Error submitting contact form:", err)
      setError("Failed to send message. Please try again later.")
      toast.error("Failed to send message")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="container mx-auto px-4">
            <FadeIn direction="up">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
                  Contact Us
                </h1>
                <p className="text-lg text-muted-foreground text-pretty">
                  Have a question or need information? We&apos;d love to hear from you. Reach out to us using any of the methods below.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {contactInfo.map((info, index) => (
                <FadeIn key={info.title} delay={index * 100} direction="up">
                  <Card className="h-full hover:shadow-lg transition-all duration-300 text-center">
                    <CardContent className="p-6">
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
          </div>
        </section>

        {/* Contact Form & Map */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <SectionHeader
              title="Send Us a Message"
              subtitle="Fill out the form below and we'll get back to you as soon as possible"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Contact Form */}
              <FadeIn direction="right">
                <Card>
                  <CardContent className="p-6">
                    {isSubmitted ? (
                      <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">Message Sent!</h3>
                        <p className="text-muted-foreground mb-4">
                          Thank you for contacting us. We&apos;ll respond to your inquiry soon.
                        </p>
                        <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                          Send Another Message
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit}>
                        <FieldGroup>
                          {error && (
                            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2 mb-4">
                              <AlertCircle className="h-4 w-4" />
                              {error}
                            </div>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field>
                              <FieldLabel htmlFor="name">Full Name</FieldLabel>
                              <Input id="name" name="name" placeholder="Your name" required />
                            </Field>
                            <Field>
                              <FieldLabel htmlFor="email">Email</FieldLabel>
                              <Input id="email" name="email" type="email" placeholder="your@email.com" required />
                            </Field>
                          </div>
                          
                          <Field>
                            <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                            <Input id="phone" name="phone" placeholder="+94 XX XXX XXXX" />
                          </Field>
                          
                          <Field>
                            <FieldLabel htmlFor="subject">Subject</FieldLabel>
                            <Input id="subject" name="subject" placeholder="How can we help?" required />
                          </Field>
                          
                          <Field>
                            <FieldLabel htmlFor="message">Message</FieldLabel>
                            <Textarea
                              id="message"
                              name="message"
                              placeholder="Tell us more about your inquiry..."
                              rows={5}
                              required
                            />
                          </Field>
                          
                          <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                            {isLoading ? (
                              <>Sending...</>
                            ) : (
                              <>
                                <Send className="h-4 w-4" />
                                Send Message
                              </>
                            )}
                          </Button>
                        </FieldGroup>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Map Placeholder */}
              <FadeIn direction="left" delay={100}>
                <Card className="h-full min-h-[400px] overflow-hidden border-primary/10 shadow-xl">
                  <CardContent className="p-0 h-full">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d743.0890524879925!2d80.50194759651778!3d6.046827263850894!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae1410b26f4b969%3A0xf6a05949edb8ab64!2sMR%20Dampalle%20Maha%20Vidyalaya!5e0!3m2!1sen!2slk!4v1774454713243!5m2!1sen!2slk" 
                      className="w-full h-full min-h-[400px] filter invert dark:invert-0 dark:hue-rotate-180 dark:contrast-75 transition-all duration-300 hover:filter-none"
                      style={{ border: 0 }} 
                      allowFullScreen={true} 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Additional Info */}
        <section className="py-12 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <FadeIn direction="up">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="font-serif text-2xl font-bold mb-4">Visit Our School</h2>
                <p className="text-primary-foreground/70 mb-6">
                  Parents and visitors are welcome to visit our school during office hours. 
                  Please contact the office in advance to schedule a visit or meeting.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10">
                  <Clock className="h-5 w-5" />
                  <span>Office Hours: Monday - Friday, 7:30 AM - 3:30 PM</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
