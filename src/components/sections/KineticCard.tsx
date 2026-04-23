import { useRef, useMemo, Suspense, useState, useEffect } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'

interface KineticCardProps {
  item: any
  index: number
  count: number
  progress: any
  velocityRef: React.MutableRefObject<number>
  mouseRef: React.MutableRefObject<{ x: number, y: number }>
  isMobile: boolean
  isIntersecting: boolean
}

// Shared Geometry for all cards to reduce memory footprint
const sharedPlaneGeometry = new THREE.PlaneGeometry(1, 1)

// Artistic SOTA Shader Material
// Features: Chromatic Aberration, Edge Vignette, and Texture Filtering
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uOpacity;
  uniform float uDistortion;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    // Chromatic Aberration logic
    // We shift the Red and Blue channels slightly based on uDistortion (velocity)
    float r = texture2D(uTexture, vUv + vec2(uDistortion * 0.02, 0.0)).r;
    float g = texture2D(uTexture, vUv).g;
    float b = texture2D(uTexture, vUv - vec2(uDistortion * 0.02, 0.0)).b;
    
    vec3 color = vec3(r, g, b);
    
    // Smooth Edge Vignette / Card Masking
    float edgeX = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x);
    float edgeY = smoothstep(0.0, 0.08, vUv.y) * smoothstep(1.0, 0.92, vUv.y);
    float edgeMask = edgeX * edgeY;
    
    // Soft inner glow based on UV
    float glow = (1.0 - length(vUv - 0.5) * 1.5) * 0.15;
    color += vec3(0.6, 0.5, 0.8) * glow * uDistortion;
    
    gl_FragColor = vec4(color, uOpacity * edgeMask);
  }
`

export function KineticCard(props: KineticCardProps) {
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

function CardPlaceholder({ index, count, progress }: Omit<KineticCardProps, 'item' | 'velocityRef' | 'mouseRef' | 'isMobile'>) {
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
      <mesh geometry={sharedPlaneGeometry} scale={[4.8, 4.8, 1]}>
        <meshBasicMaterial color="#050505" transparent opacity={0.15} />
      </mesh>
    </group>
  )
}

function CardContent({ 
  item, 
  index, 
  count, 
  progress, 
  velocityRef, 
  mouseRef,
  isVisible, 
  isMobile,
  isIntersecting
}: KineticCardProps & { isVisible: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  
  const imageSrc = (isMobile && item.image.srcMobile) ? item.image.srcMobile : item.image.src

  const imageBitmap = useLoader(THREE.ImageBitmapLoader, imageSrc, (loader: any) => {
    if (loader.setOptions) {
      loader.setOptions({ imageOrientation: 'flipY' })
    }
  })
  
  const texture = useMemo(() => {
    if (!imageBitmap) return null
    const tex = new THREE.Texture(imageBitmap)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = isMobile ? 1 : 8 // High quality for desktop
    tex.needsUpdate = true 
    return tex
  }, [imageBitmap, isMobile])

  const shaderUniforms = useMemo(() => ({
    uTexture: { value: texture },
    uOpacity: { value: 0 },
    uDistortion: { value: 0 },
    uTime: { value: 0 }
  }), [texture])

  const { cardW, cardH } = useMemo(() => {
    const w = item.image.width || 567
    const h = item.image.height || 423
    const aspect = w / h
    const cH = 4.8
    const cW = aspect < 1 ? cH * aspect : Math.min(aspect * 3.0, 7.0)
    return { cardW: cW, cardH: cH }
  }, [item.image.width, item.image.height])

  useFrame((state) => {
    if (!groupRef.current || !meshRef.current || !isIntersecting) return

    const currentScroll = progress.get() * (count - 1)
    const currentActive = Math.round(currentScroll)

    const distToActive = Math.abs(index - currentActive)
    const isVisibleNow = isMobile ? distToActive <= 2 : distToActive <= 3
    meshRef.current.visible = isVisibleNow

    if (!isVisibleNow) return

    const offset = index - currentScroll
    const absOffset = Math.abs(offset)
    const velocity = velocityRef.current

    // Artistic Kinetic Movement
    const radius = 12
    const angle = offset * 0.35
    const x = Math.sin(angle) * radius
    const zOffset = (1 - Math.min(absOffset * 0.8, 1)) * 1.5
    const z = (Math.cos(angle) * radius) - radius + zOffset
    
    groupRef.current.position.set(x, 0, z)
    
    // Interactive Tilt Logic: Scroll Velocity + Mouse Position
    const mouseX = mouseRef.current?.x || 0
    const mouseY = mouseRef.current?.y || 0
    
    const targetRotY = angle * 1.1 + (mouseX * 0.15)
    const targetRotX = absOffset * 0.08 - (mouseY * 0.1)
    const tilt = velocity * offset * 0.15
    
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.1)
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.1)
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -tilt, 0.08)

    const s = 1.05 - Math.min(absOffset * 0.2, 0.35)
    groupRef.current.scale.set(s, s, s)

    // Update Shader Uniforms
    const mat = meshRef.current.material as THREE.ShaderMaterial
    const baseOpacity = 1 - Math.min(absOffset * 0.45, 0.98)
    const targetOpacity = isVisible ? baseOpacity : 0
    
    mat.uniforms.uOpacity.value = THREE.MathUtils.lerp(mat.uniforms.uOpacity.value, targetOpacity, 0.12)
    mat.uniforms.uDistortion.value = THREE.MathUtils.lerp(mat.uniforms.uDistortion.value, Math.min(velocity * 0.8, 1.2), 0.1)
    mat.uniforms.uTime.value = state.clock.elapsedTime
  })

  useEffect(() => {
    return () => {
      if (texture) texture.dispose()
    }
  }, [texture])

  return (
    <group ref={groupRef}>
      <mesh 
        ref={meshRef} 
        frustumCulled={false} 
        geometry={sharedPlaneGeometry} 
        scale={[cardW, cardH, 1]}
      >
        <shaderMaterial 
          key={index}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={shaderUniforms}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
