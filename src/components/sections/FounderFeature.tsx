import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { founder } from '../../data/founder'
import { useTranslation } from '../../lib/i18n'


export function FounderFeature() {
  const t = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })

  return (
    <section ref={sectionRef} id="founder" className="section-premium relative py-24 md:py-32">
      <div className="section-shell w-full max-w-[1300px]">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-0 xl:grid-cols-[1.2fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.7 }}
            className="w-full lg:pr-12 xl:pr-20"
          >
            <p className="mb-6 text-[0.7rem] font-medium uppercase tracking-[0.3em] text-[#ff58f8]/80">
              Founder
            </p>
            <h2 className="font-display uppercase leading-[0.88] tracking-[0.04em] text-white">
              <span className="mb-4 block text-[clamp(2rem,3.5vw,3rem)] text-white/40">
                {t.founderEyebrow}
              </span>
              <span className="text-[clamp(4.5rem,8vw,8.5rem)]">
                {founder.name.split(' ').map((part) => (
                  <span key={part} className="text-glow block text-white/95">
                    {part}
                  </span>
                ))}
              </span>
            </h2>

            <div className="mt-10 space-y-6 text-[0.95rem] leading-8 text-white/55">
              {t.founderBio.map((paragraph: string) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mx-auto w-full max-w-[500px] lg:-ml-12 xl:-ml-20"
          >
            {/* Ambient background glow */}
            <div className="absolute -inset-4 rounded-[40px] bg-[radial-gradient(circle_at_50%_0%,rgba(255,88,248,0.08),transparent_70%)] blur-2xl opacity-50" />
            
            <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-[32px] border border-white/10 bg-[#0a0a0c]">
              <div className="absolute inset-0 h-full w-full">
                <img
                  src={founder.portrait.src}
                  srcSet={founder.portrait.srcSet}
                  sizes="(max-width: 1024px) 100vw, 500px"
                  alt={t.founderAlt}
                  width={founder.portrait.width}
                  height={founder.portrait.height}
                  loading="lazy"
                  className="h-full w-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-[1.03]"
                />
              </div>
              
              {/* Modern overlays */}
              <div className="absolute inset-0 rounded-[32px] border border-white/5 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </div>

        <div className="mt-20 grid gap-10 md:mt-28 md:grid-cols-3 lg:max-w-[1100px]">
        {founder.metrics.map((metric, index) => {
          const translatedLabel = t.founderMetrics?.[index]?.label || metric.label
          return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: index * 0.08 }}
            className="border-t border-white/12 pt-5"
          >
            <p className="font-display text-6xl uppercase leading-none tracking-[0.1em] text-white">
              <span className="text-glow">{metric.value}</span>
            </p>
            <p className="mt-3 max-w-[18ch] text-sm uppercase tracking-[0.24em] text-white/55">
              {translatedLabel}
            </p>
          </motion.div>
        )})}
        </div>
      </div>
    </section>
  )
}
