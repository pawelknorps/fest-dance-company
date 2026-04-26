import { useRef } from 'react'
import { m, useScroll, useTransform, MotionValue } from 'framer-motion'

interface Props {
  isVisible: boolean
  scrubProgress: MotionValue<number>
}

/**
 * SOTA DOM Hero Fallback
 * Replaces Particle Hero with CSS-optimized visuals and ambient animations.
 */
export function DOMHero({ isVisible, scrubProgress }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Subtle drift for the background
  const y = useTransform(scrubProgress, [0, 1], ['0%', '12%'])
  const scale = useTransform(scrubProgress, [0, 1], [1, 1.15])
  const opacity = useTransform(scrubProgress, [0, 0.4], [1, 0.3])

  return (
    <m.div 
      ref={containerRef}
      style={{ y, scale, opacity }}
      className="absolute inset-0 z-0 overflow-hidden bg-[#060609]"
    >
      {/* SOTA Ambient Light Layer (Low Tier Fallback) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(184,92,255,0.12),transparent_45%),radial-gradient(circle_at_20%_60%,rgba(96,152,255,0.08),transparent_40%)]" />
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden particle-field" />

      <div className="absolute inset-0 mix-blend-screen opacity-30">
          <div className="h-full w-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_65%)]" />
      </div>

      {/* SOTA Grain Mask */}
      <div className="noise-mask absolute inset-0 opacity-15" />
    </m.div>
  )
}
