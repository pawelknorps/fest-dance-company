import type { Plugin } from 'vite'

export const heroAssetsPreloadPlugin = (): Plugin => ({
  name: 'hero-assets-preload',
  transformIndexHtml(html, ctx) {
    const bundle = ctx.bundle;
    if (!bundle) return html;

    // Find Logo assets
    const logos = Object.values(bundle)
      .filter(asset => asset.name?.includes('fest-logo') && asset.fileName.endsWith('.avif'))
      .map(asset => `/${asset.fileName}`);

    const logoPreloads = logos.map(url => 
      `<link rel="preload" href="${url}" as="image" type="image/avif" fetchpriority="high">`
    ).join('\n');

    // 3. First two KTX2 WebGL textures (fetch type, anonymous CORS to match JS fetch)
    const ktx2Preloads = `
      <script>
        (function() {
          if (window.innerWidth > 768) {
            const textures = ['/textures/portfolio-1.ktx2', '/textures/portfolio-2.ktx2'];
            textures.forEach(url => {
              const link = document.createElement('link');
              link.rel = 'preload';
              link.as = 'fetch';
              link.crossOrigin = 'anonymous';
              link.href = url;
              document.head.appendChild(link);
            });
          }
        })();
      </script>
    `

    return html.replace(
      '</head>',
      `${logoPreloads}\n${ktx2Preloads}\n  </head>`
    )
  }
})
