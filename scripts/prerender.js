import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toAbsolute = (p) => path.resolve(__dirname, p);

const template = fs.readFileSync(toAbsolute('../dist/index.html'), 'utf-8');
const { render } = await import('../dist/server/entry-server.js');

const { html, helmet } = render();

const title = helmet?.title?.toString() || '<title>FEST Dance Company | Choreography & Movement Direction</title>';
const meta = helmet?.meta?.toString() || '';
const link = helmet?.link?.toString() || '';

// Find assets
const assetsDir = toAbsolute('../dist/assets');
const files = fs.readdirSync(assetsDir);

// 1. CSS Inlining
const cssFile = files.find(f => f.endsWith('.css'));
let cssContent = '';
if (cssFile) {
  cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf-8');
}

// 2. Font Preloading (find hashed woff2 files)
// SOTA 2026: Prioritize Latin-subset for the fastest paint
const fontFiles = files.filter(f => f.endsWith('.woff2') && (f.includes('teko-latin.') || f.includes('manrope-latin.')));
const fontPreloads = fontFiles.map(f => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin>`).join('\n');

// 3. Logo Preloading (find hashed logo images)
// We need both the large background logo and the small header logo
const logoFiles = files.filter(f => (f.includes('logo-') || f.includes('fest-logo')) && (f.endsWith('.avif') || f.endsWith('.webp')));
const logoPreloads = logoFiles.map(f => `<link rel="preload" href="/assets/${f}" as="image" type="image/${f.split('.').pop()}">`).join('\n');

let finalHtml = template.replace('<!--ssr-outlet-->', html);

// Prepare head content
const headContent = `
  ${title}
  ${meta}
  ${link}
  ${fontPreloads}
  ${logoPreloads}
  ${cssContent ? `<style>${cssContent}</style>` : ''}
`;

finalHtml = finalHtml.replace('<!--ssr-head-->', headContent);

// Cleanup
// Remove the external CSS link tag
finalHtml = finalHtml.replace(/<link rel="stylesheet"[^>]*href="\/assets\/index-[^>]*\.css"[^>]*>/, '');

// Remove stale manual font preloads from the template
finalHtml = finalHtml.replace(/<link rel="preload"[^>]*href="\/src\/assets\/fonts\/[^>]*"[^>]*>/g, '');

fs.writeFileSync(toAbsolute('../dist/index.html'), finalHtml);
console.log('✅ SSG Prerender with Optimized Preloads completed successfully.');
