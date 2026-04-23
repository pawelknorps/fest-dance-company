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

// SOTA Balanced Resolution (32x32)
const sharedPlaneGeometry = new THREE.PlaneGeometry(1, 1, 32, 32)

const vertexShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uInertia;
  uniform float uOffset;
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // High-Quality Vertex Inertia
    float drag = sin(uv.y * 3.14159) * uInertia * 0.18;
    pos.z += drag * sin(uv.x * 3.14159 + uTime * 2.2);
    
    // Smooth cinematic curvature
    pos.z += abs(uOffset) * pow(uv.x - 0.5, 2.0) * 2.5;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uOpacity;
  uniform float uDistortion;
  varying vec2 vUv;

  void main() {
    // High-Fidelity Chromatic Aberration
    vec2 distortion = vec2(uDistortion * 0.015, 0.0);
    float r = texture2D(uTexture, vUv + distortion).r;
    float g = texture2D(uTexture, vUv).g;
    float b = texture2D(uTexture, vUv - distortion).b;
    
    vec3 color = vec3(r, g, b);
    
    // Smooth high-res edge mask
    float edgeMask = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x) *
                     smoothstep(0.0, 0.08, vUv.y) * smoothstep(1.0, 0.92, vUv.y);
    
    // Subtle inner depth glow
    float glow = (1.0 - length(vUv - 0.5) * 1.4) * 0.1;
    color += vec3(0.5, 0.4, 0.7) * glow * uDistortion;
    
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
        <meshBasicMaterial color="#050505" transparent opacity={0.12} />
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
    tex.anisotropy = isMobile ? 1 : 16 // Restore high anisotropy
    tex.needsUpdate = true 
    return tex
  }, [imageBitmap, isMobile])

  const shaderUniforms = useMemo(() => ({
    uTexture: { value: texture },
    uOpacity: { value: 0 },
    uDistortion: { value: 0 },
    uInertia: { value: 0 },
    uOffset: { value: 0 },
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

    // Position
    const radius = 12
    const angle = offset * 0.35
    const x = Math.sin(angle) * radius
    const zBase = (Math.cos(angle) * radius) - radius
    const zOffset = (1 - Math.min(absOffset * 0.8, 1)) * 1.5
    
    // Balanced Interactive Tilt & Parallax
    const mouseX = mouseRef.current?.x || 0
    const mouseY = mouseRef.current?.y || 0
    
    const targetX = x + (mouseX * 0.25) // Restored some parallax
    const targetY = -(mouseY * 0.12)
    groupRef.current.position.set(
      THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.08),
      THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.08),
      zBase + zOffset
    )
    
    const targetRotY = angle * 1.1 + (mouseX * 0.25)
    const targetRotX = absOffset * 0.1 - (mouseY * 0.18)
    const tiltZ = velocity * (index > currentScroll ? -1 : 1) * 0.2
    
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.1)
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.1)
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, tiltZ, 0.08)

    const s = 1.05 - Math.min(absOffset * 0.2, 0.35)
    groupRef.current.scale.set(s, s, s)

    // Uniforms
    const mat = meshRef.current.material as THREE.ShaderMaterial
    const baseOpacity = 1 - Math.min(absOffset * 0.45, 0.98)
    const targetOpacity = isVisible ? baseOpacity : 0
    
    mat.uniforms.uOpacity.value = THREE.MathUtils.lerp(mat.uniforms.uOpacity.value, targetOpacity, 0.1)
    mat.uniforms.uDistortion.value = THREE.MathUtils.lerp(mat.uniforms.uDistortion.value, Math.min(velocity * 0.5, 0.8), 0.08)
    mat.uniforms.uInertia.value = THREE.MathUtils.lerp(mat.uniforms.uInertia.value, velocity * (offset > 0 ? 1 : -1), 0.05)
    mat.uniforms.uOffset.value = offset
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
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={shaderUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
