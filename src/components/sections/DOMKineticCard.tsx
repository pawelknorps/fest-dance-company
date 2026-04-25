import { useRef, useState } from 'react'
import { motion, useTransform, useSpring, useVelocity, MotionValue, useMotionValueEvent } from 'framer-motion'
import { useTranslation } from '../../lib/i18n'

interface Props {
  item: any
  index: number
  count: number
  progress: MotionValue<number>
}

/**
 * SOTA DOM Kinetic Card (Z-Depth Architecture)
 * Ultra-light SVG Liquid Distortion fallback for high-fidelity mobile.
 */
export function DOMKineticCard({ item, index, count, progress }: Props) {
  const t = useTranslation()
  const cardRef = useRef<HTMLDivElement>(null)
  const [isRendered, setIsRendered] = useState(false)

  // Map scroll progress
  const relativeProgress = useTransform(progress, (p) => {
    const scrollPos = p * (count - 1)
    return index - scrollPos
  })

  // Initialize visibility on mount
  const [isRendered, setIsRendered] = useState(() => Math.abs(relativeProgress.get()) < 2)

  const velocity = useVelocity(progress)
  const smoothVelocity = useSpring(velocity, { stiffness: 60, damping: 20 })
  
  // SOTA 2026: Liquid Distortion via SVG Filter Displacement
  const distortionScale = useTransform(smoothVelocity, [-0.1, 0, 0.1], [25, 0, 25])

  const z = useTransform(relativeProgress, 
    [-2, -1, 0, 1, 2], 
    [-2000, -1000, 0, 400, 800]
  )
  
  const opacity = useTransform(relativeProgress,
    [-1.2, -0.8, 0, 0.4, 0.8],
    [0, 0.9, 1, 0.4, 0]
  )

  const scale = useTransform(relativeProgress,
    [-1, 0, 1],
    [0.85, 1, 1.15]
  )

  const rotateY = useTransform(smoothVelocity, [-0.1, 0, 0.1], [-15, 0, 15])
  const skewX = useTransform(smoothVelocity, [-0.1, 0, 0.1], [-5, 0, 5])

  useMotionValueEvent(relativeProgress, "change", (val) => {
    const visible = Math.abs(val) < 2
    if (visible !== isRendered) setIsRendered(visible)
  })

  const imageSrc = item.image.srcMobile || item.image.src

  return (
    <motion.div
      ref={cardRef}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{
        z,
        opacity,
        scale,
        rotateY,
        skewX,
        display: isRendered ? 'flex' : 'none',
        transformStyle: 'preserve-3d',
        willChange: 'transform, opacity',
      }}
    >
      {/* Inline SVG Filter removed */}

      <div className="relative pointer-events-auto overflow-hidden rounded-xl bg-[#0a0a0f] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1),_0_0_20px_rgba(0,0,0,0.3)]">
        <div 
          className="relative aspect-[3/4] w-[82vw] max-w-[450px] overflow-hidden" 
          style={{ 
            transformStyle: 'preserve-3d'
          }}
        >
          {isRendered && (
            <motion.img
              src={imageSrc}
              alt={item.title}
              decoding="async"
              className="h-full w-full object-cover"
              style={{
                translateZ: '-1px',
                scale: 1.1
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
            />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent" />
          
          <motion.div 
            className="absolute bottom-10 left-8 right-8"
            style={{ translateZ: '40px' }}
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-fuchsia-500/90 mb-1">
              {item.category}
            </p>
            <h3 className="font-display text-3xl uppercase leading-none tracking-tight text-white">
              {item.title}
            </h3>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
