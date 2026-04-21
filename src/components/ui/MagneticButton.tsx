import { useRef, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  onClick?: () => void
  /** Area around the button that triggers the magnetic effect (px) */
  hitPadding?: number
}

/**
 * SOTA Magnetic Button with Spring Physics
 * Based on the vector of the cursor entry.
 */
export function MagneticButton({ 
  children, 
  className = '', 
  onClick,
  hitPadding = 20 
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  
  // Spring physics params (SOTA spec: stiffness 150, damping 15)
  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 }
  
  const x = useSpring(0, springConfig)
  const y = useSpring(0, springConfig)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    
    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    
    // Calculate distance from center
    const centerX = left + width / 2
    const centerY = top + height / 2
    
    const distanceX = clientX - centerX
    const distanceY = clientY - centerY
    
    // Magnetic pull (strength decreases as distance increases)
    x.set(distanceX * 0.35)
    y.set(distanceY * 0.35)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative"
      style={{ padding: hitPadding }} // Hit area expansion
    >
      <motion.div
        style={{ x, y }}
        onClick={onClick}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  )
}
