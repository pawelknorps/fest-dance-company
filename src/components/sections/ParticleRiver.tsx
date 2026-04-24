import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, AdditiveBlending } from 'three'
import type { ShaderMaterial, Points } from 'three'

interface ParticleRiverProps {
  particleCount?: number
  width?: number
  velocityRef: React.MutableRefObject<number>
}

export function ParticleRiver({ particleCount = 1800, width = 45, velocityRef }: Partial<ParticleRiverProps>) {
  const pointsRef = useRef<Points>(null)

  const [positions, progress, sizes] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    const prog = new Float32Array(particleCount)
    const sz = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * width
      const y = (Math.random() - 0.5) * 3.5
      const z = (Math.random() - 0.5) * 6

      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z

      prog[i] = (x / width) + 0.5
      sz[i] = 0.5 + Math.random() * 0.5
    }
    return [pos, prog, sz]
  }, [particleCount, width])

  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uVelocity: { value: 0 },
      uColorStart: { value: new Color('#4f46e5') },
      uColorMid: { value: new Color('#9333ea') },
      uColorEnd: { value: new Color('#fbbf24') }
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

        float speed = 1.0 + uVelocity * 1.8;
        float wave = sin(pos.x * 0.35 + uTime * speed);
        pos.y += wave * 1.5;
        pos.z += cos(pos.x * 0.25 + uTime * speed * 0.5) * 1.0;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        gl_PointSize = (16.0 * aSize * (1.0 + uVelocity * 0.4)) / -mvPosition.z;
      }
    `,
    fragmentShader: `
      uniform vec3 uColorStart;
      uniform vec3 uColorMid;
      uniform vec3 uColorEnd;
      varying float vProgress;

      void main() {
        vec2 cxy = 2.0 * gl_PointCoord - 1.0;
        float r2 = dot(cxy, cxy);
        if (r2 > 1.0) discard;

        vec3 color;
        float midMask = step(0.5, vProgress);
        color = mix(
          mix(uColorStart, uColorMid, vProgress * 2.0),
          mix(uColorMid, uColorEnd, (vProgress - 0.5) * 2.0),
          midMask
        );

        float alpha = (1.0 - r2) * 0.6;
        gl_FragColor = vec4(color, alpha);
      }
    `
  }), [])

  useFrame((state) => {
    if (!pointsRef.current) return
    const mat = pointsRef.current.material as ShaderMaterial
    const vel = velocityRef?.current || 0
    
    mat.uniforms.uTime.value = state.clock.elapsedTime
    mat.uniforms.uVelocity.value += (vel - mat.uniforms.uVelocity.value) * 0.1
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          args={[positions, 3]} 
        />
        <bufferAttribute 
          attach="attributes-progress" 
          args={[progress, 1]} 
        />
        <bufferAttribute 
          attach="attributes-aSize" 
          args={[sizes, 1]} 
        />
      </bufferGeometry>
      <shaderMaterial 
        args={[shaderArgs]} 
        transparent 
        depthWrite={false} 
        blending={AdditiveBlending}
      />
    </points>
  )
}
