import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useVelocity, useSpring } from 'framer-motion'
import { services } from '../../data/services'
import { SectionHeading } from '../ui/SectionHeading'
import { useTranslation } from '../../lib/i18n'

export function ServiceGrid() {
  const t = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end end'] })
  
  const imageY = useTransform(scrollYProgress, [0.3, 1], ['-15%', '15%'])
  const x = useTransform(scrollYProgress, [0.3, 0.9], ['0%', '-68%'])

  const containerRef = useRef<HTMLDivElement>(null)
  const imageRefs = useRef<(HTMLImageElement | null)[]>([])

  useEffect(() => {
    const unsubX = x.on("change", (v: string) => {
      if (containerRef.current) {
        containerRef.current.style.transform = `translateX(${v})`
      }
    })
    
    const unsubY = imageY.on("change", (v: string) => {
      imageRefs.current.forEach(img => {
        if (img) img.style.transform = `translateY(${v}) scale(1.15)`
      })
    })

    return () => {
      unsubX()
      unsubY()
    }
  }, [x, imageY])

  return (
    <section ref={sectionRef} id="oferta" className="section-premium relative h-[200dvh]">
      <div className="sticky top-0 flex h-[100dvh] w-full flex-col justify-center overflow-hidden py-10 md:py-20">
        <div className="w-full px-[clamp(1rem,0.8rem+1vw,2.5rem)] max-w-[1440px] mx-auto mb-8 md:mb-12">
            <SectionHeading
              eyebrow={t.servicesEyebrow}
              title={t.servicesTitle}
              copy={t.serviceIntro}
            />
        </div>

        <div 
          ref={containerRef}
          className="flex gap-4 px-[clamp(1rem,0.8rem+1vw,2.5rem)] w-[max-content] md:gap-6 lg:gap-8 scroll-snap-type-x-mandatory touch-action-pan-y"
          style={{ willChange: 'transform' }}
        >
          {services.map((service, index) => {
            const translated = t.servicesItems?.[service.id as keyof typeof t.servicesItems] || service
            return (
              <article
                key={service.id}
                className="group relative w-[85vw] flex-shrink-0 overflow-hidden rounded-[24px] border border-white/10 bg-black md:w-[50vw] lg:w-[42vw] h-[55dvh] min-h-[24rem] max-h-[40rem] scroll-snap-align-center"
              >
                <div className="absolute inset-0 h-full w-full overflow-hidden">
                  <img
                    ref={el => { imageRefs.current[index] = el }}
                    src={service.coverImage.src}
                    srcSet={service.coverImage.srcSet}
                    sizes="(max-width: 768px) 85vw, (max-width: 1024px) 50vw, 42vw"
                    alt={translated.alt || service.coverImage.alt}
                    className="h-full w-full object-cover opacity-80 transition-opacity duration-700 group-hover:opacity-100"
                    style={{ transform: 'translateY(-15%) scale(1.15)', willChange: 'transform' }}
                  />
                </div>
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.75)_100%)] pointer-events-none" />
                {/* Frosted Bar with Title */}
                <div className="absolute inset-x-0 top-[28%] flex h-24 items-center justify-center bg-black/26 backdrop-blur-[6px] md:top-[32%] md:h-28 lg:h-32 pointer-events-none">
                   <h3 className="text-center font-display text-fluid-h3 uppercase tracking-[0.14em] text-white">
                      <span className="text-glow">{translated.title || service.title}</span>
                   </h3>
                </div>
                
                <div className="relative flex h-full flex-col justify-end p-6 md:p-8 lg:p-10 pointer-events-none">
                   <div className="max-w-xl">
                    <p className="text-sm leading-7 text-white/80 md:text-fluid-body lg:text-lg">
                      {translated.short || service.shortCopy}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {(translated.tags || service.tags).map((tag: string) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.24em] text-white/70 backdrop-blur-sm md:text-[11px]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
