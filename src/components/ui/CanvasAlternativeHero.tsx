import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Center, Float, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import festLogo from '../../assets/logo/logo-cropped.png?format=webp&w=1200&as=url'

function LogoMesh({ isVisible }: { isVisible: boolean }) {
  const meshRef = useRef<THREE.Group>(null)
  const texture = useTexture(festLogo)

  const { viewport } = useThree()
  
  // Responsive scaling
  const scale = useMemo(() => {
    return viewport.width > 5 ? 5 : viewport.width * 0.9
  }, [viewport.width])

  useFrame((state) => {
    if (!isVisible || !meshRef.current) return
    
    // Parallax mouse effect
    const targetX = (state.pointer.x * viewport.width) / 10
    const targetY = (state.pointer.y * viewport.height) / 10
    
    meshRef.current.rotation.y += (targetX * 0.1 - meshRef.current.rotation.y) * 0.05
    meshRef.current.rotation.x += (-targetY * 0.1 - meshRef.current.rotation.x) * 0.05
  })

  // Create a pseudo-3D layered neon effect
  const layers = 6
  const spacing = 0.05

  return (
    <group ref={meshRef}>
      {Array.from({ length: layers }).map((_, i) => {
        const isFront = i === layers - 1
        return (
          <mesh key={i} position={[0, 0, (i - layers / 2) * spacing]}>
            <planeGeometry args={[scale, scale * (373 / 1311)]} />
            <meshBasicMaterial
              map={texture}
              transparent
              opacity={isFront ? 1 : 0.15 - (i * 0.02)}
              color={isFront ? '#ffffff' : '#c850ff'}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export default function CanvasAlternativeHero({ isVisible }: { isVisible: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.5} />
      <Float
        speed={2.5}
        rotationIntensity={0.2}
        floatIntensity={0.5}
        floatingRange={[-0.1, 0.1]}
      >
        <Center>
          <LogoMesh isVisible={isVisible} />
        </Center>
      </Float>
    </Canvas>
  )
}
