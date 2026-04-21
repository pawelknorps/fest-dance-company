import { useRef, useState, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uHover;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    
    // Create a 'liquid' displacement effect using sine waves
    float strength = 0.04 * uHover;
    float frequency = 6.0;
    
    float distortion = sin(uv.y * frequency + uTime * 2.0) * strength;
    uv.x += distortion;
    
    float distortionY = cos(uv.x * frequency + uTime * 1.5) * strength;
    uv.y += distortionY;
    
    vec4 color = texture2D(uTexture, uv);
    
    // Chromatic aberration on hover
    float shift = 0.015 * uHover;
    float r = texture2D(uTexture, uv + vec2(shift, 0.0)).r;
    float g = texture2D(uTexture, uv).g;
    float b = texture2D(uTexture, uv - vec2(shift, 0.0)).b;
    
    // Mix original color with RGB shift based on hover
    gl_FragColor = vec4(r, g, b, color.a);
  }
`

function Scene({ src, hovered }: { src: string; hovered: boolean }) {
  const texture = useLoader(THREE.TextureLoader, src)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  
  const uniforms = useMemo(() => ({
    uTexture: { value: texture },
    uHover: { value: 0 },
    uTime: { value: 0 }
  }), [texture])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
      materialRef.current.uniforms.uHover.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uHover.value,
        hovered ? 1 : 0,
        0.08
      )
    }
  })

  return (
    <mesh scale={[1, 1, 1]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  )
}

interface DisplacementImageProps {
  src: string
  alt: string
  className?: string
}

export function DisplacementImage({ src, alt, className = '' }: DisplacementImageProps) {
  const [hovered, setHovered] = useState(false)
  
  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Canvas 
        camera={{ position: [0, 0, 1], fov: 90 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene src={src} hovered={hovered} />
        </Suspense>
      </Canvas>
      <span className="sr-only">{alt}</span>
    </div>
  )
}
