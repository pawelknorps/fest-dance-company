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

let finalHtml = template.replace('<!--ssr-outlet-->', html);
finalHtml = finalHtml.replace(
  '<!--ssr-head-->', 
  `${title} ${meta} ${link}`
);

fs.writeFileSync(toAbsolute('../dist/index.html'), finalHtml);
console.log('✅ SSG Prerender completed successfully.');
