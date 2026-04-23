import { Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type * as THREE from 'three'

export function KineticScene({ 
  isMobile, 
  velocityRef 
}: { 
  isMobile?: boolean,
  velocityRef: React.MutableRefObject<number>,
  isIntersecting: boolean
}) {
  const accentLightRef = useRef<THREE.PointLight>(null)
  const sparklesVisibleRef = useRef(true)

  const sparklesGroupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!isIntersecting) return
    if (accentLightRef.current) {
      // Slow pulse on the rear accent light
      const pulse = Math.sin(state.clock.elapsedTime * 0.7) * 0.25 + 0.75
      accentLightRef.current.intensity = pulse * 2.2
    }

    // Optimization: Hide sparkles if scrolling very fast to save GPU cycles
    if (sparklesGroupRef.current && velocityRef?.current !== undefined) {
      sparklesGroupRef.current.visible = velocityRef.current < 0.12
    }
  })

  return (
    <>
      {/* Deep purple-black background */}
      <color attach="background" args={['#070410']} />
      <fog attach="fog" args={['#110814', 5, 26]} />

      {/* 3-point studio lighting */}
      <ambientLight intensity={0.12} />
      {/* Key light — warm white from top-right */}
      <spotLight
        position={[6, 8, 6]}
        angle={0.22}
        penumbra={1}
        intensity={2.8}
        color="#fff5f0"
      />
      {/* Fill light — cool purple from left */}
      <spotLight
        position={[-7, 3, 4]}
        angle={0.3}
        penumbra={1}
        intensity={1.2}
        color="#c084fc"
      />
      {/* Rim / backlight — pulsing accent from behind */}
      <pointLight
        ref={accentLightRef}
        position={[0, 1, -5]}
        intensity={2.2}
        color="#b866ff"
        distance={14}
      />

      {/* Overdraw optimization: Sparkles disabled on mobile */}
      {!isMobile && (
        <group ref={sparklesGroupRef}>
          {/* Gold dust — slow, dreamy stage atmosphere */}
          <Sparkles
            count={28}
            scale={18}
            size={1.6}
            speed={0.18}
            opacity={0.45}
            color="#ffd700"
            noise={0.4}
          />
          {/* Soft violet particles — finer, quicker */}
          <Sparkles
            count={44}
            scale={24}
            size={0.7}
            speed={0.55}
            opacity={0.18}
            color="#ddc0ff"
            noise={1.2}
          />
        </group>
      )}

      {/* Post-processing disabled for absolute stability */}
    </>
  )
}
