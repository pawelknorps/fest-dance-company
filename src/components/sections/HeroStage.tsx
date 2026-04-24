import { lazy, Suspense, useEffect, useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { brand } from '../../data/brand'
import { siteCopy as plCopy } from '../../content/site-copy'
import { useHeroMediaVisibility } from '../../hooks/useHeroMediaVisibility'
import { PrimaryButton } from '../ui/PrimaryButton'
import festLogo from '../../assets/logo/fest-logo.png?format=webp&w=1400&q=90&as=url'
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

  const canvasRef = useRef<HTMLDivElement>(null)
  const festRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsubCanvas = canvasOpacity.on("change", v => {
      if (canvasRef.current) canvasRef.current.style.opacity = String(v)
    })
    const unsubFest = festOpacity.on("change", v => {
      if (festRef.current) festRef.current.style.opacity = String(v)
    })
    const unsubFestScale = festScale.on("change", v => {
      if (festRef.current) festRef.current.style.transform = `scale(${v})`
    })
    const unsubTextY = textY.on("change", v => {
      if (textRef.current) textRef.current.style.transform = `translateY(${v})`
    })
    const unsubTextOpacity = textOpacity.on("change", v => {
      if (textRef.current) textRef.current.style.opacity = String(v)
    })

    return () => {
      unsubCanvas()
      unsubFest()
      unsubFestScale()
      unsubTextY()
      unsubTextOpacity()
    }
  }, [canvasOpacity, festOpacity, festScale, textY, textOpacity])

  return (
    <section ref={sectionRef} id="top" className="relative isolate h-[250dvh] bg-[#060609]">
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_42%,rgba(184,92,255,0.16),transparent_0_18%),linear-gradient(180deg,#060609_0%,#07070a_52%,#050507_100%)]" />
        <div className="noise-mask absolute inset-0 opacity-18" />

        <div
          ref={canvasRef}
          style={{ opacity: 0, willChange: 'opacity' }}
          className="absolute inset-0"
        >
          <Suspense
            fallback={
              <div className="h-full w-full bg-[radial-gradient(circle_at_60%_42%,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.03)_20%,transparent_60%)]" />
            }
          >
            <OffscreenHero 
              isVisible={isVisible} 
              scrubProgress={scrubProgress} 
            />
          </Suspense>
        </div>

        <div
          ref={festRef}
          style={{ opacity: 1, transform: 'scale(1)' }}
          className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center overflow-hidden"
        >
          <div className="relative flex h-full w-full items-center justify-center">
            <div 
              className="absolute w-[65vw] max-w-[1000px] h-[35vw] max-h-[500px] rounded-[50%] bg-[#ba54ff]/15 blur-[120px] pointer-events-none opacity-60" 
              style={{ willChange: 'transform' }}
            />

            <img
              src={festLogo}
              alt="FEST Dance Company Logo"
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
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,6,9,0.88)_0%,rgba(6,6,9,0.64)_28%,rgba(6,6,9,0.16)_58%,rgba(6,6,9,0.74)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,6,9,0.28)_0%,rgba(6,6,9,0.08)_24%,rgba(6,6,9,0.16)_66%,rgba(6,6,9,0.72)_100%)]" />

        <div
          ref={textRef}
          style={{ opacity: 1, transform: 'translateY(0%)', willChange: 'transform, opacity' }}
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

                <h1
                  className="font-display text-fluid-hero uppercase leading-[0.82] tracking-[0.02em] text-white"
                >
                  {t.heroVisualLines.map((line, i) => (
                    <motion.span
                      key={line}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1, delay: 0.2 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                      className="block origin-top"
                    >
                      {line}
                    </motion.span>
                  ))}
                </h1>

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
        </div>

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
