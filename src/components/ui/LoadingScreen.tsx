import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { brand } from '../../data/brand'

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // SOTA Snappy Loading Logic
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          // Instant release once 100 is reached
          setTimeout(() => setIsVisible(false), 150)
          return 100
        }
        // Faster increments for snappier feedback
        return prev + Math.random() * 25
      })
    }, 45)

    // Fallback: Force clear if page is fully loaded
    const handleLoad = () => setProgress(100)
    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad)
    }

    return () => {
      clearInterval(timer)
      window.removeEventListener('load', handleLoad)
    }
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          exit={{ opacity: 0, y: '-100%' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] text-white relative"
          style={{ position: 'fixed' }}
        >
          <div className="relative mb-8 h-px w-64 overflow-hidden bg-white/10">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-fuchsia-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <img src={brand.logo} alt="FEST" className="h-6 opacity-40 grayscale contrast-200" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">
              {Math.round(progress)}%
            </span>
          </motion.div>

          <div className="absolute bottom-10 text-[9px] uppercase tracking-[0.5em] text-white/10">
            Premium Choreography & Movement
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
