import { lazy, Suspense } from 'react'
import { m } from 'framer-motion'
import { brand } from '../../data/brand'
import { useHeroMediaVisibility } from '../../hooks/useHeroMediaVisibility'
import { PrimaryButton } from '../ui/PrimaryButton'
import { KineticText } from '../ui/KineticText'
import { useTranslation } from '../../lib/i18n'

const CanvasAlternativeHero = lazy(() => import('../ui/CanvasAlternativeHero'))

export function AlternativeHeroStage() {
  const t = useTranslation()
  const { ref: visRef, isVisible } = useHeroMediaVisibility<HTMLDivElement>(0.1)

  const spectrumNotes = t.lang === 'pl' 
    ? ['reżyseria koncertowa', 'język ruchu kampanii', 'rytm sceniczny i narracja']
    : ['concert direction', 'campaign movement language', 'staging and narrative rhythm']

  return (
    <section id="top" className="relative isolate min-h-screen overflow-hidden bg-[#050508]">
      {/* 3D Background Logo Layer */}
      <div ref={visRef} className="absolute inset-0 z-0">
        <Suspense
          fallback={
            <div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_0%,transparent_60%)]" />
          }
        >
          <CanvasAlternativeHero isVisible={isVisible} />
        </Suspense>
      </div>

      {/* Overlays for depth and readability */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(5,5,8,0.7)_100%)] pointer-events-none" />
      <div className="noise-mask absolute inset-0 z-0 opacity-25 pointer-events-none" />

      {/* Foreground Content */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] items-center px-[clamp(1.25rem,1.05rem+0.9vw,2rem)] py-28 md:py-32">
        <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.34fr)] lg:items-end">
          
          <div className="max-w-[620px] mix-blend-difference">
            <m.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.15 }}
              className="mb-5 text-[0.68rem] uppercase tracking-[0.42em] text-white/70 md:text-xs"
            >
              {t.heroKicker}
            </m.p>
            <m.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.22 }}
              className="mb-6 text-[0.72rem] uppercase tracking-[0.34em] text-white/50"
            >
              {brand.name}
            </m.p>

            <h1
              className="relative max-w-[8ch] font-display text-[clamp(3.2rem,8vw,6.7rem)] uppercase leading-[0.88] tracking-[0.05em] text-white"
            >
              <KineticText text={t.claim} className="text-glow" delay={0.26} />
            </h1>

            <m.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.66, delay: 0.54 }}
              className="mt-9 flex flex-wrap gap-3"
            >
              <PrimaryButton href="#kontakt">{t.ctaPrimary}</PrimaryButton>
              <PrimaryButton href="#portfolio" variant="ghost">
                {t.ctaSecondary}
              </PrimaryButton>
            </m.div>
          </div>

          <m.ul
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.78, delay: 0.42 }}
            className="justify-self-end w-full max-w-[300px] space-y-4 mix-blend-difference"
          >
            {spectrumNotes.map((note, index) => (
              <li
                key={note}
                className="border-t border-white/20 pt-4 text-[0.74rem] uppercase tracking-[0.2em] text-white/70"
              >
                <span className="font-display text-[1.28rem] leading-none text-white/40">0{index + 1}</span>
                <p className="mt-2 leading-5">{note}</p>
              </li>
            ))}
          </m.ul>
        </div>
      </div>
    </section>
  )
}
