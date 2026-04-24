import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { imagetools } from 'vite-imagetools'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

/**
 * Injects a <link rel="preload" as="image"> for the first hero WebP into the
 * built HTML. The hero1 image URL is hashed at build time so we can't hardcode
 * it — instead we scan the bundle manifest and find the matching asset.
 *
 * In dev mode the image is served at its original path, so we inject a preload
 * pointing at the imagetools-transformed URL instead.
 */
function heroImagePreloadPlugin(): Plugin {
  let heroAssetUrl: string | null = null

  return {
    name: 'hero-image-preload',
    apply: 'build',

    generateBundle(_options, bundle) {
      // Find the emitted asset whose original name matches hero1.jpg → webp transform
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (
          chunk.type === 'asset' &&
          fileName.match(/hero1.*\.webp$/)
        ) {
          heroAssetUrl = `/${fileName}`
          break
        }
      }
    },

    transformIndexHtml(html) {
      if (!heroAssetUrl) return html
      const preloadTag = `<link rel="preload" as="image" href="${heroAssetUrl}" type="image/webp" fetchpriority="high" />`
      return html.replace('</head>', `  ${preloadTag}\n  </head>`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    imagetools(),
    ViteImageOptimizer({
      avif: {
        quality: 80,
      },
      webp: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
      png: {
        quality: 80,
      },
    }),
    heroImagePreloadPlugin(),
  ],
})
