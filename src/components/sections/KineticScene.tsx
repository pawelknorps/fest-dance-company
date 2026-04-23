import { Sparkles, PerspectiveCamera } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

export function KineticScene({ 
  isMobile, 
  velocityRef,
  isIntersecting
}: { 
  isMobile?: boolean,
  velocityRef: React.MutableRefObject<number>,
  isIntersecting: boolean
}) {
  const accentLightRef = useRef<THREE.PointLight>(null)
  const sparklesGroupRef = useRef<THREE.Group>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)

  useFrame((state) => {
    if (!isIntersecting) return
    const velocity = velocityRef.current || 0

    if (cameraRef.current) {
      const targetFOV = 40 + velocity * 1.5
      cameraRef.current.fov = THREE.MathUtils.lerp(cameraRef.current.fov, targetFOV, 0.05)
      cameraRef.current.updateProjectionMatrix()
      
      cameraRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.08
      cameraRef.current.position.y = Math.cos(state.clock.elapsedTime * 0.2) * 0.05
    }

    if (accentLightRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 0.7) * 0.2 + 0.8
      accentLightRef.current.intensity = pulse * (2.2 + velocity * 2.0)
    }

    if (sparklesGroupRef.current) {
      sparklesGroupRef.current.rotation.y += 0.001 + velocity * 0.015
      // Pulsing opacity for sparkles
      sparklesGroupRef.current.position.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.5
    }
  })

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 8]} fov={40} />
      
      <color attach="background" args={['#05030a']} />
      <fog attach="fog" args={['#08040d', 5, 26]} />

      <ambientLight intensity={0.3} />
      
      <spotLight
        position={[10, 15, 10]}
        angle={0.15}
        penumbra={1}
        intensity={3.5}
        color="#ffffff"
      />
      
      <spotLight
        position={[-12, 5, 8]}
        angle={0.4}
        penumbra={1}
        intensity={1.8}
        color="#9333ea"
      />
      
      <pointLight
        ref={accentLightRef}
        position={[0, 3, -7]}
        intensity={2.5}
        color="#c084fc"
        distance={25}
      />

      {/* Atmospheric Particles — Enhanced visibility around the cards */}
      {!isMobile && (
        <group ref={sparklesGroupRef} position={[0, 0, 2]}>
          {/* Main Gold Dust — concentrated around cards */}
          <Sparkles
            count={60}
            scale={[18, 10, 10]}
            size={2.5}
            speed={0.4}
            opacity={0.8}
            color="#ffd700"
            noise={0.8}
          />
          {/* Ambient Violet Particles */}
          <Sparkles
            count={100}
            scale={[25, 15, 15]}
            size={1.2}
            speed={0.8}
            opacity={0.4}
            color="#d8b4fe"
            noise={1.5}
          />
          {/* Deep Rim Particles */}
          <Sparkles
            count={40}
            scale={[30, 20, 20]}
            size={0.8}
            speed={1.2}
            opacity={0.3}
            color="#ffffff"
            noise={2.0}
          />
        </group>
      )}
    </>
  )
}

export default KineticScene
