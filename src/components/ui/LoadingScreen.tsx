import { useEffect, useState } from 'react'
import { brand } from '../../data/brand'

export function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [isFinishing, setIsFinishing] = useState(false)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    
    // Fast initial tick for "feel"
    const startProgress = () => {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) { // Hold at 90% until real load if fast
            return prev
          }
          const diff = Math.random() * 12 + 4
          return Math.min(prev + diff, 90)
        });
      }, 60)
    }

    const handleLoad = () => {
      clearInterval(interval)
      setProgress(100)
    }

    startProgress()

    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad)
      // Safety timeout to ensure loader doesn't hang indefinitely
      const safety = setTimeout(handleLoad, 2500)
      return () => {
        clearInterval(interval)
        clearTimeout(safety)
        window.removeEventListener('load', handleLoad)
      }
    }
  }, [])

  useEffect(() => {
    if (progress === 100) {
      const finishTimer = setTimeout(() => setIsFinishing(true), 150)
      const hideTimer = setTimeout(() => setIsVisible(false), 550)
      return () => {
        clearTimeout(finishTimer)
        clearTimeout(hideTimer)
      }
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
