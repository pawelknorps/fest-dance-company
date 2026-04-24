/**
 * canvas-sampler-worker.ts
 *
 * Runs createSample() off the main thread for all hero images.
 * Sampling 4× 20,160-particle grids synchronously on mount was blocking
 * the main thread for 60–120 ms. This worker does all the work and
 * transfers the typed arrays back via zero-copy Transferable.
 */

interface SampleTransfer {
  positions: ArrayBuffer  // Float32Array, PARTICLE_COUNT * 3
  colors:    ArrayBuffer  // Float32Array, PARTICLE_COUNT * 3
  edges:     ArrayBuffer  // Float32Array, PARTICLE_COUNT
  width:     number       // fitted scene width
  height:    number       // fitted scene height
}

function getFittedDimensions(
  imageWidth: number,
  imageHeight: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const imageRatio = imageWidth / imageHeight
  const maxRatio   = maxWidth  / maxHeight
  if (imageRatio > maxRatio) {
    return { width: maxWidth, height: maxWidth / imageRatio }
  }
  return { width: maxHeight * imageRatio, height: maxHeight }
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

async function sampleImageUrl(
  url: string,
  gridW: number,
  gridH: number,
  maxWidth: number,
  maxHeight: number,
): Promise<SampleTransfer> {
  const particleCount = gridW * gridH

  const response  = await fetch(url)
  const blob      = await response.blob()
  const bitmap    = await createImageBitmap(blob)

  const fitted = getFittedDimensions(bitmap.width, bitmap.height, maxWidth, maxHeight)

  const canvas  = new OffscreenCanvas(gridW, gridH)
  const ctx     = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(bitmap, 0, 0, gridW, gridH)
  bitmap.close()

  const pixels    = ctx.getImageData(0, 0, gridW, gridH).data
  const positions = new Float32Array(particleCount * 3)
  const colors    = new Float32Array(particleCount * 3)
  const edges     = new Float32Array(particleCount)

  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      const index      = y * gridW + x
      const pixelIndex = index * 4

      const alpha      = pixels[pixelIndex + 3] / 255
      const brightness = (pixels[pixelIndex] + pixels[pixelIndex + 1] + pixels[pixelIndex + 2]) / (255 * 3)
      const depth      = (brightness - 0.5) * 0.52

      positions[index * 3]     = (x / (gridW - 1) - 0.5) * fitted.width
      positions[index * 3 + 1] = -(y / (gridH - 1) - 0.5) * fitted.height
      positions[index * 3 + 2] = depth

      const u = x / (gridW - 1)
      const v = y / (gridH - 1)
      const distToEdge    = Math.min(u, 1 - u, v, 1 - v)
      const cornerDistance = Math.min(
        Math.hypot(u, v),
        Math.hypot(1 - u, v),
        Math.hypot(u, 1 - v),
        Math.hypot(1 - u, 1 - v),
      )
      const edgeMask      = 1 - smoothstep(0.06, 0.2, distToEdge)
      const cornerMask    = 1 - smoothstep(0.12, 0.34, cornerDistance)
      const luminanceMask = (0.2 + alpha * 0.2) + brightness * 0.6
      edges[index] = clamp((edgeMask * 0.35 + cornerMask * 0.95) * luminanceMask, 0, 1)

      colors[index * 3]     = pixels[pixelIndex]     / 255
      colors[index * 3 + 1] = pixels[pixelIndex + 1] / 255
      colors[index * 3 + 2] = pixels[pixelIndex + 2] / 255
    }
  }

  return {
    positions: positions.buffer,
    colors:    colors.buffer,
    edges:     edges.buffer,
    width:     fitted.width,
    height:    fitted.height,
  }
}

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data

  if (type !== 'SAMPLE_IMAGES') return

  const { urls, gridW, gridH, maxW, maxH } = payload as {
    urls:  string[]
    gridW: number
    gridH: number
    maxW:  number
    maxH:  number
  }

  try {
    const samples = await Promise.all(
      urls.map(url => sampleImageUrl(url, gridW, gridH, maxW, maxH))
    )

    const transferables = samples.flatMap(s => [s.positions, s.colors, s.edges])

    // Cast self to any to avoid window.postMessage vs worker.postMessage conflict in TS
    ;(self as any).postMessage({ type: 'SAMPLES_READY', payload: { samples } }, transferables)
  } catch (err) {
    ;(self as any).postMessage({
      type: 'SAMPLE_ERROR',
      payload: { message: (err as Error).message ?? String(err) },
    })
  }
}
