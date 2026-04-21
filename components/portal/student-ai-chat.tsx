"use client"

import { useState, useEffect, useRef } from "react"
import { MessageSquare, Send, X, Sparkles, Loader2, User, Bot, Stars, Orbit, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { PremiumCard, AnimatedContainer, childVariants } from "@/components/portal/premium-card"

interface Message {
  role: "user" | "ai"
  text: string
  timestamp: Date
}

export function StudentAIChat({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: `Hello ${user.fullName.split(" ")[0]}! I'm your Dampella LMS Assistant. How can I help you with your studies today?`,
      timestamp: new Date()
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on every new message or typing indicator change
  useEffect(() => {
    const el = bottomRef.current
    if (!el) return
    // Use a small timeout so the DOM has painted the new message first
    const timer = setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 60)
    return () => clearTimeout(timer)
  }, [messages, isTyping])

  // Also scroll to bottom immediately when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'end' })
      }, 350) // wait for open animation
    }
  }, [isOpen])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMessage: Message = {
      role: "user",
      text: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            text: m.text
          }))
        })
      })

      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error || "Failed to get response")

      const aiMessage: Message = {
        role: "ai",
        text: data.text,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (error: any) {
      console.error("Chat Error:", error)
      toast.error(error.message || "Something went wrong")
      
      const errorMessage: Message = {
        role: "ai",
        text: "I'm sorry, I'm having trouble connecting to the school servers right now. Please try again in a moment.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {!isOpen ? (
          <motion.div
            initial={{ scale: 0, rotate: -45, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 45, opacity: 0 }}
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-16 w-16 rounded-[2rem] shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] bg-primary text-white transition-all duration-500 group relative overflow-hidden border-2 border-white/20"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/30 group-hover:scale-150 transition-transform duration-700" />
              <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent animate-pulse" />
              <Sparkles className="h-7 w-7 relative z-10" />
              <span className="absolute top-2 right-2 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-200 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 50, scale: 0.9, filter: "blur(10px)" }}
            className="w-[calc(100vw-3rem)] sm:w-[420px] h-[75vh] sm:h-[600px] max-h-[85vh]"
          >
            <PremiumCard glow className="h-full flex flex-col shadow-2xl border-white/10 p-0 overflow-hidden bg-background/40 backdrop-blur-3xl">
              {/* Premium Header */}
              <div className="relative h-24 flex items-center justify-between px-6 overflow-hidden">
                <div className="absolute inset-0 bg-primary/10 -z-10" />
                <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-primary/20 blur-[60px] rounded-full animate-pulse" />
                <div className="flex items-center gap-5">
                  <div className="size-14 rounded-[1.25rem] bg-white dark:bg-slate-700 flex items-center justify-center shadow-lg group">
                    <Sparkles className="size-7 text-primary group-hover:rotate-12 transition-transform" />
                  </div>
                  <div>
                    <h3 className="font-black text-2xl tracking-tighter uppercase text-white leading-none">AI Archivist</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <div className="size-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                       <span className="text-[9px] font-black tracking-widest text-white/40 uppercase">Intelligence Protocol Active</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsOpen(false)}
                  className="rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Chat Content */}
              <div className="flex-1 p-6 overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(var(--primary-rgb),0.03)_0%,_transparent_70%)]" />
                {/* Native scroll container — required for reliable scrollIntoView */}
                <div
                  ref={scrollRef}
                  className="h-full overflow-y-auto pr-2 relative z-10 custom-scrollbar"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  <div className="space-y-6 pb-4">
                    <AnimatedContainer className="space-y-6">
                      {messages.map((msg, i) => (
                        <motion.div
                          key={i}
                          variants={childVariants}
                          className={cn(
                            "flex gap-4 max-w-[90%]",
                            msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                          )}
                        >
                          <div className={cn(
                            "size-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                            msg.role === "user" ? "bg-primary text-white" : "bg-white dark:bg-slate-700 text-primary"
                          )}>
                            {msg.role === "user" ? <User className="size-5" /> : <Bot className="size-5" />}
                          </div>
                          <div className={cn(
                            "p-5 rounded-[2rem] text-[13px] leading-relaxed shadow-aura",
                            msg.role === "user" 
                              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-tr-none" 
                              : "bg-surface-low dark:bg-slate-800/80 backdrop-blur-xl text-foreground rounded-tl-none font-medium"
                          )}>
                            {msg.text}
                          </div>
                        </motion.div>
                      ))}
                      {isTyping && (
                        <motion.div variants={childVariants} className="flex gap-4 mr-auto items-center">
                          <div className="size-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/5">
                            <Orbit className="size-4 text-primary animate-spin-slow" />
                          </div>
                          <div className="bg-background/40 backdrop-blur-lg border border-white/10 p-4 rounded-3xl rounded-tl-none flex gap-1.5 shadow-lg">
                            <span className="size-1.5 rounded-full bg-primary/40 animate-bounce" />
                            <span className="size-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0.2s]" />
                            <span className="size-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0.4s]" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatedContainer>
                    {/* Scroll sentinel — always at the very bottom */}
                    <div ref={bottomRef} className="h-0 w-full" aria-hidden="true" />
                  </div>
                </div>
              </div>

              {/* Input Nebula */}
              <div className="p-6 pt-0 mt-auto">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend() }}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-purple-500/50 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-500" />
                  <div className="relative flex items-center gap-3">
                    <Input
                      placeholder="Transmission request..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="h-14 rounded-[1.5rem] border-white/10 bg-background/60 backdrop-blur-2xl px-6 font-bold shadow-inner focus-visible:ring-primary/50"
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      disabled={!input.trim() || isTyping}
                      className="size-14 rounded-[1.5rem] bg-primary text-white shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      <Send className="size-5" />
                    </Button>
                  </div>
                </form>
              </div>
            </PremiumCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
