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

// 2. Font Preloading — latin-only subsets for fastest first paint (Polish ext loads after)
const fontFiles = files.filter(f => f.endsWith('.woff2') && (f.includes('teko-latin.') || f.includes('manrope-latin.')));
const fontPreloads = fontFiles.map(f => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin>`).join('\n');

// 3. Logo Preloading — smallest avif gets fetchpriority=high (LCP element on mobile)
const logoFiles = files.filter(f => (f.includes('logo-') || f.includes('fest-logo')) && (f.endsWith('.avif') || f.endsWith('.webp')));
// Sort by file size ascending so the mobile (smaller) variant gets high priority
const logoFilesWithSize = logoFiles.map(f => ({
  name: f,
  size: fs.statSync(path.join(assetsDir, f)).size,
})).sort((a, b) => a.size - b.size);

const logoPreloads = logoFilesWithSize.map((f, i) =>
  `<link rel="preload" href="/assets/${f.name}" as="image" type="image/${f.name.split('.').pop()}"${i === 0 ? ' fetchpriority="high"' : ''}>`
).join('\n');

// 4. Build head injection block
const headContent = `
  ${title}
  ${meta}
  ${link}
  ${fontPreloads}
  ${logoPreloads}
  ${cssContent ? `<style>${cssContent}</style>` : ''}
`;

// 5. Inject SSR content — handle both the comment placeholder and the stripped fallback
let finalHtml = template;

if (finalHtml.includes('<!--ssr-outlet-->')) {
  finalHtml = finalHtml.replace('<!--ssr-outlet-->', html);
} else {
  // Vite may strip HTML comments inside elements during build
  finalHtml = finalHtml.replace('<div id="root"></div>', `<div id="root">${html}</div>`);
}

// 6. Inject head content — prefer the comment placeholder, fall back to </head>
if (finalHtml.includes('<!--ssr-head-->')) {
  finalHtml = finalHtml.replace('<!--ssr-head-->', headContent);
} else {
  finalHtml = finalHtml.replace('</head>', `${headContent}\n</head>`);
}

// 7. Cleanup
// Remove the now-redundant external CSS link (we inlined it above)
finalHtml = finalHtml.replace(/<link rel="stylesheet"[^>]*href="\/assets\/index-[^>]*\.css"[^>]*>/g, '');

// Remove stale dev-mode font preloads pointing at /src/assets/
finalHtml = finalHtml.replace(/<link rel="preload"[^>]*href="\/src\/assets\/fonts\/[^>]*"[^>]*>/g, '');

// Deduplicate any double <title> injected by Helmet + original template
const titleTagMatches = finalHtml.match(/<title>[^<]*<\/title>/g) || [];
if (titleTagMatches.length > 1) {
  // Keep only the first occurrence
  let firstSeen = false;
  finalHtml = finalHtml.replace(/<title>[^<]*<\/title>/g, (match) => {
    if (!firstSeen) { firstSeen = true; return match; }
    return '';
  });
}

fs.writeFileSync(toAbsolute('../dist/index.html'), finalHtml);
console.log('✅ SSG Prerender with Optimized Preloads completed successfully.');
