import { motion } from 'framer-motion'
import { useTranslation } from '../../lib/i18n'



export function CredibilityBand() {
  const t = useTranslation()
  const pillars = t.credibilityPillars
  return (
    <section className="section-shell pt-0">
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] px-6 py-8 md:px-8 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.8 }}
          >
            <p className="mb-4 text-sm uppercase tracking-[0.42em] text-white/45">
              Approach
            </p>
            <h3 className="max-w-[12ch] font-display text-5xl uppercase leading-[0.9] tracking-[0.08em] text-white md:text-6xl">
              <span className="text-glow">{t.credibilityHeadline}</span>
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.8, delay: 0.08 }}
          >
            <p className="max-w-2xl text-base leading-8 text-white/72">
              {t.credibilityBody}
            </p>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {pillars.map((pillar, index) => (
                <motion.p
                  key={pillar}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10% 0px' }}
                  transition={{ duration: 0.6, delay: 0.15 + index * 0.1 }}
                  className="border-t border-white/12 pt-4 text-sm leading-7 text-white/58"
                >
                  {pillar}
                </motion.p>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
