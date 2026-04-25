import { useRef, useState } from 'react'
import { m, useScroll, useSpring, useMotionValueEvent } from 'framer-motion'
import { portfolio } from '../../data/portfolio'
import { DOMKineticCard } from './DOMKineticCard'
import { useTranslation } from '../../lib/i18n'

/**
 * SOTA DOM Kinetic Portfolio (Z-Depth Scroll Architecture)
 * Fallback for devices without WebGL.
 * Maps vertical scroll position to 3D Z-axis movement.
 */
export function DOMKineticPortfolio() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const t = useTranslation()

  // 1. Capture Native Scroll
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  // 2. Kinetic Spring Physics
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 20,
    stiffness: 100,
    mass: 0.5,
  })

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const idx = Math.round(value * (portfolio.length - 1))
    if (idx !== activeIndex) setActiveIndex(idx)
  })

  return (
    <section 
      ref={sectionRef} 
      className="relative h-[800vh] w-full bg-[#05030a]"
    >
      {/* Viewport Container: establishes perspective context */}
      <div className="sticky top-0 h-screen w-full overflow-hidden perspective-1000">
        
        {/* SOTA Ambient Atmosphere */}
        <div className="absolute inset-0 z-0 bg-[#05030a]" />
        
        <div className="noise-mask absolute inset-0 opacity-10 pointer-events-none" />

        {/* 3. Card Wrapper: forces hardware acceleration */}
        <div className="relative h-full w-full preserve-3d">
          {portfolio.map((item, index) => (
            <div key={item.id} className="absolute inset-0 flex items-center justify-center">
              <DOMKineticCard
                item={item}
                index={index}
                count={portfolio.length}
                progress={smoothProgress}
              />
            </div>
          ))}
        </div>

        {/* Global UI Elements */}
        <div className="absolute inset-x-0 bottom-12 z-50 flex flex-col items-center gap-8 pointer-events-none">
          {/* Scroll Navigation */}
          <div className="flex gap-2 pointer-events-auto">
            {portfolio.map((_, i) => (
              <div 
                key={i} 
                className={`h-[3px] transition-all duration-700 ease-[0.16,1,0.3,1] ${
                  i === activeIndex 
                    ? 'w-12 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' 
                    : 'w-2 bg-white/10'
                } rounded-full`}
              />
            ))}
          </div>

          <div className="text-center opacity-40">
             <p className="text-[9px] uppercase tracking-[0.6em] text-white">
               {activeIndex + 1} <span className="mx-2 opacity-30">/</span> {portfolio.length}
             </p>
          </div>
        </div>

        {/* Animated Background Text Elements - Hidden on Mobile */}
        <div className="absolute inset-0 hidden md:flex items-center justify-center pointer-events-none overflow-hidden select-none">
           <m.div 
             className="font-display text-[15vw] uppercase leading-none text-white/[0.02] whitespace-nowrap"
             style={{ rotateZ: -10 }}
           >
             PORTFOLIO 2026
           </m.div>
        </div>
      </div>
    </section>
  )
}

export default DOMKineticPortfolio

