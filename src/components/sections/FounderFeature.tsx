import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { founder } from '../../data/founder'
import { useTranslation } from '../../lib/i18n'


export function FounderFeature() {
  const t = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })

  return (
    <section ref={sectionRef} id="founder" className="section-premium relative pt-16 pb-12 md:pt-24 md:pb-16">
      <div className="section-shell w-full max-w-[1300px]">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full"
          >
            <p className="mb-8 text-[0.7rem] font-medium uppercase tracking-[0.4em] text-[#ff58f8]/90">
              Founder & Lead Choreographer
            </p>
            <h2 className="font-display uppercase leading-[0.85] tracking-[0.02em] text-white">
              <span className="mb-6 block text-fluid-small text-white/30">
                {t.founderEyebrow}
              </span>
              <span className="text-fluid-h2">
                {founder.name.split(' ').map((part) => (
                   <span key={part} className="text-glow block text-white">
                    {part}
                  </span>
                ))}
              </span>
            </h2>

            <div className="mt-12 space-y-8 text-fluid-body leading-relaxed text-white/60">
              {t.founderBio.map((paragraph: string) => (
                <p key={paragraph} className="max-w-[45ch]">{paragraph}</p>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 30 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-[580px]"
          >
            {/* Background elements for depth */}
            <div className="absolute -inset-10 rounded-[60px] bg-[#ff58f8]/5 blur-[80px] opacity-40" />
            <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/5 blur-3xl" />
            
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="group relative aspect-[2/3] w-full overflow-hidden rounded-[40px] border border-white/10 bg-[#0a0a0c] shadow-2xl shadow-black/50"
            >
              <div className="absolute inset-0 h-full w-full">
                <img
                  src={founder.portrait.src}
                  srcSet={founder.portrait.srcSet}
                  sizes="(max-width: 1024px) 100vw, 600px"
                  alt={t.founderAlt}
                  width={founder.portrait.width}
                  height={founder.portrait.height}
                  loading="lazy"
                  className="h-full w-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-[1.05]"
                />
              </div>
              
              {/* Refined overlays */}
              <div className="absolute inset-0 rounded-[40px] border border-white/5 pointer-events-none ring-1 ring-inset ring-white/10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none" />
              
              {/* Dynamic light streak */}
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
            </motion.div>
          </motion.div>
        </div>

        <div className="mt-16 grid gap-10 md:mt-20 md:grid-cols-3 lg:max-w-[1100px]">
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
            <p className="font-display text-fluid-h3 uppercase leading-none tracking-[0.1em] text-white">
              <span className="text-glow">{metric.value}</span>
            </p>
            <p className="mt-3 max-w-[18ch] text-[11px] uppercase tracking-[0.24em] text-white/55">
              {translatedLabel}
            </p>
          </motion.div>
        )})}
        </div>
      </div>
    </section>
  )
}
