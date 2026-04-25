import { m } from 'framer-motion'
import { featuredReel } from '../../data/portfolio'
import { SectionHeading } from '../ui/SectionHeading'
import { useTranslation } from '../../lib/i18n'

export function ReelShowcase() {
  const t = useTranslation()
  return (
    <section className="section-shell">
      <SectionHeading
        eyebrow={t.reelEyebrow}
        title={t.reelTitle}
        copy={t.reelCopy}
      />

      <m.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.8 }}
        className="mt-10 overflow-hidden rounded-[30px] border border-white/10 bg-black md:mt-14"
      >
        <div className="relative aspect-[16/10] md:aspect-[16/8]">
          <img
            src={featuredReel.image.src}
            alt={t.reelAlt}
            width={featuredReel.image.width}
            height={featuredReel.image.height}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-78"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.7))]" />
          <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10">
            <div className="flex justify-end">
              <div className="rounded-full border border-white/20 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/70 backdrop-blur-md">
                Vimeo / MP4 placeholder
              </div>
            </div>
            <div className="max-w-[34rem]">
              <h3 className="font-display text-4xl uppercase tracking-[0.1em] text-white md:text-6xl">
                <span className="text-glow">{t.reelTitle}</span>
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/74 md:text-base">
                {t.reelCopy}
              </p>
            </div>
          </div>
        </div>
      </m.div>
    </section>
  )
}
