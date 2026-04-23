import { useRef, useMemo, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useTranslation } from '../../lib/i18n'

interface KineticCardProps {
  item: any
  index: number
  count: number
  progress: any
  velocityRef: React.MutableRefObject<number>
}

export function KineticCard(props: KineticCardProps) {
  return (
    <Suspense fallback={null}>
      <CardContent {...props} />
    </Suspense>
  )
}

function CardContent({ item, index, count, progress, velocityRef }: KineticCardProps) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)

  const t = useTranslation()
  
  // Ensure we have a string URL (handles arrays/objects from vite-imagetools)
  const textureUrl = useMemo(() => {
    const src = item?.image?.src
    if (!src) return ''
    if (typeof src === 'string') return src
    if (Array.isArray(src)) return src[0]
    if (typeof src === 'object' && 'src' in src) return (src as any).src
    return ''
  }, [item?.image?.src])

  const texture = useTexture(textureUrl)
  
  const { cardW, cardH } = useMemo(() => {
    const w = item.image.width || 567
    const h = item.image.height || 423
    const aspect = w / h
    // Slightly larger cards for impact
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

    // 1. Curved arc positioning
    const radius = 12
    const angle = offset * 0.35
    const x = Math.sin(angle) * radius
    // More subtle Z "pop"
    const zOffset = (1 - Math.min(absOffset * 0.8, 1)) * 1.5
    const z = (Math.cos(angle) * radius) - radius + zOffset
    
    groupRef.current.position.set(x, 0, z)

    // 2. Orientation: Face the camera/center
    groupRef.current.rotation.y = angle * 1.1

    // 3. Velocity-based tilt (dynamic leaning)
    const tilt = velocity * offset * 0.15
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -tilt, 0.1)
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, absOffset * 0.08, 0.1)

    // 4. Scale effect: Subtle zoom
    const s = 1.05 - Math.min(absOffset * 0.2, 0.35)
    groupRef.current.scale.set(s, s, s)

    // 5. Opacity management
    const targetOpacity = 1 - Math.min(absOffset * 0.45, 0.98)
    const mat = meshRef.current.material as THREE.MeshBasicMaterial
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.15)
  })

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} frustumCulled={false}>
        <planeGeometry args={[cardW, cardH]} />
        <meshBasicMaterial 
          map={texture as THREE.Texture} 
          transparent 
          opacity={0} 
        />
      </mesh>
    </group>
  )
}
