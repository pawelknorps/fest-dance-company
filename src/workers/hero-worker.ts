import * as THREE from 'three'

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let points: THREE.Points | null = null
let isVisible = true
let progress = 0

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data

  switch (type) {
    case 'INIT': {
      const { canvas, width, height, dpr } = payload
      
      renderer = new THREE.WebGLRenderer({ 
        canvas, 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance'
      })
      renderer.setPixelRatio(dpr)
      renderer.setSize(width, height, false)

      scene = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
      camera.position.z = 5

      // Advanced SOTA Particle System
      const geometry = new THREE.BufferGeometry()
      const count = 18000
      const pos = new Float32Array(count * 3)
      const color = new Float32Array(count * 3)
      const sizes = new Float32Array(count)
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        // Initial distribution: sphere
        const r = 2.5 + Math.random() * 0.5
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        
        pos[i3] = r * Math.sin(phi) * Math.cos(theta)
        pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
        pos[i3 + 2] = r * Math.cos(phi)
        
        // Dynamic colors
        color[i3] = 0.78 // R
        color[i3 + 1] = 0.31 // G
        color[i3 + 2] = 1.0 // B (Purple base)
        
        sizes[i] = Math.random()
      }
      
      geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(color, 3))
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
      
      const material = new THREE.PointsMaterial({ 
        size: 0.012, 
        vertexColors: true,
        transparent: true,
        opacity: 0.82,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
      
      points = new THREE.Points(geometry, material)
      scene.add(points)

      animate()
      break
    }
    case 'RESIZE': {
      if (renderer && camera) {
        const { width, height } = payload
        renderer.setSize(width, height, false)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
      }
      break
    }
    case 'SET_VISIBLE': {
      isVisible = payload
      break
    }
    case 'SET_PROGRESS': {
      progress = payload
      break
    }
  }
}

function animate() {
  if (!renderer || !scene || !camera || !points || !isVisible) {
    if (!isVisible) requestAnimationFrame(animate)
    return
  }
  
  const time = performance.now() * 0.001
  
  // Dynamic particle choreography based on progress
  const positions = points.geometry.attributes.position.array as Float32Array
  const count = positions.length / 3
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    const x = positions[i3]
    const y = positions[i3 + 1]
    
    // Wave motion
    positions[i3 + 2] += Math.sin(time + x * 0.5) * 0.002
    
    // Swirl effect based on progress
    if (progress > 0.1) {
      const angle = progress * 0.02
      const nx = positions[i3] * Math.cos(angle) - positions[i3 + 1] * Math.sin(angle)
      const ny = positions[i3] * Math.sin(angle) + positions[i3 + 1] * Math.cos(angle)
      positions[i3] = nx
      positions[i3 + 1] = ny
    }
  }
  points.geometry.attributes.position.needsUpdate = true
  
  points.rotation.y += 0.001 + progress * 0.005
  points.rotation.x = Math.sin(time * 0.5) * 0.05
  
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}
