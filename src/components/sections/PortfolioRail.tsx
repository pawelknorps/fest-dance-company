import { useRef, useMemo, useEffect } from 'react'
import { m, useScroll, useTransform, useSpring, useVelocity } from 'framer-motion'
import { portfolio } from '../../data/portfolio'
import { SectionHeading } from '../ui/SectionHeading'
import { useTranslation } from '../../lib/i18n'
import { Canvas, useFrame } from '@react-three/fiber'
import { ParticleRiver } from './ParticleRiver'

function ProgressDot({ i, count, scrollYProgress }: { i: number, count: number, scrollYProgress: any }) {
  const dotRef = useRef<HTMLDivElement>(null)
  const mid = i / count
  const start = Math.max(0, mid - 0.1)
  const end = Math.min(1, mid + 0.1)

  useEffect(() => {
    return scrollYProgress.on("change", (latest: number) => {
      if (!dotRef.current) return
      let opacity = 0.3
      if (latest >= start && latest <= end) {
        // Simple linear interpolation for peak at mid
        if (latest < mid) {
          opacity = 0.3 + (0.7 * (latest - start)) / (mid - start || 0.001)
        } else {
          opacity = 1 - (0.7 * (latest - mid)) / (end - mid || 0.001)
        }
      }
      dotRef.current.style.opacity = String(opacity)
    })
  }, [scrollYProgress, start, mid, end])
  
  return (
    <div 
      ref={dotRef}
      style={{ opacity: 0.3 }}
      className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-opacity duration-200" 
    />
  )
}

function VelocityTracker({ velocity, velocityRef }: { velocity: any, velocityRef: React.MutableRefObject<number> }) {
  useFrame(() => {
    velocityRef.current = velocity.get()
  })
  return null
}

export function PortfolioRail() {
  const t = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({ 
    target: sectionRef, 
    offset: ['start start', 'end end'] 
  })

  // Transform scroll progress to horizontal translation
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-85%'])
  
  // Velocity for kinetic effects
  const velocityRef = useRef(0)
  const velocity = useVelocity(scrollYProgress)
  
  return (
    <section ref={sectionRef} id="portfolio" className="relative h-[600vh] bg-[#05030a]">
      {/* Background SOTA Light River — Keeping the artistic WebGL soul but lightweight */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 40 }} dpr={[1, 1.5]}>
          <color attach="background" args={['#05030a']} />
          <VelocityTracker velocity={velocity} velocityRef={velocityRef} />
          <group position={[0, 0, -2]}>
            <ParticleRiver particleCount={1500} width={50} velocityRef={velocityRef} />
          </group>
        </Canvas>
      </div>

      <div className="sticky top-0 flex h-screen w-full flex-col justify-center overflow-hidden">
        <div className="relative z-20 w-full px-[clamp(1.25rem,1.05rem+0.9vw,2rem)] max-w-[1440px] mx-auto mb-8 md:mb-16">
          <SectionHeading
            eyebrow={t.portfolioEyebrow}
            title={t.portfolioTitle}
            copy={t.portfolioCopy}
          />
        </div>

        <m.div 
          ref={containerRef}
          style={{ x }}
          className="relative z-10 flex gap-6 md:gap-12 px-[clamp(1.25rem,1.05rem+0.9vw,2rem)] w-[max-content]"
        >
          {portfolio.map((item, index) => (
            <PortfolioCard key={item.id} item={item} index={index} t={t} />
          ))}
        </m.div>
        
        {/* Visual progress indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {portfolio.map((_, i) => (
            <ProgressDot key={i} i={i} count={portfolio.length} scrollYProgress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PortfolioCard({ item, index, t }: { item: any, index: number, t: any }) {
  const cardRef = useRef<HTMLDivElement>(null)
  
  return (
    <article
      className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] w-[85vw] md:w-[45vw] lg:w-[32vw] aspect-[4/5] md:aspect-[3.5/4.5] transition-all duration-700"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 h-full w-full">
          <img
            src={item.image.src}
            srcSet={item.image.srcSet}
            sizes="(max-width: 768px) 85vw, (max-width: 1024px) 45vw, 32vw"
            alt={t.portfolioAlts?.[item.id as keyof typeof t.portfolioAlts] || item.image.alt}
            width={item.image.width}
            height={item.image.height}
            loading={index < 2 ? "eager" : "lazy"}
            className="h-full w-full object-cover transition duration-1000 ease-out group-hover:scale-[1.1]"
          />
        </div>
        
        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_40%,rgba(0,0,0,0.85)_100%)] opacity-80" />
        <div className="absolute inset-0 bg-indigo-500/10 opacity-0 transition-opacity duration-700 group-hover:opacity-100 mix-blend-overlay" />
        
        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 p-8 md:p-10">
          <div className="overflow-hidden">
            <p className="text-[11px] uppercase tracking-[0.3em] text-indigo-300/80 mb-2">
              {t.portfolioCategories?.[item.category.toLowerCase() as keyof typeof t.portfolioCategories] || item.category}
            </p>
          </div>
          
          <h3 className="font-display text-3xl uppercase tracking-[0.1em] text-white md:text-4xl leading-tight">
            {item.title}
          </h3>
          
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] md:text-xs uppercase tracking-[0.25em] text-white/40">
            <span className="text-white/60">
              {t.portfolioRoles?.[item.role.toLowerCase().replace(' ', '') as keyof typeof t.portfolioRoles] || item.role}
            </span>
            <div className="w-1 h-1 rounded-full bg-indigo-500/40" />
            <span>{item.client}</span>
          </div>
        </div>
      </div>
      
      {/* Interactive Border Glow */}
      <div className="absolute inset-0 rounded-[24px] border-2 border-indigo-500/0 transition-colors duration-700 group-hover:border-indigo-500/20" />
    </article>
  )
}

export default PortfolioRail
