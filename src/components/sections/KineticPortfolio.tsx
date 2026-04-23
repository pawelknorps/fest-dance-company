// Kinetic Portfolio — 2026 Premium Choreography Showcase
import { Suspense, useRef, useState, useEffect, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { portfolio } from '../../data/portfolio'
import { KineticCard } from './KineticCard'
import { KineticScene } from './KineticScene'
import { useTranslation } from '../../lib/i18n'
import { motion, AnimatePresence, useScroll, useSpring, useMotionValueEvent, type MotionValue } from 'framer-motion'

export function KineticPortfolio() {
  const t = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 100,
    mass: 0.5,
    restDelta: 0.001,
  })

  // Sync active card index to React state
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const idx = Math.round(value * (portfolio.length - 1))
    setActiveIndex(Math.min(Math.max(idx, 0), portfolio.length - 1))
  })

  // Scroll page to the right position for a given card index
  const navigateTo = useCallback((idx: number) => {
    const clamped = Math.min(Math.max(idx, 0), portfolio.length - 1)
    const fraction = clamped / (portfolio.length - 1)
    const section = sectionRef.current
    if (!section) return
    const sectionTop = section.offsetTop
    const sectionHeight = section.offsetHeight
    const targetScroll = sectionTop + fraction * (sectionHeight - window.innerHeight)
    window.scrollTo({ top: targetScroll, behavior: 'smooth' })
  }, [])

  // Keyboard navigation ← →
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') navigateTo(activeIndex + 1)
      if (e.key === 'ArrowLeft') navigateTo(activeIndex - 1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [activeIndex, navigateTo])

  const activeItem = portfolio[activeIndex]

  return (
    <section
      ref={sectionRef}
      id="portfolio"
      className="relative h-[500vh] w-full"
      style={{ background: '#070410' }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">

        {/* ── 3-D WebGL Canvas ─────────────────────────────────────── */}
        <Canvas
          camera={{ position: [0, 0, 8], fov: 40 }}
          dpr={1}
          gl={{ 
            antialias: false, 
            alpha: false, 
            stencil: false,
            depth: true,
            powerPreference: 'high-performance'
          }}
          onCreated={({ gl }) => {
            gl.setClearColor('#070410')
          }}
        >
          <Suspense fallback={null}>
            {portfolio.length > 0 && <KineticContent progress={smoothProgress} />}
          </Suspense>
        </Canvas>

        {/* ── HTML Overlay ──────────────────────────────────────────── */}
        <div className="absolute inset-0 pointer-events-none z-10">

          {/* Top bar — eyebrow + counter */}
          <div className="absolute top-8 left-8 right-8 flex items-start justify-between">
            <div>
              <p className="text-[0.58rem] uppercase tracking-[0.55em] text-white/35 mb-1">
                {t.portfolioEyebrow ?? 'Portfolio'}
              </p>
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/18">
                {t.portfolioTitle ?? 'Selected Works'}
              </p>
            </div>
            <p className="text-[0.62rem] uppercase tracking-[0.3em] text-white/30 font-mono tabular-nums">
              {String(activeIndex + 1).padStart(2, '0')}&thinsp;/&thinsp;{String(portfolio.length).padStart(2, '0')}
            </p>
          </div>

          {/* Bottom — active card meta */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-20 left-8 right-8 flex items-end justify-between"
            >
              <div>
                <p className="text-[0.56rem] uppercase tracking-[0.52em] text-purple-400/70 mb-2">
                  {activeItem?.role}
                </p>
                <p className="text-[clamp(1.3rem,2.8vw,2rem)] font-display uppercase tracking-[0.06em] text-white leading-none">
                  {activeItem?.title}
                </p>
              </div>
              <p className="text-[0.58rem] uppercase tracking-[0.38em] text-white/22 text-right">
                {activeItem?.client}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Dot navigation — bottom centre */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 items-center pointer-events-auto">
            {portfolio.map((_, i) => (
              <button
                key={i}
                onClick={() => navigateTo(i)}
                aria-label={`Go to project ${i + 1}`}
                className="p-1.5 group"
              >
                <div
                  className={`rounded-full transition-all duration-500 ease-out ${
                    i === activeIndex
                      ? 'w-5 h-[5px] bg-white shadow-[0_0_8px_rgba(184,102,255,0.8)]'
                      : 'w-[5px] h-[5px] bg-white/22 group-hover:bg-white/45'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Subtle left/right edge gradient cues */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#070410]/60 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#070410]/60 to-transparent" />
        </div>
      </div>
    </section>
  )
}

// Inner R3F component — must live inside <Canvas>
function KineticContent({ progress }: { progress: MotionValue<number> }) {
  const velocityRef = useRef(0)
  const lastValue = useRef(0)
  const [rangeIndex, setRangeIndex] = useState(0)

  // Track the current center index to drive virtualization
  useMotionValueEvent(progress, 'change', (val) => {
    const currentProgress = Number(val)
    const diff = currentProgress - lastValue.current
    velocityRef.current = Math.abs(diff) / 0.016 // approximate delta
    lastValue.current = currentProgress

    const newIndex = Math.round(currentProgress * (portfolio.length - 1))
    if (newIndex !== rangeIndex) {
      setRangeIndex(newIndex)
    }
  })

  useFrame((state) => {
    // Camera is static to ensure stability
  })

  return (
    <>
      <KineticScene />
      {portfolio.map((item, index) => {
        // Virtualization: Only render cards within +/- 2 of the current center
        const isNear = Math.abs(index - rangeIndex) <= 2
        
        if (!isNear) return null
        
        return (
          <KineticCard
            key={item.id}
            item={item}
            index={index}
            count={portfolio.length}
            progress={progress}
            velocityRef={velocityRef}
          />
        )
      })}
    </>
  )
}
