import { useRef } from 'react'
import { motion, useScroll, useTransform, useVelocity, useSpring } from 'framer-motion'
import { portfolio } from '../../data/portfolio'
import { SectionHeading } from '../ui/SectionHeading'
import { useTranslation } from '../../lib/i18n'

export function PortfolioRail() {
  const t = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  
  // Oś czasu podpięta od momentu przyklejenia się sekcji (start start) do odklejenia (end end)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-100%'])

  return (
    <section ref={sectionRef} id="portfolio-rail" className="section-premium relative h-[400vh]">
      <div className="sticky top-0 flex h-screen w-full flex-col justify-center overflow-hidden">
        <div className="w-full px-[clamp(1.25rem,1.05rem+0.9vw,2rem)] max-w-[1440px] mx-auto mb-10">
      <SectionHeading
        eyebrow={t.portfolioEyebrow}
        title={t.portfolioTitle}
        copy={t.portfolioCopy}
      />

      </div>

      <motion.div style={{ x, willChange: 'transform' }} className="flex gap-4 px-[clamp(1.25rem,1.05rem+0.9vw,2rem)] w-[max-content]">
        {portfolio.map((item) => (
          <article
            key={item.id}
            className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] w-[85vw] md:w-[45vw] lg:w-[35vw] aspect-[4/5] md:aspect-[3/4]"
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 h-full w-full">
                <img
                  src={item.image.src}
                  srcSet={item.image.srcSet}
                  sizes="(max-width: 768px) 85vw, (max-width: 1024px) 45vw, 35vw"
                  alt={t.portfolioAlts?.[item.id as keyof typeof t.portfolioAlts] || item.image.alt}
                  width={item.image.width}
                  height={item.image.height}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
                />
              </div>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.72)_100%)] pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 pointer-events-none">
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/52">
                  {t.portfolioCategories?.[item.category.toLowerCase() as keyof typeof t.portfolioCategories] || item.category}
                </p>
                <h3 className="mt-2 font-display text-3xl uppercase tracking-[0.1em] text-white md:text-4xl">
                  {item.title}
                </h3>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs uppercase tracking-[0.22em] text-white/48">
                  <span>
                    {t.portfolioRoles?.[item.role.toLowerCase().replace(' ', '') as keyof typeof t.portfolioRoles] || item.role}
                  </span>
                  <span>{item.client}</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </motion.div>
      </div>
    </section>
  )
}

export default PortfolioRail
