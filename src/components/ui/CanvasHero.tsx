import { memo, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { useLoadOrchestrator } from '../../lib/LoadOrchestrator'
import { textureManager } from '../../lib/TextureManager'
import type { MotionValue } from 'framer-motion'
import {
  TextureLoader,
  ShaderMaterial,
  BufferGeometry,
  BufferAttribute,
  DynamicDrawUsage,
  NormalBlending,
  MathUtils,
  SRGBColorSpace,
  LinearFilter,
  MeshBasicMaterial,
} from 'three'
import type { Points, Mesh } from 'three'

import hero1 from '../../assets/images/hero1.jpg?format=webp&w=1000&q=75&as=url'
import hero2 from '../../assets/images/hero2.jpg?format=webp&w=1000&q=75&as=url'
import hero3 from '../../assets/images/hero3.jpg?format=webp&w=1000&q=75&as=url'
import hero4 from '../../assets/images/hero4.jpg?format=webp&w=1000&q=75&as=url'
import hero1Mobile from '../../assets/images/hero1.jpg?format=webp&w=600&q=70&as=url'
import hero2Mobile from '../../assets/images/hero2.jpg?format=webp&w=600&q=70&as=url'
import hero3Mobile from '../../assets/images/hero3.jpg?format=webp&w=600&q=70&as=url'
import hero4Mobile from '../../assets/images/hero4.jpg?format=webp&w=600&q=70&as=url'

const GRID_W = 180
const GRID_H = 112
const PARTICLE_COUNT = GRID_W * GRID_H
const MAX_IMAGE_WIDTH = 5.15
const MAX_IMAGE_HEIGHT = 3.18

// Pick image resolution based on viewport width — saves ~200 KB on mobile
const isMobileViewport = typeof window !== 'undefined' && window.innerWidth <= 768
const IMAGE_SOURCES = isMobileViewport
  ? [hero1Mobile, hero2Mobile, hero3Mobile, hero4Mobile]
  : [hero1, hero2, hero3, hero4]

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

/**
 * Kick off the canvas-sampler worker to compute all 4 particle samples
 * off the main thread. Returns a promise that resolves to the samples array.
 * The worker processes all images in parallel (Promise.all inside) and
 * transfers the ArrayBuffers back with zero-copy Transferable messaging.
 */
function runSamplerWorker(urls: string[]): Promise<Sample[]> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('../../workers/canvas-sampler-worker.ts', import.meta.url),
      { type: 'module' }
    )

    worker.onmessage = (e: MessageEvent) => {
      const { type, payload } = e.data
      if (type === 'SAMPLES_READY') {
        // Wrap the transferred ArrayBuffers back into typed arrays
        const samples: Sample[] = payload.samples.map((s: {
          positions: ArrayBuffer
          colors: ArrayBuffer
          edges: ArrayBuffer
          width: number
          height: number
        }) => ({
          positions: new Float32Array(s.positions),
          colors:    new Float32Array(s.colors),
          edges:     new Float32Array(s.edges),
          width:     s.width,
          height:    s.height,
        }))
        worker.terminate()
        resolve(samples)
      } else if (type === 'SAMPLE_ERROR') {
        worker.terminate()
        reject(new Error(payload.message))
      }
    }

    worker.onerror = (err) => {
      worker.terminate()
      reject(err)
    }

    worker.postMessage({
      type: 'SAMPLE_IMAGES',
      payload: {
        urls,
        gridW: GRID_W,
        gridH: GRID_H,
        maxW:  MAX_IMAGE_WIDTH,
        maxH:  MAX_IMAGE_HEIGHT,
      },
    })
  })
}

