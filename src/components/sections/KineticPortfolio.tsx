// Kinetic Portfolio — 2026 Premium Choreography Showcase
import { Suspense, useRef, useState, useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, DepthOfField, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import { portfolio } from '../../data/portfolio'
import { KineticCard } from './KineticCard'
import { KineticScene } from './KineticScene'
import { useTranslation } from '../../lib/i18n'
import { motion, useScroll, useSpring, useMotionValueEvent, type MotionValue } from 'framer-motion'
import { useLenis } from 'lenis/react'

export function KineticPortfolio() {
  const t = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isIntersecting, setIsIntersecting] = useState(false)

  // Internal deferred loading logic
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)')
    setIsMobile(mql.matches)
    const handleMql = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handleMql)

    window.__fest_trigger_portfolio = () => setShouldLoad(true)

    if (window.location.hash === '#portfolio') {
      setShouldLoad(true)
    }

    const handleHash = () => {
      if (window.location.hash === '#portfolio') setShouldLoad(true)
    }
    window.addEventListener('hashchange', handleHash)

    const node = sectionRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting) {
          setShouldLoad(true)
        }
      },
      { rootMargin: '400px 0px' }
    )
    observer.observe(node)

    return () => {
      mql.removeEventListener('change', handleMql)
      window.removeEventListener('hashchange', handleHash)
      observer.disconnect()
      delete window.__fest_trigger_portfolio
    }
  }, [])

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

  const velocityRef = useRef(0)
  const lastValue = useRef(0)
  const mouseRef = useRef({ x: 0, y: 0 })

  useMotionValueEvent(smoothProgress, 'change', (val) => {
    const currentProgress = Number(val)
    const diff = currentProgress - lastValue.current
    velocityRef.current = Math.abs(diff) / 0.016 
    lastValue.current = currentProgress
  })

  useEffect(() => {
    if (isMobile) return
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isMobile])

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const idx = Math.round(value * (portfolio.length - 1))
    if (idx !== activeIndex) {
      setActiveIndex(idx)
    }
  })

  const lenis = useLenis()

  const navigateTo = useCallback((idx: number) => {
    const clamped = Math.min(Math.max(idx, 0), portfolio.length - 1)
    const fraction = clamped / (portfolio.length - 1)
    const section = sectionRef.current
    if (!section || !lenis) return
    
    const sectionTop = section.offsetTop
    const sectionHeight = section.offsetHeight
    const targetScroll = sectionTop + fraction * (sectionHeight - window.innerHeight)
    
    lenis.scrollTo(targetScroll, {
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })
  }, [lenis])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') navigateTo(activeIndex + 1)
      if (e.key === 'ArrowLeft') navigateTo(activeIndex - 1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [activeIndex, navigateTo])

  return (
    <section
      ref={sectionRef}
      className="relative h-[700vh] w-full"
      style={{ background: '#05030a' }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {shouldLoad ? (
          <>
            <Canvas
              camera={{ position: [0, 0, 8], fov: 40 }}
              dpr={isMobile ? 1 : [1, 2]} // Quality dpr for desktop
              frameloop={isIntersecting ? 'always' : 'never'}
              gl={{ 
                antialias: true, 
                alpha: false, 
                stencil: false,
                depth: true,
                powerPreference: 'high-performance'
              }}
              onCreated={({ gl }) => {
                gl.setClearColor('#05030a')
              }}
            >
              <KineticScene isMobile={isMobile} velocityRef={velocityRef} isIntersecting={isIntersecting} />
              
              <Suspense fallback={null}>
                {portfolio.length > 0 && (
                  <KineticContent 
                    progress={smoothProgress} 
                    velocityRef={velocityRef}
                    mouseRef={mouseRef}
                    isMobile={isMobile}
                    isIntersecting={isIntersecting}
                  />
                )}
              </Suspense>

              {/* SOTA Quality Post-Processing Stack */}
              {!isMobile && (
                <EffectComposer disableNormalPass multisampling={4}>
                  <DepthOfField 
                    focusDistance={0.015}
                    focalLength={0.02} 
                    bokehScale={3.5} 
                    height={720} // High resolution Bokeh
                  />
                  <Bloom 
                    luminanceThreshold={0.9} 
                    mipmapBlur 
                    intensity={0.35} 
                    radius={0.3} 
                  />
                  <Noise opacity={0.015} />
                  <Vignette eskil={false} offset={0.1} darkness={1.1} />
                </EffectComposer>
              )}
            </Canvas>

            {/* Indicator Dots Overlay */}
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 items-center pointer-events-auto">
                {portfolio.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => navigateTo(i)}
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
            </div>
          </>
        ) : (
          <div className="h-full w-full bg-[#05030a]" />
        )}
      </div>
    </section>
  )
}

function KineticContent({ 
  progress, 
  velocityRef, 
  mouseRef,
  isMobile,
  isIntersecting
}: { 
  progress: MotionValue<number>, 
  velocityRef: React.MutableRefObject<number>,
  mouseRef: React.MutableRefObject<{ x: number, y: number }>,
  isMobile: boolean,
  isIntersecting: boolean
}) {

  return (
    <>
      {portfolio.map((item, index) => (
        <KineticCard
          key={item.id}
          item={item}
          index={index}
          count={portfolio.length}
          progress={progress}
          velocityRef={velocityRef}
          mouseRef={mouseRef}
          isMobile={isMobile}
          isIntersecting={isIntersecting}
        />
      ))}
    </>
  )
}

export default KineticPortfolio
