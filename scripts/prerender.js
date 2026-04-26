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

// Find and inline CSS
const assetsDir = toAbsolute('../dist/assets');
const files = fs.readdirSync(assetsDir);
const cssFile = files.find(f => f.endsWith('.css'));
let cssContent = '';
if (cssFile) {
  cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf-8');
}

let finalHtml = template.replace('<!--ssr-outlet-->', html);
finalHtml = finalHtml.replace(
  '<!--ssr-head-->', 
  `${title} ${meta} ${link} ${cssContent ? `<style>${cssContent}</style>` : ''}`
);

// Remove the external CSS link tag to prevent double loading
finalHtml = finalHtml.replace(/<link rel="stylesheet"[^>]*href="\/assets\/index-[^>]*\.css"[^>]*>/, '');

fs.writeFileSync(toAbsolute('../dist/index.html'), finalHtml);
console.log('✅ SSG Prerender with Inlined CSS completed successfully.');
