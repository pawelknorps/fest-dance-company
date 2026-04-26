import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { imagetools } from 'vite-imagetools'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { heroAssetsPreloadPlugin } from './scripts/heroAssetsPreloadPlugin'
import sitemap from 'vite-plugin-sitemap'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    imagetools(),
    ViteImageOptimizer({
      exclude: ['src/assets/images'],
      png: { quality: 75 },
      jpeg: { quality: 75 },
      jpg: { quality: 75 },
      webp: { quality: 75 },
      avif: { quality: 65 },
    }),
    heroAssetsPreloadPlugin(),
    sitemap({
      hostname: 'https://festdance.company',
    }),
  ],
  build: {
    modulePreload: {
      polyfill: false,
      // Don't eagerly fetch vendor-three — Three.js is only needed on desktop for
      // the 3D portfolio. Mobile never uses it (DeviceTier.LOW), and TextureManager
      // is now dynamically imported, so vendor-three is no longer in the critical path.
      resolveDependencies: (_filename, deps) =>
        deps.filter(dep => !dep.includes('vendor-three')),
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('three') || id.includes('@react-three') || id.includes('postprocessing') || id.includes('n8ao') || id.includes('three-stdlib')) {
            return 'vendor-three';
          }
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion') || id.includes('lenis') || id.includes('react')) {
              return 'vendor-core';
            }
            if (id.includes('zod') || id.includes('react-hook-form')) {
              return 'vendor-forms';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            return 'vendor-other';
          }
        },
      },
    },
  },
})

