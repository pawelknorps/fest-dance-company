// Kinetic Portfolio — 2026 Premium Choreography Showcase
import { Suspense, useRef, useState, useEffect, useCallback, lazy } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { portfolio } from '../../data/portfolio'
import { KineticCard, type KineticCardRef } from './KineticCard'
import { KineticScene } from './KineticScene'
import { useScroll, useSpring, useMotionValueEvent, type MotionValue } from 'framer-motion'
import { useLenis } from 'lenis/react'
import { useLoadOrchestrator } from '../../lib/LoadOrchestrator'
import { textureManager } from '../../lib/TextureManager'

const PortfolioEffects = lazy(() => import('./PortfolioEffects'))

const POOL_SIZE = 6 // Fixed number of mesh slots for the carousel

export function KineticPortfolio() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [effectsReady, setEffectsReady] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)')
    setIsMobile(mql.matches)
    
    // Configure Texture Manager priority signaling
    textureManager.setPriorityCount(3, () => setEffectsReady(true))

    const handleMql = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handleMql)

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting) setShouldLoad(true)
      },
      { rootMargin: '1500px 0px' }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)

    return () => {
      mql.removeEventListener('change', handleMql)
      observer.disconnect()
      // SOTA Cleanup: Prevent memory leaks across page navigations
      textureManager.dispose()
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
    <section ref={sectionRef} className="relative h-[550vh] w-full" style={{ background: '#05030a' }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {shouldLoad && (
          <>
            <Canvas
              camera={{ position: [0, 0, 8], fov: 40 }}
              dpr={[1, Math.min(1.5, typeof window !== 'undefined' ? window.devicePixelRatio : 1)]}
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
                textureManager.init(gl)
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

              {!isMobile && effectsReady && (
                <Suspense fallback={null}>
                  <PortfolioEffects />
                </Suspense>
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
  const cardRefs = useRef<(KineticCardRef | null)[]>(new Array(portfolio.length).fill(null))
  const [activeRange, setActiveRange] = useState<number[]>([0, 1, 2, 3, 4, 5])

  useFrame((state) => {
    const p = progress.get()
    const v = velocityRef.current
    const m = mouseRef.current
    const t = state.clock.elapsedTime
    
    // Dynamic Windowing based on velocity
    const baseIndex = p * (portfolio.length - 1)
    const lookAhead = Math.floor(Math.abs(v) * 0.4)
    const windowSize = isMobile ? 2 : 3
    
    const start = Math.max(0, Math.floor(baseIndex - windowSize))
    const end = Math.min(portfolio.length - 1, Math.ceil(baseIndex + windowSize + (v > 0 ? lookAhead : 0)))
    
    // Create mapping of pool slots to portfolio indices
    const indices = []
    for (let i = start; i <= end; i++) {
      indices.push(i)
    }
    
    // We only update the state if the range of visible indices changed significantly
    // to avoid unnecessary re-renders while keeping the pooling logic efficient
    if (JSON.stringify(indices) !== JSON.stringify(activeRange)) {
      setActiveRange(indices)
    }

    for (let i = 0; i < cardRefs.current.length; i++) {
      cardRefs.current[i]?.update(p, v, m, t, isIntersecting)
    }
  })

  // Pool-based rendering: we only render cards that are within the active range
  return (
    <>
      {activeRange.map((portfolioIndex) => (
        <KineticCard
          key={portfolio[portfolioIndex].id}
          ref={(el) => { cardRefs.current[portfolioIndex] = el }}
          item={portfolio[portfolioIndex]}
          index={portfolioIndex}
          count={portfolio.length}
          isMobile={isMobile}
        />
      ))}
    </>
  )
}

export default KineticPortfolio
