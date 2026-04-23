import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticleRiverProps {
  particleCount?: number
  width?: number
  velocityRef: React.MutableRefObject<number>
}

export function ParticleRiver({ particleCount = 2000, width = 40, velocityRef }: ParticleRiverProps) {
  const pointsRef = useRef<THREE.Points>(null)

  // Pre-calculate positions and custom attributes
  const [positions, progress, sizes] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    const prog = new Float32Array(particleCount)
    const sz = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      // Wide distribution across the gallery length (X)
      const x = (Math.random() - 0.5) * width
      // Narrow band in Y for "river" look
      const y = (Math.random() - 0.5) * 3.5
      // Depth spread for parallax
      const z = (Math.random() - 0.5) * 6

      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z

      // Normalize X position (0 to 1) for gradient mapping
      prog[i] = (x / width) + 0.5
      // Random base size for each particle
      sz[i] = Math.random()
    }
    return [pos, prog, sz]
  }, [particleCount, width])

  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uVelocity: { value: 0 },
      uColorStart: { value: new THREE.Color('#4f46e5') }, // Deep Indigo
      uColorMid: { value: new THREE.Color('#9333ea') },   // Fest Purple
      uColorEnd: { value: new THREE.Color('#fbbf24') }    // Gold
    },
    vertexShader: `
      uniform float uTime;
      uniform float uVelocity;
      attribute float progress;
      attribute float aSize;
      varying float vProgress;

      void main() {
        vProgress = progress;
        vec3 pos = position;

        // Kinetic wave deformation
        float speed = 1.0 + uVelocity * 2.0;
        float wave1 = sin(pos.x * 0.4 + uTime * speed) * 1.5;
        float wave2 = cos(pos.x * 0.2 - uTime * (speed * 0.6)) * 1.0;
        
        pos.y += wave1;
        pos.z += wave2;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        // Perspective-based size with random variation
        float size = 18.0 * aSize * (1.0 + uVelocity * 0.5);
        gl_PointSize = size / -mvPosition.z;
      }
    `,
    fragmentShader: `
      uniform vec3 uColorStart;
      uniform vec3 uColorMid;
      uniform vec3 uColorEnd;
      varying float vProgress;

      void main() {
        // Circular particle with soft falloff
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;

        // 3-way horizontal gradient
        vec3 color;
        if (vProgress < 0.5) {
          color = mix(uColorStart, uColorMid, vProgress * 2.0);
        } else {
          color = mix(uColorMid, uColorEnd, (vProgress - 0.5) * 2.0);
        }

        // Soft glow alpha
        float alpha = smoothstep(0.5, 0.15, d) * 0.8;
        
        gl_FragColor = vec4(color, alpha);
      }
    `
  }), [])

  useFrame((state) => {
    if (!pointsRef.current) return
    const material = pointsRef.current.material as THREE.ShaderMaterial
    const velocity = velocityRef.current || 0
    
    material.uniforms.uTime.value = state.clock.elapsedTime
    material.uniforms.uVelocity.value = THREE.MathUtils.lerp(material.uniforms.uVelocity.value, velocity, 0.05)
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          count={particleCount} 
          array={positions} 
          itemSize={3} 
        />
        <bufferAttribute 
          attach="attributes-progress" 
          count={particleCount} 
          array={progress} 
          itemSize={1} 
        />
        <bufferAttribute 
          attach="attributes-aSize" 
          count={particleCount} 
          array={sizes} 
          itemSize={1} 
        />
      </bufferGeometry>
      <shaderMaterial 
        args={[shaderArgs]} 
        transparent 
        depthWrite={false} 
        blending={THREE.AdditiveBlending} 
      />
    </points>
  )
}
