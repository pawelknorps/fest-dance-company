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

    // 3. One KTX2 WebGL texture (fetch type) with a delay to avoid bandwidth competition
    const ktx2Preloads = `
      <script>
        (function() {
          if (window.innerWidth > 768) {
            window.addEventListener('load', () => {
              setTimeout(() => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'fetch';
                link.crossOrigin = 'anonymous';
                link.href = '/textures/portfolio-1.ktx2';
                document.head.appendChild(link);
              }, 3000);
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
