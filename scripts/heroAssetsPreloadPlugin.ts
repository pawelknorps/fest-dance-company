import type { Plugin } from 'vite'

export const heroAssetsPreloadPlugin = (): Plugin => ({
  name: 'hero-assets-preload',
  transformIndexHtml(html) {
    // 3. First two KTX2 WebGL textures (fetch type, anonymous CORS to match JS fetch)
    const ktx2Preloads = `
      <link rel="preload" as="fetch" crossorigin="anonymous" href="/textures/portfolio-1.ktx2" />
      <link rel="preload" as="fetch" crossorigin="anonymous" href="/textures/portfolio-2.ktx2" />
    `

    return html.replace(
      '</head>',
      `${ktx2Preloads}\n  </head>`
    )
  }
})
