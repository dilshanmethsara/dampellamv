"use client"

import { useState, useEffect, useRef } from "react"
import { MessageSquare, Send, X, Sparkles, Loader2, User, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

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

  useEffect(() => {
    // Small timeout to ensure the DOM has updated with the new message
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [messages, isTyping])

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
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] font-sans flex flex-col items-end">
      {/* FAB */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 transition-all duration-300 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/20 group-hover:scale-150 transition-transform duration-700" />
          <Sparkles className="h-6 w-6 text-white animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
          </span>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="w-[calc(100vw-2rem)] sm:w-[400px] h-[70vh] sm:h-[500px] max-h-[80vh] flex flex-col shadow-2xl border-none glass-card animate-in slide-in-from-bottom-5 duration-300 overflow-hidden">
          <CardHeader className="bg-primary p-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-lg">AI Assistant</CardTitle>
                <p className="text-white/70 text-xs flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Always helpful
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 p-4 overflow-hidden">
            <ScrollArea className="h-full pr-4" viewportRef={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-3 max-w-[85%]",
                      msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                      msg.role === "user" ? "bg-primary/10 text-primary" : "bg-muted"
                    )}>
                      {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={cn(
                      "p-3 rounded-2xl text-sm shadow-sm",
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-background border rounded-tl-none"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3 mr-auto items-center">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-background border p-3 rounded-2xl rounded-tl-none flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 animate-bounce" />
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-4 pt-0 border-t bg-background/50 backdrop-blur-sm">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend() }}
              className="flex w-full items-center gap-2 mt-4"
            >
              <Input
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="h-11 rounded-xl glass-card border-none bg-muted/30 focus-visible:ring-primary"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!input.trim() || isTyping}
                className="h-11 w-11 rounded-xl shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
