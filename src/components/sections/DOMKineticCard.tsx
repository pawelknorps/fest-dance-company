import { useRef, useState } from 'react'
import { m, useTransform, MotionValue, useMotionValueEvent } from 'framer-motion'
import { useTranslation } from '../../lib/i18n'

interface Props {
  item: any
  index: number
  count: number
  progress: MotionValue<number>
}

/**
 * SOTA DOM Kinetic Card (Z-Depth Architecture)
 * Ultra-light fallback for high-fidelity mobile.
 */
export function DOMKineticCard({ item, index, count, progress }: Props) {
  const t = useTranslation()
  const cardRef = useRef<HTMLDivElement>(null)
  
  // Map scroll progress
  const relativeProgress = useTransform(progress, (p) => {
    const scrollPos = p * (count - 1)
    return index - scrollPos
  })

  // Initialize visibility on mount
  const [isRendered, setIsRendered] = useState(() => Math.abs(relativeProgress.get()) < 10)
  
  useMotionValueEvent(relativeProgress, "change", (val) => {
    const visible = Math.abs(val) < 10
    if (visible !== isRendered) setIsRendered(visible)
  })

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

  const imageSrc = item.image.srcMobile || item.image.src

  return (
    <m.div
      ref={cardRef}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{
        z,
        opacity,
        scale,
        display: isRendered ? 'flex' : 'none',
        transformStyle: 'preserve-3d',
        willChange: 'transform, opacity',
      }}
    >
      <div className="relative">
        {/* Advanced SOTA Glow Effect */}
        <div 
          className="absolute -inset-6 blur-2xl opacity-40 rounded-3xl"
          style={{ 
            backgroundImage: `url(${imageSrc})`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(30px)'
          }}
        />
        
        <div className="relative pointer-events-auto overflow-hidden rounded-2xl bg-[#0a0a0f] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all duration-700 hover:border-white/20">
        <div 
          className="relative aspect-[3/4] w-[92vw] max-w-[600px] overflow-hidden" 
          style={{ 
            transformStyle: 'preserve-3d'
          }}
        >

          <m.img
            src={imageSrc}
            alt={item.title}
            width={item.image.width}
            height={item.image.height}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-1000 ease-out"
            style={{
              translateZ: '0',
            }}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = item.image.src;
            }}
          />
          
          {/* Category Label: Right Aligned */}
          <div className="absolute top-4 right-4 z-10">
            <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/70">
              {item.category}
            </p>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-80" />

          </div>
        </div>
      </div>
    </m.div>
  )
}
