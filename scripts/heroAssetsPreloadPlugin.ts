import type { Plugin } from 'vite'

export const heroAssetsPreloadPlugin = (): Plugin => ({
  name: 'hero-assets-preload',
  enforce: 'post',
  transformIndexHtml(html, ctx) {
    const bundle = ctx.bundle;
    if (!bundle) return html;

    // Match on fileName (hashed output path) not name, which may include query strings
    // from vite-imagetools transforms like ?format=avif&w=400
    const logoAssets = Object.values(bundle)
      .filter((asset): asset is { type: 'asset'; fileName: string; source: string | Uint8Array } =>
        asset.type === 'asset' &&
        (asset.fileName.includes('fest-logo') || asset.fileName.includes('logo-cropped')) &&
        (asset.fileName.endsWith('.avif') || asset.fileName.endsWith('.webp'))
      )
      .map(asset => ({
        fileName: asset.fileName,
        size: typeof asset.source === 'string' ? asset.source.length : asset.source.byteLength,
      }))
      .sort((a, b) => a.size - b.size); // smallest first → mobile variant gets fetchpriority=high

    const logoPreloads = logoAssets.map((asset, i) =>
      `<link rel="preload" href="/${asset.fileName}" as="image" type="image/${asset.fileName.split('.').pop()}"${i === 0 ? ' fetchpriority="high"' : ''}>`
    ).join('\n');

    // KTX2 texture hint — desktop only, after page load to avoid bandwidth contention
    const ktx2Preloads = `
      <script>
        (function() {
          if (window.innerWidth > 768) {
            window.addEventListener('load', function() {
              setTimeout(function() {
                var link = document.createElement('link');
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
    `;

    return html.replace('</head>', `${logoPreloads}\n${ktx2Preloads}\n  </head>`);
  }
})
