import { memo, Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import type { MotionValue } from 'framer-motion'
import * as THREE from 'three'

import hero1 from '../../assets/images/hero1.jpg?format=webp&w=1200&as=url'
import hero2 from '../../assets/images/hero2.jpg?format=webp&w=1200&as=url'
import hero3 from '../../assets/images/hero3.jpg?format=webp&w=1200&as=url'
import hero4 from '../../assets/images/hero4.jpg?format=webp&w=1200&as=url'

const GRID_W = 180
const GRID_H = 112
const PARTICLE_COUNT = GRID_W * GRID_H
const MAX_IMAGE_WIDTH = 5.15
const MAX_IMAGE_HEIGHT = 3.18
const IMAGE_SOURCES = [hero1, hero2, hero3, hero4]

const vertexShader = /* glsl */ `
  attribute vec3 aTargetPosition;
  attribute vec3 aTargetColor;
  attribute float aSeed;
  attribute float aEdge;

  uniform float uProgress;
  uniform float uTime;
  uniform float uPointScale;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vEdge;

  void main() {
    float progress = smoothstep(0.0, 1.0, uProgress);
    float burst = sin(progress * 3.14159265);
    float settle = smoothstep(0.24, 0.82, progress);

    vec3 source = position;
    vec3 target = aTargetPosition;

    float orbit = aSeed * 6.28318 + uTime * 0.18;
    float edgeBoost = mix(0.35, 1.15, aEdge);

    vec3 choreography = vec3(
      sin(orbit + source.y * 3.6) * (0.24 + aSeed * 0.16),
      cos(orbit * 1.15 + source.x * 2.4) * (0.18 + aSeed * 0.1),
      sin(orbit * 0.72 + source.x * 3.8 + source.y * 2.8) * (0.34 + aSeed * 0.24)
    ) * edgeBoost;

    choreography.xy += normalize(vec2(source.x + 0.0001, source.y + 0.0001)) * burst * (0.025 + aEdge * 0.11);

    vec3 scattered = source + choreography * burst;
    vec3 finalPosition = mix(scattered, target, settle);

    finalPosition.x += sin(uTime * 0.14 + aSeed * 12.0) * 0.016;
    finalPosition.y += cos(uTime * 0.1 + aSeed * 8.0) * 0.012;

    vec4 mvPosition = modelViewMatrix * vec4(finalPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float depthFade = clamp(1.5 / -mvPosition.z, 0.0, 2.2);
    gl_PointSize = uPointScale * depthFade * mix(0.78, 1.45, 1.0 - burst) * (0.82 + aSeed * 0.28 + aEdge * 0.4);

    vColor = max(mix(color, aTargetColor, smoothstep(0.22, 0.82, progress)), vec3(0.075));
    vAlpha = mix(0.16, 0.92, (1.0 - burst * 0.34) * mix(0.22, 1.0, aEdge));
    vEdge = aEdge;
  }
`

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vEdge;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float distanceToCenter = length(uv);

    if (distanceToCenter > 0.5) discard;

    float glow = smoothstep(0.5, 0.02, distanceToCenter);
    float core = smoothstep(0.18, 0.0, distanceToCenter);

    vec3 color = vColor + vec3(0.05, 0.04, 0.06) * glow * mix(0.45, 1.0, vEdge);
    float alpha = (glow * 0.82 + core * 0.3) * vAlpha;

    gl_FragColor = vec4(color, alpha);
  }
