import { PerspectiveCamera } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { MathUtils } from 'three'
import type { PointLight, PerspectiveCamera as PerspectiveCameraType } from 'three'
import { ParticleRiver } from './ParticleRiver'

export function KineticScene({
  isMobile,
  velocityRef,
  isIntersecting
}: {
  isMobile?: boolean,
  velocityRef: React.MutableRefObject<number>,
  isIntersecting: boolean
}) {
  const accentLightRef = useRef<PointLight>(null)
  const cameraRef = useRef<PerspectiveCameraType>(null)

  useFrame((state) => {
    if (!isIntersecting) return
    const velocity = velocityRef.current || 0

    if (cameraRef.current) {
      const targetFOV = 40 + velocity * 1.5
      cameraRef.current.fov = MathUtils.lerp(cameraRef.current.fov, targetFOV, 0.05)
      cameraRef.current.updateProjectionMatrix()
      
      cameraRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.08
      cameraRef.current.position.y = Math.cos(state.clock.elapsedTime * 0.2) * 0.05
    }

    if (accentLightRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 0.7) * 0.2 + 0.8
      accentLightRef.current.intensity = pulse * (2.2 + velocity * 2.0)
    }
  })

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 8]} fov={40} />
      
      <color attach="background" args={['#05030a']} />
      <fog attach="fog" args={['#08040d', 5, 26]} />

      <ambientLight intensity={0.3} />
      <spotLight position={[10, 15, 10]} angle={0.15} penumbra={1} intensity={3.5} color="#ffffff" />
      <pointLight ref={accentLightRef} position={[0, 3, -7]} intensity={2.5} color="#c084fc" distance={25} />

      {/* SOTA Particle River — True kinetic flowing light river */}
      <group position={[0, 0, -1]}>
        <ParticleRiver 
          particleCount={isMobile ? 800 : 2500} 
          width={45} 
          velocityRef={velocityRef} 
          isMobile={isMobile}
        />
      </group>
    </>
  )
}

export default KineticScene
