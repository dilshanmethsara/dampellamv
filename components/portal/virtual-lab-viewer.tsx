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
      "relative rounded-[2.5rem] overflow-hidden bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 shadow-aura transition-all duration-700",
      fullscreen ? "fixed inset-4 z-[100] m-0" : "aspect-video w-full"
    )}>
      {/* 3D Embed Scene */}
      <div className="absolute inset-0 z-0 bg-zinc-100 dark:bg-zinc-900">
        {embedUrl ? (
          <>
            <AnimatePresence>
              {loading && (
                <motion.div 
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950"
                >
                  <Loader2 className="size-10 animate-spin text-indigo-600 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
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
          <div className="size-full flex flex-col items-center justify-center p-8 text-center">
            <Microscope className="size-16 text-indigo-600/20 mb-6" />
            <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white mb-2">Discovery Pending</h3>
            <p className="text-xs text-muted-foreground max-w-xs font-medium leading-relaxed">
              Select a lab module from the library to initiate the 3D exploration.
            </p>
          </div>
        )}
      </div>

      {/* UI Overlay: Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-start justify-between z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <Badge className="mb-2 bg-indigo-600 text-white border-none px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20">
            {subject || "Virtual Lab"}
          </Badge>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white drop-shadow-md">{title}</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 max-w-xs leading-relaxed mt-1">
            {description || "Interact with the 3D model below to explore science in depth."}
          </p>
        </div>
        
        <div className="flex gap-2 pointer-events-auto">
          <Button 
            size="icon" 
            variant="secondary" 
            className="rounded-full size-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-100 dark:border-zinc-800 shadow-sm hover:scale-110 transition-all"
            onClick={() => setFullscreen(!fullscreen)}
          >
            {fullscreen ? <X size={16} /> : <Maximize2 size={16} />}
          </Button>
          {modelId && (
            <Button 
              size="icon" 
              variant="secondary" 
              className="rounded-full size-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-100 dark:border-zinc-800 shadow-sm hover:scale-110 transition-all"
              asChild
            >
              <a href={`https://sketchfab.com/models/${modelId}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} className="text-zinc-600 dark:text-zinc-400" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Aesthetic Accents */}
      <div className="absolute bottom-6 left-6 z-10 pointer-events-none hidden sm:block">
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10">
          <Activity className="size-3 text-emerald-500 animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white opacity-60">Professional 3D Discovery Engine</span>
        </div>
      </div>
    </div>
  )
}
