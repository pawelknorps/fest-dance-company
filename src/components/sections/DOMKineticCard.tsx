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
 * Uses CSS 3D Transforms and GPU-accelerated compositor thread.
 */
export function DOMKineticCard({ item, index, count, progress }: Props) {
  const t = useTranslation()
  const cardRef = useRef<HTMLDivElement>(null)
  const [isRendered, setIsRendered] = useState(false)

  // Map scroll progress to relative offset (-1 to 1 range is the active window)
  const relativeProgress = useTransform(progress, (p) => {
    const scrollPos = p * (count - 1)
    return index - scrollPos
  })

  // Velocity tracking for kinetic distortion
  const velocity = useVelocity(progress)
  const smoothVelocity = useSpring(velocity, { stiffness: 60, damping: 20 })
  const skewY = useTransform(smoothVelocity, [-0.1, 0, 0.1], [-5, 0, 5])
  const rotateX = useTransform(smoothVelocity, [-0.1, 0, 0.1], [10, 0, -10])

  // Z-Depth Mapping
  // translateZ: -2000px (far) -> 0px (active) -> 1000px (past)
  const z = useTransform(relativeProgress, 
    [-2, -1, 0, 1, 2], 
    [-2000, -1000, 0, 500, 1000]
  )
  
  const opacity = useTransform(relativeProgress,
    [-1.5, -1, 0, 0.5, 1],
    [0, 0.8, 1, 0.3, 0]
  )

  const scale = useTransform(relativeProgress,
    [-1, 0, 1],
    [0.8, 1, 1.2]
  )

  // Render Culling: only mount image when potentially visible
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
        skewY,
        rotateX,
        display: isRendered ? 'flex' : 'none',
        transformStyle: 'preserve-3d',
        willChange: 'transform, opacity',
      }}
    >
      <div className="relative pointer-events-auto overflow-hidden rounded-xl bg-[#0a0a0f] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
        <div className="relative aspect-[3/4] w-[80vw] max-w-[450px] overflow-hidden" style={{ transformStyle: 'preserve-3d' }}>
          {isRendered && (
            <motion.img
              src={imageSrc}
              alt={item.title}
              className="h-full w-full object-cover"
              style={{
                translateZ: '-20px', // Slight parallax push back
                scale: 1.1
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
            />
          )}
          
          {/* Parallax Content Layers */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          
          <motion.div 
            className="absolute bottom-10 left-10 right-10"
            style={{ translateZ: '50px' }} // Floating above image
          >
            <motion.p 
              className="text-[10px] font-bold uppercase tracking-[0.5em] text-fuchsia-500/80"
              style={{ translateZ: '20px' }}
            >
              {item.category}
            </motion.p>
            <h3 className="mt-2 font-display text-4xl uppercase leading-none tracking-tight text-white md:text-5xl">
              {item.title}
            </h3>
            
            <div className="mt-6 flex items-center gap-4">
              <div className="h-px w-8 bg-white/20" />
              <p className="text-[9px] uppercase tracking-[0.3em] text-white/40">
                {item.client}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
