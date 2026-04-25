/**
 * SOTA WebCodecs Video Decoder Worker
 * Decodes video chunks off the main thread and renders to OffscreenCanvas.
 */

let canvas: OffscreenCanvas | null = null
let ctx: OffscreenCanvasRenderingContext2D | null = null
let decoder: VideoDecoder | null = null
let isVisible = true
let frameCount = 0

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data

  switch (type) {
    case 'INIT': {
      canvas = payload.canvas
      ctx = canvas!.getContext('2d')
      
      // Initialize WebCodecs Decoder
      decoder = new VideoDecoder({
        output: (frame) => {
          if (isVisible && ctx) {
            // Render and immediately close to free GPU memory
            ctx.drawImage(frame, 0, 0, canvas!.width, canvas!.height)
          }
          frame.close()
        },
        error: (e) => console.error('WebCodecs Decoder Error:', e)
      })
      break
    }
    
    case 'CONFIGURE': {
      if (decoder) {
        decoder.configure(payload.config)
      }
      break
    }

    case 'DECODE': {
      if (decoder && decoder.state === 'configured') {
        decoder.decode(payload.chunk)
      }
      break
    }

    case 'SET_VISIBLE': {
      isVisible = payload
      break
    }

    case 'RESIZE': {
      if (canvas) {
        canvas.width = payload.width
        canvas.height = payload.height
      }
      break
    }
  }
}
