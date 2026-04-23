import { useRef, useMemo, Suspense, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

interface KineticCardProps {
  item: any
  index: number
  count: number
  progress: any
  velocityRef: React.MutableRefObject<number>
}

export function KineticCard(props: KineticCardProps) {
  const [shouldLoad, setShouldLoad] = useState(false)

  // 1. Staggered priority loading - sequential trigger from left to right
  useEffect(() => {
    // 80ms stagger is enough to feel sequential without being slow
    const timer = setTimeout(() => setShouldLoad(true), props.index * 80)
    return () => clearTimeout(timer)
  }, [props.index])

  return (
    <Suspense fallback={<CardPlaceholder {...props} />}>
      {shouldLoad ? <CardContent {...props} /> : <CardPlaceholder {...props} />}
    </Suspense>
  )
}

function CardPlaceholder({ index, count, progress }: Omit<KineticCardProps, 'item' | 'velocityRef'>) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!groupRef.current) return
    const scrollVal = progress.get() * (count - 1)
    const offset = index - scrollVal
    const absOffset = Math.abs(offset)
    const radius = 12
    const angle = offset * 0.35
    const x = Math.sin(angle) * radius
    const zOffset = (1 - Math.min(absOffset * 0.8, 1)) * 1.5
    const z = (Math.cos(angle) * radius) - radius + zOffset
    groupRef.current.position.set(x, 0, z)
    groupRef.current.rotation.y = angle * 1.1
    const s = 1.05 - Math.min(absOffset * 0.2, 0.35)
    groupRef.current.scale.set(s, s, s)
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <planeGeometry args={[4.8, 4.8]} />
        <meshBasicMaterial color="#050505" transparent opacity={0.15} />
      </mesh>
    </group>
  )
}

function CardContent({ item, index, count, progress, velocityRef }: KineticCardProps) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  
  // hook only called when component is rendered by KineticCard (staggered)
  const texture = useTexture(item.image.src)
  
  useMemo(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = 4 // Balanced for speed and quality
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
    }
  }, [texture])

  const { cardW, cardH } = useMemo(() => {
    const w = item.image.width || 567
    const h = item.image.height || 423
    const aspect = w / h
    const cH = 4.8
    const cW = aspect < 1 ? cH * aspect : Math.min(aspect * 3.0, 7.0)
    return { cardW: cW, cardH: cH }
  }, [item.image.width, item.image.height])

  useFrame(() => {
    if (!groupRef.current || !meshRef.current) return

    const scrollVal = progress.get() * (count - 1)
    const offset = index - scrollVal
    const absOffset = Math.abs(offset)
    const velocity = velocityRef.current

    const radius = 12
    const angle = offset * 0.35
    const x = Math.sin(angle) * radius
    const zOffset = (1 - Math.min(absOffset * 0.8, 1)) * 1.5
    const z = (Math.cos(angle) * radius) - radius + zOffset
    
    groupRef.current.position.set(x, 0, z)
    groupRef.current.rotation.y = angle * 1.1

    const tilt = velocity * offset * 0.15
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -tilt, 0.1)
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, absOffset * 0.08, 0.1)

    const s = 1.05 - Math.min(absOffset * 0.2, 0.35)
    groupRef.current.scale.set(s, s, s)

    const mat = meshRef.current.material as THREE.MeshBasicMaterial
    const baseOpacity = 1 - Math.min(absOffset * 0.45, 0.98)
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, baseOpacity, 0.15)
  })

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} frustumCulled={false}>
        <planeGeometry args={[cardW, cardH]} />
        <meshBasicMaterial 
          map={texture} 
          transparent 
          opacity={0} 
          color="#ffffff"
        />
      </mesh>
    </group>
  )
}
