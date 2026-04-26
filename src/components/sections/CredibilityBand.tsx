import { m } from 'framer-motion'
import { useTranslation } from '../../lib/i18n'



export function CredibilityBand() {
  const t = useTranslation()
  const pillars = t.credibilityPillars
  return (
    <section className="section-shell pt-4 pb-4">
      <div className="overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.02] px-8 py-12 md:px-16 md:py-20">
        <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.5em] text-[#ff58f8]/80">
              {t.portfolioEyebrow || 'Approach'}
            </p>
            <h3 className="max-w-[15ch] font-display text-5xl uppercase leading-[0.85] tracking-[0.04em] text-white md:text-7xl">
              <span className="text-glow opacity-90">{t.credibilityHeadline}</span>
            </h3>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col justify-between"
          >
            <p className="max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl md:leading-loose">
              {t.credibilityBody}
            </p>
            
            <div className="mt-16 grid gap-8 md:grid-cols-3 lg:mt-24">
              {pillars.map((pillar, index) => (
                <m.div
                  key={pillar}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10% 0px' }}
                  transition={{ duration: 0.7, delay: 0.3 + index * 0.15 }}
                  className="group relative"
                >
                  <div className="mb-6 h-px w-full bg-gradient-to-r from-white/20 to-transparent transition-all duration-700 group-hover:from-white/50" />
                  <p className="text-xs font-medium leading-relaxed tracking-wider text-white/50 transition-colors duration-500 group-hover:text-white/90">
                    {pillar}
                  </p>
                </m.div>
              ))}
            </div>
          </m.div>
        </div>
      </div>
    </section>
  )
}

export default CredibilityBand
