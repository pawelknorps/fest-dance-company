import { useRef, useMemo, Suspense, useState, useEffect } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'

interface KineticCardProps {
  item: any
  index: number
  count: number
  progress: any
  velocityRef: React.MutableRefObject<number>
}

export function KineticCard(props: KineticCardProps) {
  // Stagger visibility, not loading.
  // We want the network to start immediately for all, but cards to "appear" in sequence.
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShouldShow(true), props.index * 60)
    return () => clearTimeout(timer)
  }, [props.index])

  return (
    <Suspense fallback={<CardPlaceholder {...props} />}>
      <CardContent {...props} isVisible={shouldShow} />
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

function CardContent({ item, index, count, progress, velocityRef, isVisible }: KineticCardProps & { isVisible: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  
  // SOTA: Use ImageBitmapLoader to decode images on a background thread (Web Worker).
  // This eliminates Main Thread "jank" during image decoding.
  const imageBitmap = useLoader(THREE.ImageBitmapLoader, item.image.src, (loader: any) => {
    if (loader.setOptions) {
      loader.setOptions({ imageOrientation: 'flipY' })
    }
  })
  
  const texture = useMemo(() => {
    if (!imageBitmap) return null
    const tex = new THREE.Texture(imageBitmap)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    // We handle flip in the loader options above for better performance
    tex.needsUpdate = true 
    return tex
  }, [imageBitmap])

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
    
    // Smoothly fade in only if staggered visibility is ready
    const targetOpacity = isVisible ? baseOpacity : 0
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.12)
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
