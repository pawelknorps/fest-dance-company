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

    // Optimized Camera Interaction
    if (cameraRef.current) {
      const targetFOV = 40 + velocity * 1.5
      cameraRef.current.fov = THREE.MathUtils.lerp(cameraRef.current.fov, targetFOV, 0.05)
      cameraRef.current.updateProjectionMatrix()
      
      cameraRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.08
      cameraRef.current.position.y = Math.cos(state.clock.elapsedTime * 0.2) * 0.05
    }

    if (accentLightRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 0.7) * 0.2 + 0.8
      accentLightRef.current.intensity = pulse * (2.5 + velocity * 2.0)
    }

    if (sparklesGroupRef.current) {
      sparklesGroupRef.current.rotation.y += 0.001 + velocity * 0.012
    }

    if (glassRef.current) {
      glassRef.current.rotation.y = state.clock.elapsedTime * 0.03
    }
  })

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 8]} fov={40} />
      
      <color attach="background" args={['#05030a']} />
      <fog attach="fog" args={['#08040d', 6, 26]} />

      <ambientLight intensity={0.2} />
      
      <spotLight
        position={[10, 15, 10]}
        angle={0.15}
        penumbra={1}
        intensity={3}
        color="#ffffff"
      />
      
      <spotLight
        position={[-12, 5, 8]}
        angle={0.4}
        penumbra={1}
        intensity={1.5}
        color="#9333ea"
      />
      
      <pointLight
        ref={accentLightRef}
        position={[0, 3, -7]}
        intensity={2.5}
        color="#c084fc"
        distance={25}
      />

      {/* Optimized Physical Refraction Element */}
      {!isMobile && (
        <mesh ref={glassRef} position={[0, 0, -8]} scale={25}>
          <planeGeometry args={[1, 1]} />
          <MeshTransmissionMaterial
            backside
            samples={2} // Reduced samples for optimization
            resolution={256} // Reduced resolution
            thickness={2.0}
            chromaticAberration={0.03}
            anisotropy={0.05}
            distortion={0.05}
            clearcoat={0.5}
            attenuationDistance={1.0}
            attenuationColor="#ffffff"
            color="#08040d"
          />
        </mesh>
      )}

      {/* Atmospheric Particles */}
      {!isMobile && (
        <group ref={sparklesGroupRef}>
          <Sparkles
            count={30} // Reduced count
            scale={20}
            size={1.5}
            speed={0.2}
            opacity={0.4}
            color="#ffd700"
            noise={0.5}
          />
          <Sparkles
            count={50} // Reduced count
            scale={30}
            size={0.6}
            speed={0.5}
            opacity={0.2}
            color="#d8b4fe"
            noise={1.0}
          />
        </group>
      )}
    </>
  )
}

export default KineticScene
