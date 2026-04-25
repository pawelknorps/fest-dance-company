import { useRef, useMemo, useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useLoadOrchestrator } from '../../lib/LoadOrchestrator'
import { textureManager } from '../../lib/TextureManager'
import { resourceAtlas } from '../../lib/ResourceAtlas'
import {
  Texture,
  SRGBColorSpace,
  ShaderMaterial,
  DoubleSide,
  Color,
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

const vertexShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uInertia;
  uniform float uOffset;
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    
    #if LOW_TIER
      // Simplified physics for mobile: Linear drag approximation
      float drag = (0.5 - abs(uv.y - 0.5)) * uInertia * 0.08;
      pos.z += drag;
    #else
      float drag = sin(uv.y * 3.14159) * uInertia * 0.12;
      pos.z += drag * sin(uv.x * 3.14159 + uTime * 2.0);
    #endif

    pos.z += abs(uOffset) * pow(uv.x - 0.5, 2.0) * 2.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform sampler2D uPlaceholderTex;
  uniform float uOpacity;
  uniform float uDistortion;
  uniform float uMixRatio;
  uniform vec3 uPlaceholderColor;
  varying vec2 vUv;

  void main() {
    float r, g, b;
    float pr, pg, pb;

    #if LOW_TIER
      vec4 texColor = texture2D(uTexture, vUv);
      r = texColor.r; g = texColor.g; b = texColor.b;
      
      vec4 pColor = texture2D(uPlaceholderTex, vUv);
      pr = pColor.r; pg = pColor.g; pb = pColor.b;
    #else
      vec2 distortion = vec2(uDistortion * 0.01, 0.0);
      r = texture2D(uTexture, vUv + distortion).r;
      g = texture2D(uTexture, vUv).g;
      b = texture2D(uTexture, vUv - distortion).b;
      
      pr = texture2D(uPlaceholderTex, vUv + distortion).r;
      pg = texture2D(uPlaceholderTex, vUv).g;
      pb = texture2D(uPlaceholderTex, vUv - distortion).b;
    #endif

    vec3 mainRGB = vec3(r, g, b);
    vec3 placeholderRGB = vec3(pr, pg, pb);
    
    // Mix between structural placeholder and high-res texture
    vec3 mixedRGB = mix(placeholderRGB, mainRGB, uMixRatio);
    
    // Initial entrance fade from site background color
    vec3 finalRGB = mix(uPlaceholderColor, mixedRGB, min(uMixRatio + 0.2, 1.0));

    float edgeMask = smoothstep(0.0, 0.04, vUv.x) * smoothstep(1.0, 0.96, vUv.x) *
                     smoothstep(0.0, 0.04, vUv.y) * smoothstep(1.0, 0.96, vUv.y);
    gl_FragColor = vec4(finalRGB, uOpacity * edgeMask);
  }
`

export const KineticCard = forwardRef<KineticCardRef, KineticCardProps>((props, ref) => {
  return (
    <CardContent {...props} ref={ref} />
  )
})

const CardContent = forwardRef<KineticCardRef, KineticCardProps>((props, ref) => {
  const { item, index, count, isMobile } = props
  const groupRef = useRef<Group>(null)
  const meshRef = useRef<Mesh>(null)
  const [isVisible, setIsVisible] = useState(false)
  const { gl } = useThree()
  const registerItem = useLoadOrchestrator(s => s.registerItem)
  const completeItem = useLoadOrchestrator(s => s.completeItem)
  
  // SOTA Resource Atlas: pull pre-allocated geometries
  const geometry = isMobile ? resourceAtlas.mobilePlane : resourceAtlas.desktopPlane

  const imageSrc = (isMobile && item.image.srcMobile) ? item.image.srcMobile : item.image.src

  // 1. Instant-On Scenography: Bind ThumbHash placeholder immediately
  const placeholderTexture = useMemo(() => 
    textureManager.getThumbTexture(item.id, item.thumbHash), 
  [item.id, item.thumbHash])
  
  const initialTexture = useMemo(() => textureManager.getDummyTexture(), [])
  const [texture, setTexture] = useState<Texture>(initialTexture)

  useEffect(() => {
    registerItem(`card-${item.id}`)
    
    const handleTextureReady = (tex: Texture) => {
      setTexture(tex)
      completeItem(`card-${item.id}`)
    }

    textureManager.subscribe(imageSrc, handleTextureReady)
    const priority = index < 3 ? 1 : 2
    textureManager.requestTexture(item.id, imageSrc, priority)

    const timer = setTimeout(() => setIsVisible(true), index * 50)
    
    return () => {
      clearTimeout(timer)
      textureManager.unsubscribe(imageSrc, handleTextureReady)
    }
  }, [index, item.id, imageSrc])

  const uniforms = useMemo(() => ({
    uTexture: { value: texture },
    uPlaceholderTex: { value: placeholderTexture },
    uOpacity: { value: 0 },
    uDistortion: { value: 0 },
    uInertia: { value: 0 },
    uOffset: { value: 0 },
    uTime: { value: 0 },
    uMixRatio: { value: 0 },
    uPlaceholderColor: { value: new Color('#05030a') }
  }), [])

  useEffect(() => {
    if (meshRef.current) {
      const mat = meshRef.current.material as ShaderMaterial
      mat.uniforms.uTexture.value = texture
      if (texture !== initialTexture) gl.initTexture(texture)
    }
  }, [texture, initialTexture, gl])


  const defines = useMemo(() => ({
    LOW_TIER: isMobile ? 1 : 0
  }), [isMobile])

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
      
      const zOffsetBase = (1 - Math.min(absOffset * 0.8, 1)) * 1.5
      const zOffset = isMobile ? zOffsetBase * 0.7 : zOffsetBase // Dampened Z for mobile
      
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

      // Handle Mix Ratio (Crossfade)
      if (texture !== initialTexture && mat.uniforms.uMixRatio.value < 1.0) {
        // Only crossfade if velocity is low to prevent stutter
        if (Math.abs(velocity) < 0.05) {
          mat.uniforms.uMixRatio.value += (1.0 - mat.uniforms.uMixRatio.value) * 0.12
          if (mat.uniforms.uMixRatio.value > 0.99) mat.uniforms.uMixRatio.value = 1.0
        }
      }
    }
  }))

  return (
    <group ref={groupRef}>
      <mesh 
        ref={meshRef} 
        frustumCulled={false} 
        geometry={geometry} 
        scale={[cardW, cardH, 1]}
        onPointerOver={() => {
          document.dispatchEvent(new CustomEvent('cursor-hover', { detail: 'Zobacz projekt' }));
        }}
        onPointerOut={() => {
          document.dispatchEvent(new CustomEvent('cursor-leave'));
        }}
      >
        <shaderMaterial 
          vertexShader={vertexShader} 
          fragmentShader={fragmentShader} 
          uniforms={uniforms} 
          defines={defines}
          transparent 
          depthWrite={false} 
          side={DoubleSide}
          toneMapped={false} 
        />
      </mesh>
    </group>
  )
})
