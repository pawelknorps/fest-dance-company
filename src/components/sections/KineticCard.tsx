import { useRef, useMemo, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useTranslation } from '../../lib/i18n'

interface KineticCardProps {
  item: any
  index: number
  count: number
  progress: any
  velocityRef: React.MutableRefObject<number>
}

const _pos = new THREE.Vector3()
const _scl = new THREE.Vector3()

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
  const titleRef = useRef<any>(null)
  const metaRef = useRef<any>(null)

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
    const cH = 4.0
    const cW = aspect < 1 ? cH * aspect : Math.min(aspect * 2.6, 5.2)
    return { cardW: cW, cardH: cH }
  }, [item.image.width, item.image.height])

  useFrame(() => {
    if (!groupRef.current || !meshRef.current) return

    const scrollVal = progress.get() * (count - 1)
    const offset = index - scrollVal
    const absOffset = Math.abs(offset)

    // Ultra-stable positioning (no parallax for now to fix the "disappearing" issue)
    _pos.set(offset * 5.0, 0, -absOffset * 2.6)
    groupRef.current.position.copy(_pos)

    // Simple rotation
    const targetRotY = -offset * 0.15
    groupRef.current.rotation.y = targetRotY

    // Simple scale
    const s = 1 - Math.min(absOffset * 0.18, 0.45)
    groupRef.current.scale.set(s, s, s)

    // Simple opacity
    const targetOpacity = 1 - Math.min(absOffset * 0.35, 0.9)
    const mat = meshRef.current.material as THREE.MeshBasicMaterial
    mat.opacity = targetOpacity

    // Text opacity
    const textAlpha = Math.max(0, 1 - absOffset * 2.2)
    if (titleRef.current) titleRef.current.fillOpacity = textAlpha
    if (metaRef.current) metaRef.current.fillOpacity = textAlpha * 0.7
  })

  const category =
    t.portfolioCategories?.[item?.category?.toLowerCase() as keyof typeof t.portfolioCategories] ??
    item?.category ?? ''

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} frustumCulled={false}>
        <planeGeometry args={[cardW, cardH]} />
        <meshBasicMaterial 
          map={texture} 
          transparent 
          opacity={0} 
        />
      </mesh>

      <Text
        ref={titleRef}
        position={[0, -(cardH / 2 + 0.45), 0.1]}
        fontSize={0.24}
        color="white"
        anchorX="center"
        textAlign="center"
        maxWidth={cardW + 1}
        frustumCulled={false}
      >
        {item.title}
      </Text>

      <Text
        ref={metaRef}
        position={[0, -(cardH / 2 + 0.75), 0.1]}
        fontSize={0.12}
        color="#c084fc"
        anchorX="center"
        letterSpacing={0.1}
        frustumCulled={false}
      >
        {`${item.role}  ·  ${category}`}
      </Text>
    </group>
  )
}