`

type Sample = {
  positions: Float32Array
  colors: Float32Array
  edges: Float32Array
  width: number
  height: number
}

function getFittedDimensions(
  imageWidth: number,
  imageHeight: number,
  maxWidth: number,
  maxHeight: number,
) {
  const imageRatio = imageWidth / imageHeight
  const maxRatio = maxWidth / maxHeight

  if (imageRatio > maxRatio) {
    return { width: maxWidth, height: maxWidth / imageRatio }
  }

  return { width: maxHeight * imageRatio, height: maxHeight }
}

function createSample(texture: THREE.Texture): Sample {
  const image = texture.image as CanvasImageSource & { width?: number; height?: number }
  const canvas = document.createElement('canvas')
  canvas.width = GRID_W
  canvas.height = GRID_H
  const context = canvas.getContext('2d', { willReadFrequently: true })

  if (!context || !image) {
    return {
      positions: new Float32Array(PARTICLE_COUNT * 3),
      colors: new Float32Array(PARTICLE_COUNT * 3),
      edges: new Float32Array(PARTICLE_COUNT),
      width: MAX_IMAGE_WIDTH,
      height: MAX_IMAGE_HEIGHT,
    }
  }

  const sourceWidth = image.width ?? GRID_W
  const sourceHeight = image.height ?? GRID_H
  const fitted = getFittedDimensions(
    sourceWidth,
    sourceHeight,
    MAX_IMAGE_WIDTH,
    MAX_IMAGE_HEIGHT,
  )

  context.drawImage(image, 0, 0, GRID_W, GRID_H)
  const pixels = context.getImageData(0, 0, GRID_W, GRID_H).data
  const positions = new Float32Array(PARTICLE_COUNT * 3)
  const colors = new Float32Array(PARTICLE_COUNT * 3)
  const edges = new Float32Array(PARTICLE_COUNT)

  for (let y = 0; y < GRID_H; y += 1) {
    for (let x = 0; x < GRID_W; x += 1) {
      const index = y * GRID_W + x
      const pixelIndex = index * 4
      const alpha = pixels[pixelIndex + 3] / 255
      const brightness = (pixels[pixelIndex] + pixels[pixelIndex + 1] + pixels[pixelIndex + 2]) / (255 * 3)
      const depth = (brightness - 0.5) * 0.52
      positions[index * 3] = (x / (GRID_W - 1) - 0.5) * fitted.width
      positions[index * 3 + 1] = -(y / (GRID_H - 1) - 0.5) * fitted.height
      positions[index * 3 + 2] = depth

      const u = x / (GRID_W - 1)
      const v = y / (GRID_H - 1)
      const distToEdge = Math.min(u, 1 - u, v, 1 - v)
      const cornerDistance = Math.min(
        Math.hypot(u, v),
        Math.hypot(1 - u, v),
        Math.hypot(u, 1 - v),
        Math.hypot(1 - u, 1 - v),
      )
      const edgeMask = 1 - THREE.MathUtils.smoothstep(distToEdge, 0.06, 0.2)
      const cornerMask = 1 - THREE.MathUtils.smoothstep(cornerDistance, 0.12, 0.34)
      const luminanceMask = (0.2 + alpha * 0.2) + brightness * 0.6
      edges[index] = THREE.MathUtils.clamp((edgeMask * 0.35 + cornerMask * 0.95) * luminanceMask, 0, 1)
      colors[index * 3] = pixels[pixelIndex] / 255
      colors[index * 3 + 1] = pixels[pixelIndex + 1] / 255
      colors[index * 3 + 2] = pixels[pixelIndex + 2] / 255
    }
  }

  return { positions, colors, edges, width: fitted.width, height: fitted.height }
}

function ParticleImage({ 
  scrubProgress, 
  isVisible 
}: { 
  scrubProgress: number | MotionValue<number>,
  isVisible: boolean
}) {
  const textures = useLoader(THREE.TextureLoader, IMAGE_SOURCES)
  const pointsRef = useRef<THREE.Points>(null)
  const currentPlaneRef = useRef<THREE.Mesh>(null)
  const nextPlaneRef = useRef<THREE.Mesh>(null)
  const geometryRef = useRef<THREE.BufferGeometry | null>(null)
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)
  const pairRef = useRef<[number, number]>([0, 1])
  const { size } = useThree()

  const samples = useMemo(() => textures.map((texture) => createSample(texture)), [textures])

  const geometry = useMemo(() => {
    const nextGeometry = new THREE.BufferGeometry()
    const current = samples[0]
    const next = samples[1]
    const seeds = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      seeds[i] = ((i * 48271) % 2147483647) / 2147483647
    }

    nextGeometry.setAttribute('position', new THREE.BufferAttribute(current.positions.slice(), 3))
    nextGeometry.setAttribute('color', new THREE.BufferAttribute(current.colors.slice(), 3))
    nextGeometry.setAttribute('aTargetPosition', new THREE.BufferAttribute(next.positions.slice(), 3))
    nextGeometry.setAttribute('aTargetColor', new THREE.BufferAttribute(next.colors.slice(), 3))
    nextGeometry.setAttribute('aEdge', new THREE.BufferAttribute(current.edges.slice(), 1))
    nextGeometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))

    return nextGeometry
  }, [samples])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        uniforms: {
          uProgress: { value: 0 },
          uTime: { value: 0 },
          uPointScale: { value: Math.min(size.width / 132, 7.2) },
        },
        vertexColors: true,
      }),
    [size.width],
  )

  useEffect(() => {
    geometryRef.current = geometry
    materialRef.current = material

    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
    })

    return () => {
      textures.forEach((texture) => texture.dispose())
    }
  }, [textures])

  useFrame((state) => {
    const activeGeometry = geometryRef.current
    const activeMaterial = materialRef.current
    const points = pointsRef.current

    if (!activeGeometry || !activeMaterial || !points || !isVisible) {
      return
    }

    const currentPlane = currentPlaneRef.current
    const nextPlane = nextPlaneRef.current

    const resolvedProgress =
      typeof scrubProgress === 'number' ? scrubProgress : scrubProgress.get()

    const maxSegment = Math.max(samples.length - 1, 1)
    const segmentFloat = THREE.MathUtils.clamp(resolvedProgress, 0, 0.9999) * maxSegment
    const currentIndex = Math.floor(segmentFloat)
    const nextIndex = Math.min(currentIndex + 1, samples.length - 1)
    const progress = segmentFloat - currentIndex
    const dissolve = THREE.MathUtils.smoothstep(progress, 0.08, 0.92)

    activeMaterial.uniforms.uProgress.value = progress
    activeMaterial.uniforms.uTime.value = state.clock.elapsedTime
    activeMaterial.uniforms.uPointScale.value = Math.min(size.width / 132, 7.2)

    if (
      currentPlane?.material instanceof THREE.MeshBasicMaterial &&
      nextPlane?.material instanceof THREE.MeshBasicMaterial
    ) {
      currentPlane.material.opacity = 1 - dissolve * 0.92
      nextPlane.material.opacity = dissolve
    }

    if (pairRef.current[0] !== currentIndex || pairRef.current[1] !== nextIndex) {
      pairRef.current = [currentIndex, nextIndex]

      const current = samples[currentIndex]
      const upcoming = samples[nextIndex]

      const positionAttribute = activeGeometry.getAttribute('position') as THREE.BufferAttribute
      const colorAttribute = activeGeometry.getAttribute('color') as THREE.BufferAttribute
      const targetPositionAttribute = activeGeometry.getAttribute('aTargetPosition') as THREE.BufferAttribute
      const targetColorAttribute = activeGeometry.getAttribute('aTargetColor') as THREE.BufferAttribute
      const edgeAttribute = activeGeometry.getAttribute('aEdge') as THREE.BufferAttribute

      positionAttribute.array = current.positions.slice()
      colorAttribute.array = current.colors.slice()
      targetPositionAttribute.array = upcoming.positions.slice()
      targetColorAttribute.array = upcoming.colors.slice()
      edgeAttribute.array = current.edges.slice()

      positionAttribute.needsUpdate = true
      colorAttribute.needsUpdate = true
      targetPositionAttribute.needsUpdate = true
      targetColorAttribute.needsUpdate = true
      edgeAttribute.needsUpdate = true

      if (
        currentPlane?.material instanceof THREE.MeshBasicMaterial &&
        nextPlane?.material instanceof THREE.MeshBasicMaterial
      ) {
        currentPlane.material.map = textures[currentIndex]
        nextPlane.material.map = textures[nextIndex]
        currentPlane.scale.set(current.width, current.height, 1)
        nextPlane.scale.set(upcoming.width, upcoming.height, 1)
        currentPlane.material.needsUpdate = true
        nextPlane.material.needsUpdate = true
      }
    }

    points.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.022
    points.rotation.x = Math.cos(state.clock.elapsedTime * 0.035) * 0.01
    points.position.x = Math.sin(state.clock.elapsedTime * 0.07) * 0.008
    points.position.y = Math.cos(state.clock.elapsedTime * 0.05) * 0.006
  })

  return (
    <group>
      <mesh
        ref={currentPlaneRef}
        position={[0, 0, -0.22]}
        scale={[samples[0].width, samples[0].height, 1]}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={textures[0]}
          transparent
          opacity={1}
          color="#ffffff"
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0, -0.205]}>
        <planeGeometry args={[MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT]} />
        <meshBasicMaterial
          transparent
          opacity={0.18}
          color="#050507"
          toneMapped={false}
        />
      </mesh>
      <mesh
        ref={nextPlaneRef}
        position={[0, 0, -0.18]}
        scale={[samples[1].width, samples[1].height, 1]}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={textures[1]}
          transparent
          opacity={0}
          color="#ffffff"
          toneMapped={false}
        />
      </mesh>
      <points ref={pointsRef} geometry={geometry} material={material} />
    </group>
  )
}

function Atmosphere() {
  return (
    <>
      <ambientLight intensity={1.35} />
      <pointLight position={[3.2, 2.2, 3.6]} intensity={1.35} color="#ffd6f0" />
      <pointLight position={[-2.4, -0.2, 2.2]} intensity={0.9} color="#9ec5ff" />
      <fog attach="fog" args={['#07070a', 5.4, 9.8]} />
    </>
  )
}

function Scene({ 
  scrubProgress, 
  isVisible 
}: { 
  scrubProgress: number | MotionValue<number>,
  isVisible: boolean
}) {
  return (
    <>
      <Atmosphere />
      <ParticleImage scrubProgress={scrubProgress} isVisible={isVisible} />
    </>
  )
}

interface Props {
  isVisible: boolean
  prefersReducedMotion: boolean
  scrubProgress?: number | MotionValue<number>
}

const CanvasHero = memo(function CanvasHero({ isVisible, prefersReducedMotion, scrubProgress = 0 }: Props) {
  if (prefersReducedMotion) {
    return (
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_40%,rgba(255,255,255,0.14),transparent_0_14%),radial-gradient(circle_at_70%_44%,rgba(255,91,179,0.16),transparent_0_20%),radial-gradient(circle_at_62%_58%,rgba(96,152,255,0.12),transparent_0_18%)]" />
    )
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 5.4], fov: 40 }}
      style={{ position: 'absolute', inset: 0, background: 'transparent' }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      dpr={window.matchMedia('(max-width: 1024px)').matches ? 1 : [1, 2]}
      frameloop={isVisible ? 'always' : 'never'}
    >
      <Suspense fallback={null}>
        <Scene scrubProgress={scrubProgress} isVisible={isVisible} />
      </Suspense>
    </Canvas>
  )
})

export default CanvasHero
