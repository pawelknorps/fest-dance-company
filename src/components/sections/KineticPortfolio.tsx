// Kinetic Portfolio — 2026 Premium Choreography Showcase
import { Suspense, useRef, useState, useEffect, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Vignette } from '@react-three/postprocessing'
import { portfolio } from '../../data/portfolio'
import { KineticCard, type KineticCardRef } from './KineticCard'
import { KineticScene } from './KineticScene'
import { useScroll, useSpring, useMotionValueEvent, type MotionValue } from 'framer-motion'
import { useLenis } from 'lenis/react'

export function KineticPortfolio() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)')
    setIsMobile(mql.matches)
    const handleMql = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handleMql)

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting) setShouldLoad(true)
      },
      { rootMargin: '600px 0px' }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)

    return () => {
      mql.removeEventListener('change', handleMql)
      observer.disconnect()
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
    velocityRef.current = Math.abs(currentProgress - lastValue.current) / 0.016 
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
    if (idx !== activeIndex) setActiveIndex(idx)
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
    lenis.scrollTo(targetScroll, { duration: 1.2, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
  }, [lenis])

  return (
    <section ref={sectionRef} className="relative h-[700vh] w-full" style={{ background: '#05030a' }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {shouldLoad && (
          <>
            <Canvas
              camera={{ position: [0, 0, 8], fov: 40 }}
              dpr={[1, 1.5]}
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
              
              <KineticContent 
                progress={smoothProgress} 
                velocityRef={velocityRef}
                mouseRef={mouseRef}
                isMobile={isMobile}
                isIntersecting={isIntersecting}
              />

              {!isMobile && (
                <EffectComposer>
                  <Vignette eskil={false} offset={0.1} darkness={1.1} />
                </EffectComposer>
              )}
            </Canvas>

            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 items-center pointer-events-auto">
                {portfolio.map((_, i) => (
                  <button key={i} onClick={() => navigateTo(i)} className="p-1.5 group">
                    <div className={`rounded-full transition-all duration-500 ease-out ${
                      i === activeIndex ? 'w-5 h-[5px] bg-white shadow-[0_0_8px_rgba(184,102,255,0.8)]' : 'w-[5px] h-[5px] bg-white/22 group-hover:bg-white/45'
                    }`} />
                  </button>
                ))}
              </div>
            </div>
          </>
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
  const cardRefs = useRef<(KineticCardRef | null)[]>([])

  useFrame((state) => {
    const p = progress.get()
    const v = velocityRef.current
    const m = mouseRef.current
    const t = state.clock.elapsedTime
    
    for (let i = 0; i < cardRefs.current.length; i++) {
      cardRefs.current[i]?.update(p, v, m, t, isIntersecting)
    }
  })

  return (
    <>
      {portfolio.map((item, index) => (
        <KineticCard
          key={item.id}
          ref={(el) => { cardRefs.current[index] = el }}
          item={item}
          index={index}
          count={portfolio.length}
          isMobile={isMobile}
        />
      ))}
    </>
  )
}

export default KineticPortfolio
