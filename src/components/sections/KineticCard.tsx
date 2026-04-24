import { useRef, useMemo, Suspense, useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import {
  PlaneGeometry,
  Texture,
  SRGBColorSpace,
  ShaderMaterial,
  DoubleSide,
  ImageBitmapLoader,
} from 'three'
import type { Group, Mesh } from 'three'

interface KineticCardProps {
  item: any
  index: number
  count: number
  isMobile: boolean
}

export interface KineticCardRef {
  update: (progress: number, velocity: number, mouse: { x: number; y: number }, time: number, isIntersecting: boolean) => void
}

const sharedPlaneGeometry = new PlaneGeometry(1, 1, 24, 24)

const vertexShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uInertia;
  uniform float uOffset;
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    float drag = sin(uv.y * 3.14159) * uInertia * 0.12;
    pos.z += drag * sin(uv.x * 3.14159 + uTime * 2.0);
    pos.z += abs(uOffset) * pow(uv.x - 0.5, 2.0) * 2.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uOpacity;
  uniform float uDistortion;
  varying vec2 vUv;

  void main() {
    vec2 distortion = vec2(uDistortion * 0.01, 0.0);
    float r = texture2D(uTexture, vUv + distortion).r;
    float g = texture2D(uTexture, vUv).g;
    float b = texture2D(uTexture, vUv - distortion).b;
    float edgeMask = smoothstep(0.0, 0.04, vUv.x) * smoothstep(1.0, 0.96, vUv.x) *
                     smoothstep(0.0, 0.04, vUv.y) * smoothstep(1.0, 0.96, vUv.y);
    gl_FragColor = vec4(r, g, b, uOpacity * edgeMask);
  }
`

export const KineticCard = forwardRef<KineticCardRef, KineticCardProps>((props, ref) => {
  return (
    <Suspense fallback={<CardPlaceholder {...props} ref={ref} />}>
      <CardContent {...props} ref={ref} />
    </Suspense>
  )
})

// Placeholder keeps the object in the parent's loop even before texture is loaded
const CardPlaceholder = forwardRef<KineticCardRef, KineticCardProps>((props, ref) => {
  const groupRef = useRef<Group>(null)
  const { cardW, cardH } = useMemo(() => {
    const aspect = (props.item.image.width || 567) / (props.item.image.height || 423)
    const cH = 4.8
    const cW = aspect < 1 ? cH * aspect : Math.min(aspect * 3.0, 7.0)
    return { cardW: cW, cardH: cH }
  }, [props.item.image.width, props.item.image.height])

  useImperativeHandle(ref, () => ({
    update: (progress, velocity, mouse, time, isIntersecting) => {
      if (!groupRef.current || !isIntersecting) return
      const scrollPos = progress * (props.count - 1)
      const offset = props.index - scrollPos
      const absOffset = Math.abs(offset)
      const radius = 12
      const angle = offset * 0.35
      const targetX = Math.sin(angle) * radius + (mouse.x * 0.15)
      groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.1
      groupRef.current.position.z = (Math.cos(angle) * radius) - radius + (1 - Math.min(absOffset * 0.8, 1)) * 1.5
      groupRef.current.rotation.y = angle * 1.1
    }
  }))

  return (
    <group ref={groupRef}>
      <mesh geometry={sharedPlaneGeometry} scale={[cardW, cardH, 1]}>
        <meshBasicMaterial color="#05030a" transparent opacity={0.05} />
      </mesh>
    </group>
  )
})

const CardContent = forwardRef<KineticCardRef, KineticCardProps>((props, ref) => {
  const { item, index, count, isMobile } = props
  const groupRef = useRef<Group>(null)
  const meshRef = useRef<Mesh>(null)
  const [isVisible, setIsVisible] = useState(false)
  const { gl } = useThree()

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 50)
    return () => clearTimeout(timer)
  }, [index])

  const imageSrc = (isMobile && item.image.srcMobile) ? item.image.srcMobile : item.image.src
  const imageBitmap = useLoader(ImageBitmapLoader, imageSrc, (loader: any) => {
    if (loader.setOptions) loader.setOptions({ imageOrientation: 'flipY' })
  })

  const texture = useMemo(() => {
    if (!imageBitmap) return null
    const tex = new Texture(imageBitmap)
    tex.colorSpace = SRGBColorSpace
    // Cap at 4 — imperceptible difference on face-on carousel cards, meaningful GPU savings
    tex.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy())
    tex.needsUpdate = true
    return tex
  }, [imageBitmap, gl])

  const uniforms = useMemo(() => ({
    uTexture: { value: texture },
    uOpacity: { value: 0 },
    uDistortion: { value: 0 },
    uInertia: { value: 0 },
    uOffset: { value: 0 },
    uTime: { value: 0 }
  }), [texture])

  const { cardW, cardH } = useMemo(() => {
    const aspect = (item.image.width || 567) / (item.image.height || 423)
    const cH = 4.8
    const cW = aspect < 1 ? cH * aspect : Math.min(aspect * 3.0, 7.0)
    return { cardW: cW, cardH: cH }
  }, [item.image.width, item.image.height])

  useImperativeHandle(ref, () => ({
    update: (progress, velocity, mouse, time, isIntersecting) => {
      if (!groupRef.current || !meshRef.current || !isIntersecting) return
      const scrollPos = progress * (count - 1)
      const offset = index - scrollPos
      const absOffset = Math.abs(offset)
      const isCardVisible = isMobile ? absOffset <= 2 : absOffset <= 3
      meshRef.current.visible = isCardVisible
      if (!isCardVisible) return

      const radius = 12
      const angle = offset * 0.35
      const targetX = Math.sin(angle) * radius + (mouse.x * 0.15)
      const targetY = -(mouse.y * 0.08)
      const zBase = (Math.cos(angle) * radius) - radius
      const zOffset = (1 - Math.min(absOffset * 0.8, 1)) * 1.5
      
      groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.1
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.1
      groupRef.current.position.z = zBase + zOffset
      groupRef.current.rotation.y += (angle * 1.1 + mouse.x * 0.1 - groupRef.current.rotation.y) * 0.1
      groupRef.current.rotation.x += (absOffset * 0.08 - mouse.y * 0.1 - groupRef.current.rotation.x) * 0.1
      groupRef.current.rotation.z += (velocity * (offset > 0 ? -1 : 1) * 0.15 - groupRef.current.rotation.z) * 0.1
      groupRef.current.scale.setScalar(1.05 - Math.min(absOffset * 0.2, 0.35))

      const mat = meshRef.current.material as ShaderMaterial
      const baseOpacity = 1 - Math.min(absOffset * 0.45, 0.98)
      mat.uniforms.uOpacity.value += ((isVisible ? baseOpacity : 0) - mat.uniforms.uOpacity.value) * 0.1
      mat.uniforms.uDistortion.value += (Math.min(velocity * 0.3, 0.5) - mat.uniforms.uDistortion.value) * 0.1
      mat.uniforms.uInertia.value += (velocity * (offset > 0 ? 1 : -1) - mat.uniforms.uInertia.value) * 0.1
      mat.uniforms.uOffset.value = offset
      mat.uniforms.uTime.value = time
    }
  }))

  useEffect(() => () => texture?.dispose(), [texture])

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} frustumCulled={false} geometry={sharedPlaneGeometry} scale={[cardW, cardH, 1]}>
        <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} transparent depthWrite={false} side={DoubleSide} />
      </mesh>
    </group>
  )
})
