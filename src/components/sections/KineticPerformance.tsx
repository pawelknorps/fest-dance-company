import { useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'

export function KineticPerformance() {
  const { gl } = useThree()

  return (
    <PerformanceMonitor
      onIncline={() => gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))}
      onDecline={() => gl.setPixelRatio(1)}
    />
  )
}
