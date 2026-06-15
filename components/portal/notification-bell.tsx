"use client"

import { useState, useEffect } from "react"
import { Bell, MessageSquare, FileText, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, orderBy, limit, onSnapshot, doc, updateDoc } from "firebase/firestore"
import type { User } from "@/lib/portal/auth-context"

export function NotificationBell({ user }: { user: User }) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const loadNotifications = async () => {
    try {
      const notificationsRef = collection(db, 'notifications')
      const q = query(
        notificationsRef, 
        where('user_email', '==', user.email.toLowerCase()),
        limit(50)
      )
      
      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[]
      
      // Sort in-memory to avoid needing a composite index in Firestore
      data.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime()
        const dateB = new Date(b.created_at || 0).getTime()
        return dateB - dateA
      })
      
      setNotifications(data)
      setUnreadCount(data.filter((n: any) => !n.is_read).length)
    } catch (err) {
      console.error("Error loading notifications:", err)
    }
  }

  useEffect(() => {
    loadNotifications()
    const notificationsRef = collection(db, 'notifications')
    const q = query(
      notificationsRef, 
      where('user_email', '==', user.email.toLowerCase())
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[]
      
      // Sort in-memory
      data.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime()
        const dateB = new Date(b.created_at || 0).getTime()
        return dateB - dateA
      })

      setNotifications(data)
      setUnreadCount(data.filter((n: any) => !n.is_read).length)
    }, (error) => {
      if (error.code === 'permission-denied') {
        process.env.NODE_ENV === 'development' && console.warn("Notifications permission denied. Check Firestore rules.")
      } else {
        console.error("Firestore Notification Listener Error:", error)
      }
    })

    return () => unsubscribe()
  }, [user.email])

  const markAllAsRead = async () => {
    if (unreadCount === 0) return
    const unreadNotifications = notifications.filter(n => !n.is_read)
    
    for (const n of unreadNotifications) {
      const docRef = doc(db, 'notifications', n.id)
      await updateDoc(docRef, { is_read: true })
    }

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && unreadCount > 0) markAllAsRead()
  }

  const iconForType = (type: string) => {
    if (type === 'message') return <MessageSquare className="size-4" />
    if (type === 'announcement') return <Bell className="size-4" />
    if (type === 'assignment') return <FileText className="size-4" />
    if (type === 'quiz') return <GraduationCap className="size-4" />
    return <Bell className="size-4" />
  }

  const colorForType = (type: string) => {
    if (type === 'message') return "text-blue-500"
    if (type === 'announcement') return "text-amber-500"
    if (type === 'assignment') return "text-emerald-500"
    if (type === 'quiz') return "text-indigo-500"
    return "text-muted-foreground"
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground transition-colors"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <Badge
              className={cn(
                "absolute -top-1 -right-1 min-w-[1.25rem] h-5 flex items-center justify-center p-0.5",
                "text-[8px] font-black bg-indigo-600 text-white border-2 border-background rounded-full",
                "animate-in zoom-in duration-300"
              )}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[340px] sm:w-96 p-0 rounded-[1.5rem] shadow-2xl border border-border overflow-hidden bg-white dark:bg-zinc-900"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-indigo-600" />
            <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-900 dark:text-white">
              Notifications
            </h4>
            {unreadCount > 0 && (
              <Badge className="bg-indigo-600 text-white text-[8px] font-black px-2 h-4 rounded-full">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[9px] uppercase font-black tracking-widest text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 px-2"
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* Notification list */}
        <ScrollArea className="h-[380px]">
          {notifications.length === 0 ? (
            <div className="p-12 text-center space-y-4 flex flex-col items-center">
              <div className="size-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center opacity-40 shadow-inner">
                <Bell className="size-7 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  All clear
                </p>
                <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest mt-1">
                  No new notifications
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "p-4 transition-all hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 cursor-pointer relative group/item",
                    !n.is_read && "bg-indigo-50/30 dark:bg-indigo-500/5"
                  )}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className={cn(
                      "size-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-white dark:bg-zinc-700 transition-transform group-hover/item:scale-110",
                      colorForType(n.type)
                    )}>
                      {iconForType(n.type)}
                    </div>

                    {/* Content */}
                    <div className="space-y-0.5 overflow-hidden flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-900 dark:text-white truncate group-hover/item:text-indigo-600 transition-colors">
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                        {n.content}
                      </p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mt-2 flex items-center gap-1.5">
                        <span className="size-1 rounded-full bg-indigo-500 inline-block" />
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <span className="opacity-50">·</span>
                        {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {!n.is_read && (
                      <div className="size-2 rounded-full bg-indigo-600 shrink-0 mt-2 shadow-sm shadow-indigo-600/50" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border flex items-center gap-2">
          <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
            Real-time · Dampella LMS
          </span>
        </div>
      </PopoverContent>
    </Popover>
  )
}
