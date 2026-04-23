import { Sparkles, PerspectiveCamera, Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

// SOTA Flowing Gradient Shader
const flowVertexShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uVelocity;
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Wave animation reactive to velocity
    float wave = sin(uv.x * 3.0 + uTime * 2.0) * 0.5;
    wave += sin(uv.x * 5.0 - uTime * 1.5) * 0.2;
    pos.y += wave * (1.0 + uVelocity * 2.0);
    pos.z += cos(uv.x * 2.0 + uTime) * 0.5;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const flowFragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uVelocity;
  
  void main() {
    // Flowing gradient colors: Purple -> Gold -> Indigo
    vec3 col1 = vec3(0.58, 0.33, 0.99); // Purple
    vec3 col2 = vec3(1.0, 0.84, 0.0);   // Gold
    vec3 col3 = vec3(0.2, 0.1, 0.5);   // Indigo
    
    float t = vUv.x + uTime * 0.2;
    vec3 color = mix(col1, col2, sin(t * 3.0) * 0.5 + 0.5);
    color = mix(color, col3, cos(t * 2.0) * 0.5 + 0.5);
    
    // Soft horizontal fade
    float alpha = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
    // Vertical glow
    alpha *= smoothstep(0.0, 0.5, vUv.y) * smoothstep(1.0, 0.5, vUv.y) * 0.4;
    
    gl_FragColor = vec4(color, alpha * (0.3 + uVelocity));
  }
`

export function KineticScene({ 
  isMobile, 
  velocityRef,
  isIntersecting
}: { 
  isMobile?: boolean,
  velocityRef: React.MutableRefObject<number>,
  isIntersecting: boolean
}) {
  const accentLightRef = useRef<THREE.PointLight>(null)
  const sparklesGroupRef = useRef<THREE.Group>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)
  const flowRef = useRef<THREE.Mesh>(null)

  const flowUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uVelocity: { value: 0 }
  }), [])

  useFrame((state) => {
    if (!isIntersecting) return
    const velocity = velocityRef.current || 0

    if (cameraRef.current) {
      const targetFOV = 40 + velocity * 1.5
      cameraRef.current.fov = THREE.MathUtils.lerp(cameraRef.current.fov, targetFOV, 0.05)
      cameraRef.current.updateProjectionMatrix()
    }

    if (accentLightRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 0.7) * 0.2 + 0.8
      accentLightRef.current.intensity = pulse * (2.2 + velocity * 2.0)
    }

    if (sparklesGroupRef.current) {
      sparklesGroupRef.current.rotation.y += 0.002 + velocity * 0.02
    }

    // Update Flowing Gradient
    if (flowRef.current) {
      const mat = flowRef.current.material as THREE.ShaderMaterial
      mat.uniforms.uTime.value = state.clock.elapsedTime
      mat.uniforms.uVelocity.value = THREE.MathUtils.lerp(mat.uniforms.uVelocity.value, velocity, 0.05)
    }
  })

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 8]} fov={40} />
      
      <color attach="background" args={['#05030a']} />
      <fog attach="fog" args={['#08040d', 5, 26]} />

      <ambientLight intensity={0.3} />
      <spotLight position={[10, 15, 10]} angle={0.15} penumbra={1} intensity={3.5} color="#ffffff" />
      <pointLight ref={accentLightRef} position={[0, 3, -7]} intensity={2.5} color="#c084fc" distance={25} />

      {/* SOTA Flowing Gradient Ribbon — Passing between/behind images */}
      {!isMobile && (
        <mesh ref={flowRef} position={[0, 0, -2]}>
          <planeGeometry args={[40, 12, 64, 1]} />
          <shaderMaterial
            vertexShader={flowVertexShader}
            fragmentShader={flowFragmentShader}
            uniforms={flowUniforms}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Dense Atmospheric "Light River" Particles */}
      {!isMobile && (
        <group ref={sparklesGroupRef} position={[0, 0, 1]}>
          <Sparkles
            count={250} // Significantly increased density
            scale={[30, 8, 5]}
            size={1.8}
            speed={0.5}
            opacity={0.6}
            color="#ffd700"
            noise={0.3} // Lower noise for more "flow"
          />
          <Sparkles
            count={400}
            scale={[40, 12, 10]}
            size={0.8}
            speed={1.0}
            opacity={0.3}
            color="#d8b4fe"
            noise={0.5}
          />
        </group>
      )}
    </>
  )
}

export default KineticScene
