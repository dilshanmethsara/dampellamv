"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Maximize2, RotateCcw, Info, X, Zap, Activity, Microscope, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface VirtualLabViewerProps {
  modelId?: string // This will be the Sketchfab UID
  title: string
  description?: string
  subject?: string
}

export function VirtualLabViewer({ modelId, title, description, subject }: VirtualLabViewerProps) {
  const [fullscreen, setFullscreen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Sketchfab Embed URL with optimized parameters
  // Parameters: autostart, ui_infos=0 (hide title), ui_watermark=0 (hide watermark), etc.
  const embedUrl = modelId 
    ? `https://sketchfab.com/models/${modelId}/embed?autostart=1&internal=1&tracking=0&ui_ar=0&ui_infos=0&ui_pane_close=1&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=1&ui_watermark=0`
    : null

  return (
    <div className={cn(
      "relative rounded-[2.5rem] overflow-hidden bg-surface-low dark:bg-slate-900 shadow-aura transition-all duration-700 border-none",
      fullscreen ? "fixed inset-8 z-[100] m-0" : "aspect-video w-full shadow-2xl"
    )}>
      {/* 3D Embed Scene */}
      <div className="absolute inset-0 z-0 bg-surface dark:bg-slate-900">
        {embedUrl ? (
          <>
            <AnimatePresence>
              {loading && (
                <motion.div 
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-surface dark:bg-slate-900"
                >
                  <div className="relative">
                    <div className="absolute inset-0 blur-2xl bg-primary/20 animate-pulse" />
                    <Loader2 className="size-12 animate-spin text-primary relative z-10" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 mt-6 animate-pulse">
                    Initializing Reality Engine...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <iframe
              title={title}
              src={embedUrl}
              className="size-full border-none"
              allow="autoplay; fullscreen; xr-spatial-tracking"
              onLoad={() => setLoading(false)}
            />
          </>
        ) : (
          <div className="size-full flex flex-col items-center justify-center p-8 text-center bg-surface-low dark:bg-slate-900">
            <div className="size-24 rounded-[2rem] bg-white dark:bg-slate-800 flex items-center justify-center mb-6 shadow-sm">
                <Microscope className="size-10 text-primary/40" />
            </div>
            <h3 className="text-3xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white mb-2 leading-none">Discovery Pending</h3>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 max-w-xs leading-relaxed">
              Select a lab module from the library to initiate the 3D exploration.
            </p>
          </div>
        )}
      </div>

      {/* UI Overlay: Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-8 flex items-start justify-between z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <Badge className="mb-3 bg-primary text-white border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/20">
            {subject || "Virtual Lab"}
          </Badge>
          <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white drop-shadow-md uppercase leading-[0.9]">{title}</h2>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 max-w-sm leading-relaxed mt-2">
            {description || "Interact with the 3D model below to explore science in depth."}
          </p>
        </div>
        
        <div className="flex gap-4 pointer-events-auto">
          <Button 
            size="icon" 
            className="rounded-[1.25rem] size-14 bg-white/40 dark:bg-black/40 backdrop-blur-3xl border-none shadow-aura hover:scale-110 active:scale-95 transition-all text-foreground"
            onClick={() => setFullscreen(!fullscreen)}
          >
            {fullscreen ? <X size={20} /> : <Maximize2 size={20} />}
          </Button>
          {modelId && (
            <Button 
              size="icon" 
              className="rounded-[1.25rem] size-14 bg-white/40 dark:bg-black/40 backdrop-blur-3xl border-none shadow-aura hover:scale-110 active:scale-95 transition-all text-foreground"
              asChild
            >
              <a href={`https://sketchfab.com/models/${modelId}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={20} />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Aesthetic Accents */}
      <div className="absolute bottom-8 left-8 z-10 pointer-events-none hidden sm:block">
        <div className="flex items-center gap-4 px-6 py-3 rounded-[1.25rem] bg-black/40 backdrop-blur-3xl border border-white/10 shadow-aura">
          <Activity className="size-4 text-emerald-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Professional Discovery Engine</span>
        </div>
      </div>
    </div>
  )
}
