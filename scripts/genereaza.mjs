// Regenerează TOATE paginile HTML din șabloane (assets/js/template.js)
// și din datele articolelor (data/articole.json + data/continut/*.html).
// Rulează după ce modifici designul sau textele din assets/js/content.js:
//   node scripts/genereaza.mjs
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import * as T from '../assets/js/template.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const p = (...x) => path.join(root, ...x);

const list = JSON.parse(readFileSync(p('data/articole.json'), 'utf8'));

writeFileSync(p('index.html'), T.homePage());
writeFileSync(p('articole.html'), T.articlesPage(list));
writeFileSync(p('despre.html'), T.aboutPage());
writeFileSync(p('servicii.html'), T.servicesPage());
writeFileSync(p('contact.html'), T.contactPage());
writeFileSync(p('404.html'), T.notFoundPage());
writeFileSync(p('sitemap.xml'), T.sitemap(list));

mkdirSync(p('articole'), { recursive: true });
const keep = new Set();
for (const a of T.published(list)) {
  const content = readFileSync(p('data/continut', `${a.slug}.html`), 'utf8');
  writeFileSync(p('articole', `${a.slug}.html`), T.articlePage(a, content));
  keep.add(`${a.slug}.html`);
}
for (const f of readdirSync(p('articole'))) if (!keep.has(f)) rmSync(p('articole', f));

console.log(`Gata: 6 pagini + ${keep.size} articole generate.`);