function ParticleImage({
  scrubProgress,
  isVisible
}: {
  scrubProgress: number | MotionValue<number>,
  isVisible: boolean
}) {
  const registerItem = useLoadOrchestrator(s => s.registerItem)
  const completeItem = useLoadOrchestrator(s => s.completeItem)

  const textures = useLoader(TextureLoader, IMAGE_SOURCES, (loader: any) => {
    IMAGE_SOURCES.forEach((url, i) => {
      completeItem(`hero-${i}`)
    })
  })
  
  const pointsRef = useRef<Points>(null)
  const currentPlaneRef = useRef<Mesh>(null)
  const nextPlaneRef = useRef<Mesh>(null)
  const geometryRef = useRef<BufferGeometry | null>(null)
  const materialRef = useRef<ShaderMaterial | null>(null)
  const pairRef = useRef<[number, number]>([0, 1])
  const { size } = useThree()

  // Samples start null — populated asynchronously by the worker.
  // While null, only the texture planes render (no particles yet).
  const [samples, setSamples] = useState<Sample[] | null>(null)

  useEffect(() => {
    IMAGE_SOURCES.forEach((_, i) => registerItem(`hero-${i}`))
    
    let cancelled = false

    // Kick off the sampler worker immediately — it runs off the main thread
    // so the hero UI stays responsive while the heavy pixel-read work runs.
    runSamplerWorker(IMAGE_SOURCES)
      .then((result) => {
        if (!cancelled) setSamples(result)
      })
      .catch((err) => {
        if (!cancelled) console.warn('[CanvasHero] Sampler worker failed:', err)
      })

    return () => { cancelled = true }
  }, []) // IMAGE_SOURCES is module-level constant, safe to omit

  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = SRGBColorSpace
      texture.minFilter = LinearFilter
      texture.magFilter = LinearFilter
    })

    return () => {
      textures.forEach((texture) => texture.dispose())
    }
  }, [textures])

  // Pre-allocate reusable typed arrays — avoids 5× ~242 KB .slice() allocations
  // on every slide transition. TypedArray.set() copies data in-place, zero GC pressure.
  const scratchBuffers = useMemo(() => ({
    position:       new Float32Array(PARTICLE_COUNT * 3),
    color:          new Float32Array(PARTICLE_COUNT * 3),
    targetPosition: new Float32Array(PARTICLE_COUNT * 3),
    targetColor:    new Float32Array(PARTICLE_COUNT * 3),
    edge:           new Float32Array(PARTICLE_COUNT),
  }), [])

  // Build geometry only once samples arrive from the worker
  const geometry = useMemo(() => {
    if (!samples) return null

    const geo = new BufferGeometry()
    const seeds = new Float32Array(PARTICLE_COUNT)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      seeds[i] = ((i * 48271) % 2147483647) / 2147483647
    }

    // Initialise scratch buffers from the first pair
    scratchBuffers.position.set(samples[0].positions)
    scratchBuffers.color.set(samples[0].colors)
    scratchBuffers.targetPosition.set(samples[1].positions)
    scratchBuffers.targetColor.set(samples[1].colors)
    scratchBuffers.edge.set(samples[0].edges)

    geo.setAttribute('position',        new BufferAttribute(scratchBuffers.position, 3))
    geo.setAttribute('color',           new BufferAttribute(scratchBuffers.color, 3))
    geo.setAttribute('aTargetPosition', new BufferAttribute(scratchBuffers.targetPosition, 3))
    geo.setAttribute('aTargetColor',    new BufferAttribute(scratchBuffers.targetColor, 3))
    geo.setAttribute('aEdge',           new BufferAttribute(scratchBuffers.edge, 1))
    geo.setAttribute('aSeed',           new BufferAttribute(seeds, 1))

    // Hint to the GPU that these attributes will update frequently
    ;(geo.getAttribute('position') as BufferAttribute).usage        = DynamicDrawUsage
    ;(geo.getAttribute('color') as BufferAttribute).usage           = DynamicDrawUsage
    ;(geo.getAttribute('aTargetPosition') as BufferAttribute).usage = DynamicDrawUsage
    ;(geo.getAttribute('aTargetColor') as BufferAttribute).usage    = DynamicDrawUsage
    ;(geo.getAttribute('aEdge') as BufferAttribute).usage           = DynamicDrawUsage

    return geo
  }, [samples, scratchBuffers])

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: NormalBlending,
        uniforms: {
          uProgress:   { value: 0 },
          uTime:       { value: 0 },
          uPointScale: { value: Math.min(size.width / 132, 7.2) },
        },
        vertexColors: true,
      }),
    [size.width],
  )

  useEffect(() => {
    if (!geometry) return
    geometryRef.current = geometry
    materialRef.current = material

    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  useFrame((state) => {
    const activeGeometry = geometryRef.current
    const activeMaterial = materialRef.current
    const points = pointsRef.current

    if (!activeGeometry || !activeMaterial || !points || !isVisible || !samples) {
      return
    }

    const currentPlane = currentPlaneRef.current
    const nextPlane = nextPlaneRef.current

    const resolvedProgress =
      typeof scrubProgress === 'number' ? scrubProgress : scrubProgress.get()

    const maxSegment = Math.max(samples.length - 1, 1)
    const segmentFloat = MathUtils.clamp(resolvedProgress, 0, 0.9999) * maxSegment
    const currentIndex = Math.floor(segmentFloat)
    const nextIndex = Math.min(currentIndex + 1, samples.length - 1)
    const progress = segmentFloat - currentIndex
    const dissolve = MathUtils.smoothstep(progress, 0.08, 0.92)

    activeMaterial.uniforms.uProgress.value = progress
    activeMaterial.uniforms.uTime.value = state.clock.elapsedTime
    activeMaterial.uniforms.uPointScale.value = Math.min(size.width / 132, 7.2)

    if (
      currentPlane?.material instanceof MeshBasicMaterial &&
      nextPlane?.material instanceof MeshBasicMaterial
    ) {
      currentPlane.material.opacity = 1 - dissolve * 0.92
      nextPlane.material.opacity = dissolve
    }

    if (pairRef.current[0] !== currentIndex || pairRef.current[1] !== nextIndex) {
      pairRef.current = [currentIndex, nextIndex]

      const current = samples[currentIndex]
      const upcoming = samples[nextIndex]

      // TypedArray.set() — copies into pre-allocated buffers in-place.
      // Zero heap allocations, zero GC pressure (was: 5× .slice() = 5× 242 KB).
      scratchBuffers.position.set(current.positions)
      scratchBuffers.color.set(current.colors)
      scratchBuffers.targetPosition.set(upcoming.positions)
      scratchBuffers.targetColor.set(upcoming.colors)
      scratchBuffers.edge.set(current.edges)

      ;(activeGeometry.getAttribute('position') as BufferAttribute).needsUpdate = true
      ;(activeGeometry.getAttribute('color') as BufferAttribute).needsUpdate = true
      ;(activeGeometry.getAttribute('aTargetPosition') as BufferAttribute).needsUpdate = true
      ;(activeGeometry.getAttribute('aTargetColor') as BufferAttribute).needsUpdate = true
      ;(activeGeometry.getAttribute('aEdge') as BufferAttribute).needsUpdate = true

      if (
        currentPlane?.material instanceof MeshBasicMaterial &&
        nextPlane?.material instanceof MeshBasicMaterial
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

  // Fallback dimensions before samples arrive — use the max viewport dimensions
  const plane0Width  = samples?.[0].width  ?? MAX_IMAGE_WIDTH
  const plane0Height = samples?.[0].height ?? MAX_IMAGE_HEIGHT
  const plane1Width  = samples?.[1].width  ?? MAX_IMAGE_WIDTH
  const plane1Height = samples?.[1].height ?? MAX_IMAGE_HEIGHT

  return (
    <group>
      <mesh
        ref={currentPlaneRef}
        position={[0, 0, -0.22]}
        scale={[plane0Width, plane0Height, 1]}
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
        scale={[plane1Width, plane1Height, 1]}
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
      {/* Particle system only renders once the worker has finished sampling */}
      {geometry && (
        <points ref={pointsRef} geometry={geometry} material={material} />
      )}
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
      onCreated={({ gl }) => {
        textureManager.init(gl)
      }}
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
