import { useRef } from 'react'
import { motion, useScroll, useTransform, useVelocity, useSpring } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

/**
 * SOTA Kinetic Typography
 * Implements scroll-velocity based skewing on large text elements.
 */
export function KineticText({ children, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  // Calculate velocity of scroll
  const scrollVelocity = useVelocity(scrollYProgress)
  
  // Transform velocity into a skew angle
  // Apple-tier smoothness: spring physics on the transformation
  const skewRaw = useTransform(scrollVelocity, [-1, 1], [-20, 20])
  const skew = useSpring(skewRaw, { stiffness: 400, damping: 90 })

  return (
    <motion.div
      ref={ref}
      style={{ skewX: skew }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  )
}
