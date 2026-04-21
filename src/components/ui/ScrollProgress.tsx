import { motion, useScroll, useSpring } from 'framer-motion'

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[110] h-[2px] bg-gradient-to-r from-fuchsia-600 via-purple-500 to-transparent origin-left"
      style={{ scaleX }}
    />
  )
}
