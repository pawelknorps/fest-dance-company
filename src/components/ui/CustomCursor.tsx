import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CustomCursor() {
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  const [isHovered, setIsHovered] = useState(false)
  const [cursorText, setCursorText] = useState('')

  useEffect(() => {
    // Check if device supports hover (ignore on mobile)
    if (window.matchMedia('(hover: none)').matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const interactiveEl = target.closest('a, button, input, [data-cursor]')
      
      if (interactiveEl) {
        setIsHovered(true)
        const text = interactiveEl.getAttribute('data-cursor')
        if (text) setCursorText(text)
        else setCursorText('')
      } else {
        setIsHovered(false)
        setCursorText('')
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseover', handleMouseOver)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [cursorX, cursorY])

  // Hide on mobile
  if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) {
    return null;
  }

  return (
    <div className="hidden lg:block">
      {/* Disco Ball Dot */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[100] h-3 w-3 rounded-full overflow-hidden shadow-[0_0_10px_rgba(255,255,255,0.4)] border border-white/10"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
          background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #808080 45%, #111111 100%)',
        }}
        animate={{
          opacity: isHovered ? 0 : 1,
          scale: isHovered ? 0.5 : 1,
        }}
      >
        {/* Tile Grid */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)
            `,
            backgroundSize: '2px 2px',
          }}
        />

        {/* Specular Sparkles */}
        <motion.div
          className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0,rgba(255,255,255,0.5)_10deg,transparent_20deg,transparent_170deg,rgba(255,255,255,0.5)_180deg,transparent_190deg)]"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />

        {/* Subtle Color Shimmer */}
        <motion.div
          className="absolute inset-0 mix-blend-overlay opacity-20"
          animate={{
            background: [
              'linear-gradient(135deg, #ff0080 0%, #7928ca 100%)',
              'linear-gradient(135deg, #0070f3 0%, #00dfd8 100%)',
              'linear-gradient(135deg, #ff0080 0%, #7928ca 100%)',
            ]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
      {/* Circle / Ring / Text Container */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[100] flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isHovered ? 72 : 32,
          height: isHovered ? 72 : 32,
          opacity: isHovered ? 1 : 0,
        }}
      >
        {isHovered && cursorText && (
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[10px] font-bold tracking-widest text-white uppercase text-center leading-none"
          >
            {cursorText}
          </motion.span>
        )}
      </motion.div>
    </div>
  )
}
