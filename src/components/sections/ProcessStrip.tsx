import { m } from 'framer-motion'
import { processSteps } from '../../data/process'
import { SectionHeading } from '../ui/SectionHeading'
import { useTranslation } from '../../lib/i18n'

export function ProcessStrip() {
  const t = useTranslation()
  return (
    <section className="section-premium section-shell py-6">
      <SectionHeading
        eyebrow="Workflow"
        title={t.processHeadline}
        copy={t.processIntro}
      />

      <div className="mt-8 grid gap-2 md:mt-14 md:grid-cols-4">
        {processSteps.map((step, index) => {
          const translated = t.processStepsItems?.[`step${step.id}` as keyof typeof t.processStepsItems] || step
          return (
            <m.article
              key={step.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.7, delay: index * 0.08 }}
              className="border-t border-white/12 pt-3"
            >
              <p className="font-display text-3xl uppercase tracking-[0.16em] text-fuchsia-300">
                {String(step.id).padStart(2, '0')}
              </p>
              <h3 className="mt-2 font-display text-3xl uppercase tracking-[0.1em] text-white">
                {translated.label}
              </h3>
              <p className="mt-2 max-w-[25ch] text-sm leading-6 text-white/58">
                {translated.description}
              </p>
            </m.article>
          )
        })}
      </div>
    </section>
  )
}

export default ProcessStrip
