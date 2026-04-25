import { useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'

interface Props {
  isVisible: boolean
  scrubProgress: MotionValue<number>
}

/**
 * SOTA DOM Hero Fallback
 * Replaces Particle Hero with CSS-optimized visuals or video loops.
 */
export function DOMHero({ isVisible, scrubProgress }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Subtle drift for the background
  const y = useTransform(scrubProgress, [0, 1], ['0%', '10%'])
  const scale = useTransform(scrubProgress, [0, 1], [1, 1.1])

  useEffect(() => {
    if (!videoRef.current) return
    if (isVisible) {
      videoRef.current.play().catch(() => {})
    } else {
      videoRef.current.pause()
    }
  }, [isVisible])

  return (
    <motion.div 
      style={{ y, scale }}
      className="absolute inset-0 z-0 overflow-hidden"
    >
      {/* SOTA Ambient Light Layer (Low Tier Fallback) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(184,92,255,0.15),transparent_40%),radial-gradient(circle_at_20%_60%,rgba(96,152,255,0.12),transparent_40%)]" />
      
      {/* 
        PRE-RENDERED ILLUSION: 
        In production, replace this div with a high-performance H.265/WebM loop 
        that matches the WebGL particle behavior.
      */}
      <div className="absolute inset-0 mix-blend-screen opacity-40">
         {/* Placeholder for Particle Video */}
         <div className="h-full w-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)] animate-pulse" />
      </div>

      {/* SOTA Grain Mask */}
      <div className="noise-mask absolute inset-0 opacity-20" />
    </motion.div>
  )
}
