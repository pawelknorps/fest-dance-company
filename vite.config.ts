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
function heroAssetsPreloadPlugin(): Plugin {
  const assetsToPreload: string[] = []

  return {
    name: 'hero-assets-preload',
    apply: 'build',

    generateBundle(_options, bundle) {
      // Find the emitted assets for the critical fest-logo
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'asset' && fileName.match(/fest-logo.*\.webp$/)) {
          assetsToPreload.push(`/${fileName}`)
          break // Only need the first match
        }
      }
    },

    transformIndexHtml(html) {
      if (assetsToPreload.length === 0) return html
      const preloadTags = assetsToPreload
        .map(url => `<link rel="preload" as="image" href="${url}" type="image/webp" fetchpriority="high" />`)
        .join('\n  ')
      return html.replace('</head>', `  ${preloadTags}\n  </head>`)
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
      png: { quality: 75 },
      jpeg: { quality: 75 },
      jpg: { quality: 75 },
      webp: { quality: 75 },
      avif: { quality: 65 },
    }),
    heroAssetsPreloadPlugin(),
  ],
})
