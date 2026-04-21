import { motion } from 'framer-motion'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { KineticText } from './KineticText'

type SectionHeadingProps = {
  eyebrow?: string
  title: string
  copy?: string
  align?: 'left' | 'center'
}

export function SectionHeading({
  eyebrow,
  title,
  copy,
  align = 'left',
}: SectionHeadingProps) {
  const { ref, inView } = useScrollReveal<HTMLDivElement>({ margin: '-15% 0px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={[
        'max-w-3xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
      ].join(' ')}
    >
      {eyebrow ? (
        <p className="mb-4 text-sm uppercase tracking-[0.42em] text-white/45">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-5xl uppercase leading-[0.9] tracking-[0.08em] text-white md:text-7xl">
        <KineticText text={title} className="text-glow" inView={inView} />
      </h2>
      {copy ? (
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
          {copy}
        </p>
      ) : null}
    </motion.div>
  )
}
