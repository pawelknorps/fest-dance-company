import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { brand } from '../../data/brand'

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const [isFinishing, setIsFinishing] = useState(false)

  useEffect(() => {
    // SOTA Snappy Loading Logic
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          setIsFinishing(true)
          // Instant release once 100 is reached
          setTimeout(() => setIsVisible(false), 200)
          return 100
        }
        // Faster increments for snappier feedback
        return prev + Math.random() * 20
      })
    }, 40)

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
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] text-white ${isFinishing ? 'pointer-events-none' : 'pointer-events-auto'}`}
        >
          <div className="relative mb-8 h-px w-64 overflow-hidden bg-white/10">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.5)]"
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
