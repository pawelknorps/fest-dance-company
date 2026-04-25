import { useEffect, useState, useRef } from 'react'
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

    const handleCustomCursorHover = (e: any) => {
      setIsHovered(true)
      setCursorText(e.detail)
    }

    const handleCustomCursorLeave = () => {
      setIsHovered(false)
      setCursorText('')
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseover', handleMouseOver)
    window.addEventListener('cursor-hover', handleCustomCursorHover)
    window.addEventListener('cursor-leave', handleCustomCursorLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseover', handleMouseOver)
      window.removeEventListener('cursor-hover', handleCustomCursorHover)
      window.removeEventListener('cursor-leave', handleCustomCursorLeave)
    }
  }, [cursorX, cursorY])

  // Hide on mobile
  if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) {
    return null;
  }

  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return

    const moveCursor = () => {
      const x = cursorXSpring.get()
      const y = cursorYSpring.get()
      
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${isHovered ? 0.5 : 1})`
        dotRef.current.style.opacity = isHovered ? '0' : '1'
      }
      
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
        ringRef.current.style.width = isHovered ? '72px' : '32px'
        ringRef.current.style.height = isHovered ? '72px' : '32px'
        ringRef.current.style.opacity = isHovered ? '1' : '0'
      }
      
      requestAnimationFrame(moveCursor)
    }

    const rafId = requestAnimationFrame(moveCursor)
    return () => cancelAnimationFrame(rafId)
  }, [cursorXSpring, cursorYSpring, isHovered])

  if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) {
    return null
  }

  return (
    <div className="hidden lg:block">
      {/* Disco Ball Dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[100] h-3 w-3 rounded-full overflow-hidden shadow-[0_0_10px_rgba(255,255,255,0.4)] border border-white/10 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #808080 45%, #111111 100%)',
          willChange: 'transform, opacity'
        }}
      >
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
        <div className="absolute inset-0 mix-blend-overlay opacity-20 animate-shimmer" />
      </div>

      {/* Circle / Ring / Text Container */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[100] flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mix-blend-difference transition-all duration-300"
        style={{ willChange: 'transform, width, height, opacity' }}
      >
        {isHovered && cursorText && (
          <span 
            className="text-[10px] font-bold tracking-widest text-white uppercase text-center leading-none"
          >
            {cursorText}
          </span>
        )}
      </div>
    </div>
  )
}
