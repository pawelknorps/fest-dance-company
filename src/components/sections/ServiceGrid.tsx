import { useRef } from 'react'
import { motion, useScroll, useTransform, useVelocity, useSpring } from 'framer-motion'
import { services } from '../../data/services'
import { SectionHeading } from '../ui/SectionHeading'
import { useTranslation } from '../../lib/i18n'

export function ServiceGrid() {
  const t = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  
  const imageY = useTransform(scrollYProgress, [0, 1], ['-15%', '15%'])
  const xPercent = useTransform(scrollYProgress, [0, 1], [0, -100])
  const x = useTransform(xPercent, (v) => `calc(${v}% + ${-v}vw)`)

  return (
    <section ref={sectionRef} id="oferta" className="section-premium relative h-[300vh]">
      <div className="sticky top-0 flex h-[100svh] w-full flex-col justify-center overflow-hidden py-10 md:py-20">
        <div className="w-full px-[clamp(1.25rem,1.05rem+0.9vw,2rem)] max-w-[1440px] mx-auto mb-8 md:mb-12">
            <SectionHeading
              eyebrow={t.servicesEyebrow}
              title={t.servicesTitle}
              copy={t.serviceIntro}
            />
        </div>

        <motion.div 
          style={{ x, wheel: 'none', willChange: 'transform' }}
          className="flex gap-4 px-[clamp(1.25rem,1.05rem+0.9vw,2rem)] w-[max-content] md:gap-6 lg:gap-8"
        >
          {services.map((service) => {
            const translated = t.servicesItems?.[service.id as keyof typeof t.servicesItems] || service
            return (
              <article
                key={service.id}
                className="group relative w-[85vw] flex-shrink-0 overflow-hidden rounded-[24px] border border-white/10 bg-black md:w-[50vw] lg:w-[42vw] h-[55vh] min-h-[24rem] max-h-[40rem]"
              >
                <div className="absolute inset-0 h-full w-full">
                  <img
                    src={service.coverImage.src}
                    srcSet={service.coverImage.srcSet}
                    sizes="(max-width: 768px) 85vw, (max-width: 1024px) 50vw, 42vw"
                    alt={translated.alt || service.coverImage.alt}
                    className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-[1.04] group-hover:opacity-100"
                  />
                </div>
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.75)_100%)] pointer-events-none" />
                {/* Frosted Bar with Title */}
                <div className="absolute inset-x-0 top-[28%] flex h-24 items-center justify-center bg-black/26 backdrop-blur-[6px] md:top-[32%] md:h-28 lg:h-32 pointer-events-none">
                   <h3 className="text-center font-display text-5xl uppercase tracking-[0.14em] text-white md:text-6xl lg:text-7xl">
                      <span className="text-glow">{translated.title || service.title}</span>
                   </h3>
                </div>
                
                <div className="relative flex h-full flex-col justify-end p-6 md:p-8 lg:p-10 pointer-events-none">
                   <div className="max-w-xl">
                    <p className="text-sm leading-7 text-white/80 md:text-base lg:text-lg">
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
        </motion.div>
      </div>
    </section>
  )
}

