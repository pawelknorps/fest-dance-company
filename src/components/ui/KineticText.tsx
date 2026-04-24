import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useVelocity, useSpring } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  text?: string
  children: ReactNode
  className?: string
  inView?: boolean
  delay?: number
}

/**
 * SOTA Kinetic Typography
 * Implements scroll-velocity based skewing on large text elements.
 */
export function KineticText({ text, children, className = '', inView }: Partial<Props> & { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  const scrollVelocity = useVelocity(scrollYProgress)
  const skewX = useSpring(useTransform(scrollVelocity, [-1, 1], [-15, 15]), {
    stiffness: 100,
    damping: 30
  })

  return (
    <motion.div
      ref={ref}
      style={{ skewX }}
      className={`inline-block ${className}`}
    >
      {text ?? children}
    </motion.div>
  )
}
