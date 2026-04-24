import { lazy, Suspense } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { brand } from '../../data/brand'
import { siteCopy as plCopy } from '../../content/site-copy'
import { useHeroMediaVisibility } from '../../hooks/useHeroMediaVisibility'
import { PrimaryButton } from '../ui/PrimaryButton'
import festLogo from '../../assets/logo/fest-logo.png?format=webp&w=1400&q=85&as=url'
import { OffscreenHero } from '../ui/OffscreenHero'
import { KineticText } from '../ui/KineticText'
import { useTranslation } from '../../lib/i18n'

// CanvasHero is code-split into its own chunk — Three.js doesn't load until needed
const CanvasHero = lazy(() => import('../ui/CanvasHero'))

export function HeroStage() {
  const t = useTranslation()
  const prefersReducedMotion = useReducedMotion() ?? false
  const { ref: visRef, isVisible } = useHeroMediaVisibility<HTMLDivElement>(0.1)
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const canvasOpacity = useTransform(scrollYProgress, [0, 0.2, 0.28], [0, 0, 1])
  const festOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 1, 0])
  const festScale = useTransform(scrollYProgress, [0, 1], [1, 1.8])
  const textY = useTransform(scrollYProgress, [0, 0.7], ['0%', '-10%'])
  const textOpacity = useTransform(scrollYProgress, [0, 0.58, 0.92], [1, 0.94, 0.7])
  const scrubProgress = useTransform(scrollYProgress, [0.24, 0.96], [0, 1])

  return (
    <section ref={sectionRef} id="top" className="relative isolate h-[320dvh] bg-[#060609]">
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_42%,rgba(184,92,255,0.16),transparent_0_18%),linear-gradient(180deg,#060609_0%,#07070a_52%,#050507_100%)]" />
        <div className="noise-mask absolute inset-0 opacity-18" />

        <motion.div
          ref={visRef}
          style={{ opacity: canvasOpacity, willChange: 'opacity' }}
          className="absolute inset-0"
        >
          <Suspense
            fallback={
              <div className="h-full w-full bg-[radial-gradient(circle_at_60%_42%,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.03)_20%,transparent_60%)]" />
            }
          >
            {/* Using the SOTA OffscreenHero for independent Main Thread performance */}
            <OffscreenHero 
              isVisible={isVisible} 
              scrubProgress={scrubProgress} 
            />
          </Suspense>
        </motion.div>

        <motion.div
          style={{ opacity: festOpacity, scale: festScale }}
          className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center overflow-hidden"
        >
          <div className="relative flex h-full w-full items-center justify-center">
            {/* High-performance Glow Core */}
            <div 
              className="absolute w-[65vw] max-w-[1000px] h-[35vw] max-h-[500px] rounded-[50%] bg-[#ba54ff]/15 blur-[120px] pointer-events-none opacity-60" 
              style={{ willChange: 'transform' }}
            />

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
              style={{ willChange: 'transform' }}
              className="absolute h-[28vw] w-[54vw] rounded-[50%] border border-white/40 opacity-80 shadow-[0_0_15px_rgba(255,255,255,0.1)_inset]"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
              style={{ willChange: 'transform' }}
              className="absolute h-[22vw] w-[40vw] rounded-[50%] border border-white/35 opacity-75 shadow-[0_0_12px_rgba(255,255,255,0.08)_inset]"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              style={{ willChange: 'transform' }}
              className="absolute h-[36vw] w-[60vw] rounded-[50%] border border-white/30 opacity-65 shadow-[0_0_20px_rgba(255,255,255,0.05)_inset]"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
              style={{ willChange: 'transform' }}
              className="absolute h-[18vw] w-[32vw] rounded-[50%] border border-white/30 opacity-70 shadow-[0_0_10px_rgba(255,255,255,0.08)_inset]"
            />
            <img
              src={festLogo}
              alt="FEST Dance Company Logo - Premium Movement Direction & Choreography"
              fetchPriority="high"
              loading="eager"
              width={1400}
              height={360}
              className="pointer-events-none absolute left-1/2 w-[85vw] max-w-[1400px] -translate-x-1/2 object-contain opacity-55 md:opacity-65"
              style={{
                willChange: 'transform',
              }}
            />
          </div>
        </motion.div>

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,6,9,0.88)_0%,rgba(6,6,9,0.64)_28%,rgba(6,6,9,0.16)_58%,rgba(6,6,9,0.74)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,6,9,0.28)_0%,rgba(6,6,9,0.08)_24%,rgba(6,6,9,0.16)_66%,rgba(6,6,9,0.72)_100%)]" />

        <motion.div
          style={{ y: textY, opacity: textOpacity, willChange: 'transform, opacity' }}
          className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[1440px] flex-col justify-center px-[clamp(1rem,0.8rem+1vw,2.5rem)] pt-[12dvh] pb-[6dvh]"
        >
          <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(260px,0.34fr)] lg:items-end">
            <div className="max-w-[620px]">
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.15 }}
                className="mb-2 text-fluid-small uppercase tracking-[0.42em] text-white/54 md:mb-5"
              >
                {t.heroKicker}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.22 }}
                className="mb-1 text-[0.72rem] uppercase tracking-[0.34em] text-white/36 md:mb-6"
              >
                {brand.name}
              </motion.p>

                <motion.h1
                  className="font-display text-fluid-hero uppercase leading-[0.82] tracking-[0.02em] text-white"
                >
                  {t.heroVisualLines.map((line, i) => (
                    <motion.span
                      key={line}
                      initial={{ opacity: 0, y: 40, rotateX: -30 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{ duration: 1, delay: 0.2 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                      className="block origin-top"
                    >
                      {line}
                    </motion.span>
                  ))}
                </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.72, delay: 0.36 }}
                className="mt-3 max-w-[30rem] text-fluid-body leading-relaxed text-white/76 md:mt-6"
              >
                {t.heroHeadline}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.66, delay: 0.54 }}
                className="mt-6 flex flex-wrap gap-2 md:mt-10 md:gap-3"
              >
                <PrimaryButton href="#kontakt">{t.ctaPrimary}</PrimaryButton>
                <PrimaryButton href="#portfolio" variant="ghost">
                  {t.ctaSecondary}
                </PrimaryButton>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.78, delay: 0.42 }}
              className="w-full max-w-[340px] justify-self-end border-t border-white/10 pt-4 md:pt-6"
            >
              <p className="text-[0.88rem] leading-7 text-white/50 md:text-fluid-body md:leading-8">
                {t.heroBody}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Desktop-only vertical detail */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.2 }}
          className="hidden lg:block absolute bottom-12 right-12 pointer-events-none"
        >
          <p className="text-[0.6rem] uppercase tracking-[0.6em] text-white/15 [writing-mode:vertical-lr]">
            {t.estLine}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
