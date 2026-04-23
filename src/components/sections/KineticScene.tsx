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

    // Cinematic Camera Interaction
    // We subtely shift FOV based on velocity to create a "dolly zoom" feel
    if (cameraRef.current) {
      const targetFOV = 40 + velocity * 1.5
      cameraRef.current.fov = THREE.MathUtils.lerp(cameraRef.current.fov, targetFOV, 0.05)
      cameraRef.current.updateProjectionMatrix()
      
      // Gentle camera sway
      cameraRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
      cameraRef.current.position.y = Math.cos(state.clock.elapsedTime * 0.2) * 0.12
    }

    if (accentLightRef.current) {
      // Artistic pulsing light
      const pulse = Math.sin(state.clock.elapsedTime * 0.7) * 0.25 + 0.75
      accentLightRef.current.intensity = pulse * (2.2 + velocity * 2.0)
    }

    // Interactive Atmosphere
    if (sparklesGroupRef.current) {
      // Only show sparkles if movement is controlled
      sparklesGroupRef.current.visible = velocity < 0.25
      sparklesGroupRef.current.rotation.y += 0.001 + velocity * 0.01
    }
  })

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 8]} fov={40} />
      
      {/* Deep Artistic Background */}
      <color attach="background" args={['#05030a']} />
      <fog attach="fog" args={['#09050d', 6, 28]} />

      {/* Cinematic Lighting System */}
      <ambientLight intensity={0.15} />
      
      {/* Key light — dramatic top-right */}
      <spotLight
        position={[8, 12, 8]}
        angle={0.18}
        penumbra={1}
        intensity={3.5}
        color="#fffaf5"
        castShadow
      />
      
      {/* Fill light — artistic violet/indigo */}
      <spotLight
        position={[-10, 4, 6]}
        angle={0.4}
        penumbra={1}
        intensity={1.8}
        color="#a855f7"
      />
      
      {/* Rim light — back accent pulsing with movement */}
      <pointLight
        ref={accentLightRef}
        position={[0, 2, -6]}
        intensity={2.5}
        color="#c084fc"
        distance={20}
      />

      {/* Atmospheric Particles - Enhanced for Desktop */}
      {!isMobile && (
        <group ref={sparklesGroupRef}>
          {/* Main Stage Dust */}
          <Sparkles
            count={35}
            scale={20}
            size={1.8}
            speed={0.25}
            opacity={0.5}
            color="#ffd700"
            noise={0.5}
          />
          {/* Ambient Violet Essence */}
          <Sparkles
            count={60}
            scale={30}
            size={0.8}
            speed={0.6}
            opacity={0.25}
            color="#e9d5ff"
            noise={1.5}
          />
        </group>
      )}
    </>
  )
}

export default KineticScene
