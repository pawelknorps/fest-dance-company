import { useEffect, useState } from 'react'
import { brand } from '../../data/brand'
import { useLoadOrchestrator } from '../../lib/LoadOrchestrator'

export function LoadingScreen() {
  const realProgress = useLoadOrchestrator(s => s.totalProgress)
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [isFinishing, setIsFinishing] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (realProgress >= 1) return 100
        const target = realProgress > 0 ? Math.max(prev, realProgress * 100) : prev + 0.5
        if (target >= 100 && prev >= 99.9) return 100
        const isReady = target >= 100
        const diff = target - prev
        return prev + diff * (isReady ? 0.45 : 0.1) + (isReady ? 1.5 : 0.05)
      })
    }, 16)
    
    // Safety: maximum wait before forcing the screen away.
    // Kept short on mobile so LCP isn't gated on slow asset loads.
    const isMobile = window.innerWidth <= 768
    const safety = setTimeout(() => {
      setProgress(100)
    }, isMobile ? 800 : 2500)

    return () => {
      clearInterval(interval)
      clearTimeout(safety)
    }
  }, [realProgress])

  useEffect(() => {
    if (progress >= 100) {
      setIsFinishing(true)
      const hideTimer = setTimeout(() => setIsVisible(false), 400)
      return () => clearTimeout(hideTimer)
    }
  }, [progress])

  if (!isVisible) return null

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] text-white transition-opacity duration-400 ${isFinishing ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}
    >
      <div className="relative mb-8 h-px w-64 overflow-hidden bg-white/10">
        <div 
          className="absolute inset-y-0 left-0 bg-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.5)] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <img src={brand.logo} alt="FEST" className="h-6 opacity-40 grayscale contrast-200" />
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">
          {Math.round(progress)}%
        </span>
      </div>

      <div className="absolute bottom-10 text-[9px] uppercase tracking-[0.5em] text-white/10">
        Premium Choreography & Movement
      </div>
    </div>
  )
}
