import { useState, useEffect } from 'react'

export const DeviceTier = {
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3, // DOM Fallback
} as const

export type DeviceTierType = typeof DeviceTier[keyof typeof DeviceTier]

/**
 * SOTA Device Benchmarking Hook
 * Categorizes devices based on GPU capabilities and connection.
 */
export function useDeviceTier() {
  const [tier, setTier] = useState<DeviceTierType>(DeviceTier.MEDIUM)

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkTier = () => {
      // 1. Basic Capabilities Check
      const canvas = document.createElement('canvas')
      const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
      
      if (!gl) {
        setTier(DeviceTier.LOW)
        return
      }

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      const renderer = debugInfo ? (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string) : ''
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                       (navigator.maxTouchPoints > 0 && /Macintosh/.test(navigator.userAgent)); // Modern iPad detection
      
      // 2. Hardware-specific Low Tiers (e.g., low-end Android, old iPhones)
      const lowEndGpus = ['Mali-G', 'Adreno (TM) 4', 'Adreno (TM) 5', 'PowerVR']
      const isLowEndGpu = lowEndGpus.some(gpu => renderer.includes(gpu))

      // 3. Connection Check (Data Saver / Slow 3G)
      const nav = navigator as any
      const connection = nav.connection || nav.mozConnection || nav.webkitConnection
      const isSlow = connection && (connection.saveData || /2g|3g/.test(connection.effectiveType))

      if (isLowEndGpu || isSlow || isMobile) {
        // SOTA 2026 Decision: Mobile always gets the optimized DOM engine 
        // to guarantee 60fps and 100% render reliability on touch devices.
        setTier(DeviceTier.LOW)
      } else {
        setTier(DeviceTier.HIGH)
      }
    }

    checkTier()
  }, [])

  return tier
}
