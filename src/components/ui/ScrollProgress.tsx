import { m, useScroll, useSpring } from 'framer-motion'
import { useEffect, useRef } from 'react'

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return scaleX.on("change", (v: number) => {
      if (ref.current) {
        ref.current.style.transform = `scaleX(${v})`
      }
    })
  }, [scaleX])

  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 right-0 z-[110] h-[2px] bg-gradient-to-r from-fuchsia-600 via-purple-500 to-transparent origin-left"
      style={{ transform: `scaleX(0)` }}
    />
  )
}
