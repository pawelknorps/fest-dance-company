import { Sparkles, PerspectiveCamera, MeshTransmissionMaterial } from '@react-three/drei'
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
  const glassRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!isIntersecting) return
    const velocity = velocityRef.current || 0

    // SOTA Quality Camera Interaction
    if (cameraRef.current) {
      const targetFOV = 40 + velocity * 1.8
      cameraRef.current.fov = THREE.MathUtils.lerp(cameraRef.current.fov, targetFOV, 0.05)
      cameraRef.current.updateProjectionMatrix()
      
      cameraRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.12
      cameraRef.current.position.y = Math.cos(state.clock.elapsedTime * 0.2) * 0.08
    }

    if (accentLightRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 0.7) * 0.25 + 0.75
      accentLightRef.current.intensity = pulse * (2.8 + velocity * 2.5)
    }

    if (sparklesGroupRef.current) {
      sparklesGroupRef.current.rotation.y += 0.001 + velocity * 0.015
    }

    if (glassRef.current) {
      glassRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 8]} fov={40} />
      
      <color attach="background" args={['#05030a']} />
      <fog attach="fog" args={['#08040d', 5, 26]} />

      <ambientLight intensity={0.2} />
      
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
        intensity={2.0}
        color="#9333ea"
      />
      
      <pointLight
        ref={accentLightRef}
        position={[0, 3, -7]}
        intensity={3.0}
        color="#c084fc"
        distance={25}
      />

      {/* SOTA Quality Physical Refraction */}
      {!isMobile && (
        <mesh ref={glassRef} position={[0, 0, -8]} scale={25}>
          <planeGeometry args={[1, 1]} />
          <MeshTransmissionMaterial
            backside
            samples={6} // High quality samples
            resolution={512}
            thickness={2.5}
            chromaticAberration={0.05}
            anisotropy={0.1}
            distortion={0.1}
            distortionScale={0.2}
            temporalDistortion={0.1}
            clearcoat={1}
            attenuationDistance={0.5}
            attenuationColor="#ffffff"
            color="#08040d"
          />
        </mesh>
      )}

      {/* Atmospheric Particles */}
      {!isMobile && (
        <group ref={sparklesGroupRef}>
          <Sparkles
            count={45}
            scale={22}
            size={1.8}
            speed={0.25}
            opacity={0.5}
            color="#ffd700"
            noise={0.6}
          />
          <Sparkles
            count={70}
            scale={35}
            size={0.8}
            speed={0.6}
            opacity={0.25}
            color="#d8b4fe"
            noise={1.2}
          />
        </group>
      )}
    </>
  )
}

export default KineticScene
