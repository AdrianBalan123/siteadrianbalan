// Șabloanele HTML ale site-ului. Sunt folosite de:
//  - scripts/genereaza.mjs (generează toate paginile, rulat cu Node)
//  - admin/admin.js (generează pagina unui articol când e salvat din admin)
import { NAV, SERVICES, SITE, TESTIMONIALS, TOPICS } from './content.js';

export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Lucide (lucide.dev), outline
const ICONS = {
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  menu: '<path d="M4 12h16M4 6h16M4 18h16"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  quote: '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  arrowUpRight: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
};

export function icon(name) {
  if (name === 'whatsapp') {
    return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.4 5.1 5.24-1.37A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.1.82.83-3.03-.2-.31a8.2 8.2 0 1 1 6.95 3.85Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.55.12-.16.25-.63.8-.78.97-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.22a7.4 7.4 0 0 1-1.37-1.7c-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.66.31c-.23.25-.86.84-.86 2.05 0 1.2.88 2.37 1 2.53.13.17 1.73 2.64 4.2 3.7.58.25 1.04.4 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.15-1.17-.06-.1-.23-.17-.47-.29Z"/></svg>';
  }
  if (name === 'facebook') {
    return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21.9v-7.1h2.4l.36-2.8H13.5v-1.78c0-.81.23-1.36 1.38-1.36h1.47V6.35a19.7 19.7 0 0 0-2.15-.11c-2.13 0-3.59 1.3-3.59 3.69V12H8.2v2.8h2.4v7.1a10 10 0 1 1 2.9 0Z"/></svg>';
  }
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}

// Logo: monograma AB
export const archMark = () =>
  '<svg viewBox="200 15 570 925" aria-hidden="true"><path d="M444 22 583 403h-27L444 90 268 580h-26zM207 432h214v20H207z" fill="currentColor"/><path d="M467 442h88c105 0 165 58 165 126 0 47-20 72-70 102 60 20 100 60 100 125 0 80-60 125-175 125H467z" fill="none" stroke="currentColor" stroke-width="20"/></svg>';

const logo = () =>
  `<a href="/" class="logo" aria-label="Adrian Bălan, psiholog clinician: pagina principală">${archMark()}<span><span class="logo-name">${esc(SITE.name)}</span><span class="logo-role">${esc(SITE.role)}</span></span></a>`;

const BOOK = '/contact.html#programare';

export const contactActions = (cls = 'hero-actions') =>
  `<div class="${cls}"><a class="btn btn-primary" href="${BOOK}">${icon('calendar')} Programează o ședință</a><a class="btn btn-ghost" href="tel:${SITE.phoneTel}">${icon('phone')} ${esc(SITE.phoneDisplay)}</a></div>`;

export const ctaBox = () =>
  `<aside class="cta-box"><div><h2>Vrei să vorbim?</h2><p>Pentru o discuție preliminară sau o programare, lasă-mi un mesaj sau sună-mă la ${esc(SITE.phoneDisplay)}.</p></div>${contactActions('cta-actions')}</aside>`;

export function thumb(src) {
  return src
    ? `<img src="${esc(src)}" alt="" loading="lazy" decoding="async">`
    : `<div class="thumb-fallback">${archMark()}</div>`;
}

export function card(a) {
  return `<a href="/articole/${esc(a.slug)}.html" class="card" data-search="${esc(`${a.title} ${a.excerpt}`.toLowerCase())}"><div class="thumb">${thumb(a.thumbnail)}<span class="card-arrow" aria-hidden="true">${icon('arrowUpRight')}</span></div><div class="card-body"><h3>${esc(a.title)}</h3><span class="meta">${icon('book')} ${Number(a.readingMinutes) || 1} min de citit</span></div></a>`;
}

export function layout({ title, description, path = '/', current = '', ogImage = '/assets/img/adrian-balan.jpg', body, type = 'website', head = '' }) {
  const nav = NAV.map((n) => `<a href="${n.href}"${n.href === current ? ' aria-current="page"' : ''}>${esc(n.label)}</a>`).join('');
  return `<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(SITE.url + path)}">
<meta property="og:type" content="${type}">
<meta property="og:locale" content="ro_RO">
<meta property="og:site_name" content="Adrian Bălan, psiholog clinician">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(SITE.url + ogImage)}">
<meta name="theme-color" content="#FBF9F5">
<link rel="icon" href="/assets/img/icon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/lora-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/style.css">
<script src="/assets/js/main.js" defer blocking="render"></script>
<script>
// Intro animations start when the page is actually shown (not while it is prerendered in the background),
// and Acasă ⇄ Despre navigations get their own "scroll" transitions.
(function (d) {
  var show = function () { d.documentElement.classList.add('revealed'); };
  if (d.prerendering) d.addEventListener('prerenderingchange', show, { once: true });
  else show();
  addEventListener('pagereveal', function (e) {
    var a = window.navigation && navigation.activation;
    var from = a && a.from && a.from.url ? new URL(a.from.url).pathname : '';
    var home = function (p) { return p === '/' || p === '/index.html'; };
    if (!e.viewTransition) return;
    if (home(from) && location.pathname === '/despre.html') e.viewTransition.types.add('to-about');
    if (from === '/despre.html' && home(location.pathname)) {
      e.viewTransition.types.add('to-landing');
      d.documentElement.classList.add('no-intro');
    }
  });
})(document);
</script>${head}
</head>
<body>
<a href="#continut" class="skip">Sari la conținut</a>
<header class="site-header" data-open="false" data-scrolled="false">
<div class="wrap header-inner">
${logo()}
<nav class="nav" id="main-nav" aria-label="Navigare principală">${nav}<a class="nav-call" href="${BOOK}">Programează o ședință</a></nav>
<div class="header-cta"><a class="btn btn-primary btn-sm" href="${BOOK}">Programează o ședință</a><button class="menu-btn" type="button" aria-expanded="false" aria-controls="main-nav" aria-label="Deschide meniul"><span class="i-open">${icon('menu')}</span><span class="i-close" hidden>${icon('close')}</span></button></div>
</div>
</header>
<main id="continut">
${body}
</main>
<footer class="site-footer">
<div class="wrap">
<div class="footer-grid">
<div class="footer-brand">${logo()}<p>Terapie, evaluare psihologică și suport emoțional pentru adolescenți și adulți, în Timișoara.</p></div>
<nav aria-label="Navigare în subsol"><h3>Navigare</h3><ul class="footer-pages">${NAV.map((n) => `<li><a href="${n.href}">${esc(n.label)}</a></li>`).join('')}</ul></nav>
<div><h3>Contact</h3><ul class="footer-contact"><li><a href="tel:${SITE.phoneTel}">${icon('phone')} ${esc(SITE.phoneDisplay)}</a></li><li><a href="${SITE.whatsapp}" target="_blank" rel="noopener noreferrer">${icon('whatsapp')} Scrie pe WhatsApp</a></li><li><a href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(SITE.mapsQuery)}" target="_blank" rel="noopener noreferrer">${icon('pin')} ${esc(SITE.address)}</a></li></ul></div>
</div>
<div class="footer-bottom"><span>© ${new Date().getFullYear()} Adrian Bălan, psiholog clinician</span><span>Pentru urgențe medicale sau psihiatrice, sună la 112.</span></div>
</div>
</footer>
<a class="fab" href="${SITE.whatsapp}" target="_blank" rel="noopener noreferrer" aria-label="Scrie pe WhatsApp">${icon('whatsapp')}</a>
</body>
</html>
`;
}

const QUOTE = 'Cred cu tărie că fiecare persoană poartă în sine resursele necesare pentru vindecare, sens și transformare.';

const choice = (v) => `<label class="choice"><input type="checkbox" value="${esc(v)}"><span>${esc(v)}</span></label>`;

// Formularul compune mesajul și îl deschide în WhatsApp (site static, fără server).
// Fără JavaScript, trimite doar câmpul „text” direct la wa.me.
export const bookingForm = () =>
  `<form class="booking-form" id="programare" action="${SITE.whatsapp}" method="get" target="_blank">
<h2>Programează o ședință</h2>
<p class="form-lead">Lasă-mi câteva cuvinte și revin cu o propunere de programare.</p>
<div class="field"><label for="f-nume">Nume</label><input id="f-nume" autocomplete="name" required></div>
<fieldset class="field"><legend>Când îți este mai ușor? <span>(opțional)</span></legend>
<div class="choices" data-group="zile">${['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri'].map((z) => choice(z)).join('')}</div>
<div class="choices" data-group="interval">${['Dimineața', 'După-amiaza', 'Seara'].map((z) => choice(z)).join('')}</div>
</fieldset>
<div class="field"><label for="f-tema">Despre ce ai vrea să vorbim? <span>(opțional)</span></label><select id="f-tema"><option value="">Aleg mai târziu</option>${SERVICES.map((s) => `<option>${esc(s.title)}</option>`).join('')}<option>Nu sunt sigur, aș vrea o discuție preliminară</option></select></div>
<div class="field"><label for="f-mesaj">Mesaj</label><textarea id="f-mesaj" name="text" rows="4" placeholder="Câteva rânduri sunt suficiente, nu e nevoie de detalii." required></textarea></div>
<button class="btn btn-primary" type="submit">${icon('whatsapp')} Trimite pe WhatsApp</button>
<p class="trust-note">${icon('lock')} Mesajul se deschide în WhatsApp, gata de trimis. Nimic nu se salvează pe site.</p>
</form>`;

const contactInfo = () =>
  `<div class="contact-card">
<div><p class="label">Telefon și WhatsApp</p><a class="phone-big" href="tel:${SITE.phoneTel}">${esc(SITE.phoneDisplay)}</a></div>
<div class="actions"><a class="btn btn-primary" href="tel:${SITE.phoneTel}">${icon('phone')} Sună acum</a><a class="btn btn-ghost" href="${SITE.whatsapp}" target="_blank" rel="noopener noreferrer">${icon('whatsapp')} WhatsApp</a></div>
<div><p class="label">Adresa cabinetului</p><address>${esc(SITE.address)}</address><p style="margin-top:10px"><a class="text-link" href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(SITE.mapsQuery)}" target="_blank" rel="noopener noreferrer">Deschide în Google Maps</a></p></div>
<p class="pill">${icon('clock')} Ședințe de 50 de minute</p>
</div>`;

/* ---------- blocks regenerated by the admin inside existing pages ---------- */
export const MARK = {
  listStart: '<!-- LISTA-ARTICOLE:START (generat automat, nu edita) -->',
  listEnd: '<!-- LISTA-ARTICOLE:END -->',
};

export const published = (list) => list.filter((a) => a.published !== false);

export function listBlock(list) {
  return `<div class="cards article-list">${published(list).map(card).join('\n')}</div>`;
}

export function replaceBetween(html, start, end, inner) {
  const i = html.indexOf(start);
  const j = html.indexOf(end);
  if (i === -1 || j === -1 || j < i) throw new Error(`Nu găsesc marcajul ${start} în pagină.`);
  return html.slice(0, i + start.length) + '\n' + inner + '\n' + html.slice(j);
}

export function sitemap(list) {
  const urls = ['/', '/articole.html', '/despre.html', '/servicii.html', '/contact.html', ...published(list).map((a) => `/articole/${a.slug}.html`)];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${esc(SITE.url + u)}</loc></url>`).join('\n')}\n</urlset>\n`;
}

/* ---------- full pages ---------- */
// Distribuie articolul: WhatsApp, Facebook, copiere link (main.js pune adresa paginii curente).
// `top`: varianta mică din dreptul autorului, fără eticheta „Distribuie articolul”
const shareBar = (a, top = false) => {
  const url = `${SITE.url}/articole/${a.slug}.html`;
  const u = encodeURIComponent(url);
  return `<div class="share${top ? ' share-top' : ''}" data-share-title="${esc(a.title)}">
${top ? '' : '<span class="share-label">Distribuie articolul</span>'}
<div class="share-btns">
<a class="share-btn" data-share="whatsapp" href="https://wa.me/?text=${encodeURIComponent(`${a.title} ${url}`)}" target="_blank" rel="noopener noreferrer" aria-label="Distribuie pe WhatsApp">${icon('whatsapp')}</a>
<a class="share-btn" data-share="facebook" href="https://www.facebook.com/sharer/sharer.php?u=${u}" target="_blank" rel="noopener noreferrer" aria-label="Distribuie pe Facebook">${icon('facebook')}</a>
<button class="share-btn" type="button" data-share="copy" aria-label="Copiază linkul">${icon('link')}<span class="share-copied" role="status"></span></button>
</div>
</div>`;
};

export function articlePage(a, content) {
  const body = `<article>
<div class="wrap">
<header class="article-head">
<a href="/articole.html" class="back">Înapoi la articole</a>
<h1>${esc(a.title)}</h1>
<div class="article-meta"><span class="article-author">${archMark()} Adrian Bălan</span><span class="article-time">${icon('book')} ${Number(a.readingMinutes) || 1} min</span>${shareBar(a, true)}</div>
</header>
${a.thumbnail ? `<div class="article-cover"><img src="${esc(a.thumbnail)}" alt="" fetchpriority="high"></div>` : ''}
<div class="prose">
${content}
</div>
${shareBar(a)}
<div style="max-width:1000px">${ctaBox()}</div>
</div>
<section class="section" id="alte-articole" data-slug="${esc(a.slug)}" hidden aria-labelledby="alte-articole-t"><div class="wrap"><div class="section-head"><h2 id="alte-articole-t">Alte articole</h2><a href="/articole.html" class="text-link">Toate articolele</a></div><div class="cards"></div></div></section>
</article>`;
  return layout({
    title: `${a.title} | Adrian Bălan, psiholog Timișoara`,
    description: a.excerpt,
    path: `/articole/${a.slug}.html`,
    current: '/articole.html',
    ogImage: a.thumbnail || undefined,
    type: 'article',
    body,
  });
}

// Carusel de recenzii (pagina Despre), cu textul complet al fiecărei recenzii
const reviews = () =>
  `<section class="section quote-carousel" aria-labelledby="recenzii" aria-roledescription="carusel">
<div class="wrap">
<div class="section-head"><div><h2 id="recenzii">Ce spun cei cu care am lucrat</h2><p>Câteva gânduri primite de la clienți după ședințe.</p></div><p class="trust-note">${icon('lock')} Pentru confidențialitate, recenziile sunt anonime.</p></div>
<div class="quote-card"><span class="quote-icon">${icon('quote')}</span><div class="quote-stage" aria-live="polite">${TESTIMONIALS.map((t, i) => `<figure class="quote-slide${i ? '' : ' is-active'}" role="group" aria-roledescription="recenzie" aria-label="${i + 1} din ${TESTIMONIALS.length}"${i ? ' aria-hidden="true"' : ''}><blockquote>${esc(t.text)}</blockquote></figure>`).join('')}</div></div>
<div class="quote-controls" hidden><button type="button" class="quote-arrow" data-dir="-1" aria-label="Recenzia precedentă">${icon('chevronLeft')}</button><div class="quote-dots">${TESTIMONIALS.map((t, i) => `<button type="button" data-i="${i}" aria-label="Recenzia ${i + 1}"${i ? '' : ' aria-current="true"'}></button>`).join('')}</div><button type="button" class="quote-arrow" data-dir="1" aria-label="Recenzia următoare">${icon('chevronRight')}</button></div>
</div>
</section>`;

// Prima pagină: doar hero-ul, pe tot ecranul. Scroll în jos (sau săgeata) duce la Despre.
export function homePage() {
  const body = `<section class="hero hero-full" data-next="/despre.html">
<div class="hero-blob hero-blob-1" aria-hidden="true"></div><div class="hero-blob hero-blob-2" aria-hidden="true"></div>
<div class="wrap hero-center">
<h1 class="sr-only">De la simptom la soluție. Psihologie clinică explicată pe înțelesul tău.</h1>
<div class="hero-stage" aria-hidden="true">
<span class="stage-word stage-left"><small>De la</small>simptom</span>
<canvas class="hero-brain"></canvas>
<span class="stage-word stage-right"><small>la</small><em>soluție</em>.</span>
</div>
<div class="hero-copy">
<p class="hero-sub" aria-hidden="true">Psihologie clinică explicată pe înțelesul tău.</p>
<p class="hero-lead">Evaluări clinice riguroase și ghidaj psihoterapeutic specializat pentru parcursul tău personal sau de cuplu. Fără jargon inutil, doar pași clari spre binele tău.</p>
<div class="hero-actions"><a class="btn btn-primary" href="${BOOK}">${icon('calendar')} Programează o ședință</a><a class="btn btn-ghost" href="/servicii.html">Cum te pot ajuta</a></div>
<ul class="topics-line" aria-label="Teme frecvente">${TOPICS.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
</div>
</div>
<a class="scroll-cue" href="/despre.html">Află mai multe despre mine ${icon('chevronDown')}</a>
</section>`;
  // Despre is loaded ahead of time so the scroll transition is instant:
  // prerendered in Chrome/Edge, otherwise just downloaded (page + photo).
  const head = `
<script type="speculationrules">{"prerender":[{"source":"list","urls":["/despre.html"],"eagerness":"immediate"}]}</script>
<link rel="prefetch" href="/despre.html">
<link rel="prefetch" href="/assets/img/adrian-balan.jpg" as="image">
<script src="/assets/js/brain.js" defer></script>`;
  return layout({ title: 'Adrian Bălan, psiholog clinician în Timișoara', description: 'Psiholog clinician în Timișoara: terapie pentru depresie, anxietate, ADHD și traumă, evaluări psihologice, suport pentru persoane LGBTQIA+. Programări la 0720 754 920.', path: '/', current: '/', body, head });
}

// Filtre rapide pe pagina Articole: eticheta și rădăcina căutată în titlu și rezumat
const TOPIC_FILTERS = [
  ['Depresie', 'depresi'],
  ['Anxietate', 'anxiet'],
  ['ADHD', 'adhd'],
  ['Traumă', 'traum'],
  ['Identitate', 'identit'],
  ['Relații', 'relati'],
  ['Sexualitate', 'sexual'],
];

export function articlesPage(list) {
  const body = `<div class="wrap page-head page-head-compact"><h1>Articole</h1><p>Gânduri, explicații și ghiduri practice despre emoții, relații și sănătate mintală. Le poți citi în ritmul tău, oricând ai nevoie.</p></div>
<div class="wrap">
<div class="article-tools">
<div class="search-row"><label for="cauta" class="sr-only">Caută în articole</label><input id="cauta" type="search" class="search" placeholder="Caută un articol" autocomplete="off"><p class="results-count" id="numar-articole" aria-live="polite"></p></div>
<div class="topic-filters" role="group" aria-label="Filtrează după temă"><button type="button" aria-pressed="true" data-q="">Toate</button>${TOPIC_FILTERS.map(([label, q]) => `<button type="button" aria-pressed="false" data-q="${q}">${esc(label)}</button>`).join('')}</div>
</div>
${MARK.listStart}
${listBlock(list)}
${MARK.listEnd}
<nav class="pagination" id="paginare" aria-label="Pagini cu articole" hidden></nav>
<p id="fara-rezultate" class="empty" hidden>Niciun articol nu se potrivește. Încearcă un alt cuvânt sau alege „Toate”.</p>
</div>`;
  return layout({ title: 'Articole | Adrian Bălan, psiholog Timișoara', description: 'Articole despre depresie, anxietate, ADHD, traumă, relații, identitate și sexualitate, scrise de psihologul Adrian Bălan.', path: '/articole.html', current: '/articole.html', body });
}

export function aboutPage() {
  const values = [
    ['heart', 'Relația terapeutică', 'Bazată pe empatie, încredere și respect profund pentru experiența fiecărui om.'],
    ['clock', 'Ritmul tău', 'Abordarea se adaptează nevoilor și ritmului fiecărui client, fără presiune.'],
    ['shield', 'Fără judecată', 'Indiferent de orientare, identitate de gen, istoric personal sau stil de viață.'],
  ];
  const body = `<section class="about-hero">
<div class="wrap about-hero-grid">
<div class="about-photo"><div class="arch"><img src="/assets/img/adrian-balan.jpg" alt="Adrian Bălan" width="880" height="890" fetchpriority="high"></div></div>
<div class="about-intro">
<p class="pill">${icon('pin')} Psiholog clinician în Timișoara</p>
<h1>Despre mine</h1>
<p class="lead">Mă numesc Adrian Bălan și sunt psiholog clinician, dedicat înțelegerii profunde a oamenilor și a modului în care aceștia se raportează la sine, la ceilalți și la lume.</p>
<p>Lucrez cu adolescenți și adulți care se confruntă cu depresie, anxietate, traume, sexualitate, relaționare și dificultăți de identitate.</p>
<ul class="tags about-tags"><li>CBT și psihoterapii experiențiale</li><li>Adolescenți și adulți</li><li>Abordare integrativă</li></ul>
${contactActions()}
</div>
</div>
</section>
<section class="about-belief" aria-label="Ce cred">
<div class="wrap">
<figure class="quote-card"><span class="quote-icon">${icon('quote')}</span><blockquote>${esc(QUOTE)}</blockquote></figure>
<p class="about-belief-note">Rolul meu este să creez cadrul sigur, conținător și empatic în care aceste procese pot avea loc.</p>
</div>
</section>
<section class="section about-how" aria-labelledby="cum-lucrez">
<div class="wrap about-how-grid">
<div class="about-how-text">
<h2 id="cum-lucrez">Cum lucrez</h2>
<p>Abordarea mea este integrativă, îmbinând elemente din terapia cognitiv-comportamentală (CBT) cu elemente din psihoterapii experiențiale, adaptată nevoilor și ritmului fiecărui client. În centrul practicii mele se află relația terapeutică autentică, bazată pe empatie, încredere și respect profund pentru experiența unică a fiecărui om.</p>
<p>Cred într-un demers terapeutic care respectă diversitatea și individualitatea, indiferent de orientare, identitate de gen, istoric personal sau stil de viață. În cabinetul meu, creez un spațiu sigur, incluziv și lipsit de judecată, în care oricine poate explora, cu blândețe și curaj, propriile emoții, frici, dorințe și limite.</p>
</div>
<ul class="values">${values.map(([ic, h, d]) => `<li class="value"><span class="value-icon">${icon(ic)}</span><div><h3>${esc(h)}</h3><p>${esc(d)}</p></div></li>`).join('')}</ul>
</div>
</section>
<section class="about-essence" aria-labelledby="in-esenta">
<div class="wrap">
<h2 id="in-esenta">În esență</h2>
<p>Misiunea mea este să ajut oamenii să se înțeleagă, să se accepte și să-și reconstruiască relația cu sine. Terapia nu este doar despre a „rezolva” o problemă, ci despre a descoperi o formă mai autentică de a trăi: cu sens, cu grijă și cu o mai mare libertate interioară.</p>
</div>
</section>
${reviews()}
<div class="wrap">${ctaBox()}</div>`;
  return layout({ title: 'Despre mine | Adrian Bălan, psiholog Timișoara', description: 'Adrian Bălan, psiholog clinician în Timișoara. Abordare integrativă (CBT și psihoterapii experiențiale), într-un spațiu sigur, incluziv și lipsit de judecată.', path: '/despre.html', current: '/despre.html', body });
}

export function servicesPage() {
  const body = `<div class="wrap page-head">
<h1>Servicii</h1>
<p>Intervenții bazate pe dovezi științifice, evaluări cu instrumente validate și sprijin pentru tine și pentru cei apropiați. Dacă nu ești sigur de ce ai nevoie, sună-mă și lămurim împreună.</p>
<nav class="service-index" aria-label="Servicii">${SERVICES.map((s) => `<a href="#${s.id}">${esc(s.title)}</a>`).join('')}</nav>
</div>
<div class="wrap">
${SERVICES.map((s) => `<section class="service" id="${s.id}" aria-labelledby="${s.id}-t"><div><h2 id="${s.id}-t">${esc(s.title)}</h2><p class="intro">${esc(s.intro)}</p>${s.duration ? `<p class="svc-meta">${icon('clock')} ${esc(s.duration)}</p>` : ''}<ul class="tags">${s.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div><div><ul class="checklist">${s.items.map((it) => `<li>${icon('check')}<span>${esc(it)}</span></li>`).join('')}</ul>${s.note ? `<p class="note">${esc(s.note)}</p>` : ''}</div></section>`).join('\n')}
${ctaBox()}
</div>`;
  return layout({ title: 'Servicii | Adrian Bălan, psiholog Timișoara', description: 'Terapie pentru depresie, anxietate, ADHD și traumă, evaluări psihologice, consiliere pentru afirmarea identității, psihoeducație și intervenție în criză, în Timișoara.', path: '/servicii.html', current: '/servicii.html', body });
}

export function contactPage() {
  const q = encodeURIComponent(SITE.mapsQuery);
  const body = `<div class="wrap page-head"><h1>Contact și programări</h1><p>Pentru informații, o discuție preliminară sau programarea unei consultații, lasă-mi un mesaj, sună-mă sau scrie-mi pe WhatsApp. Sunt aici să răspund tuturor întrebărilor tale.</p></div>
<div class="wrap contact-grid">${bookingForm()}${contactInfo()}</div>
<div class="wrap"><div class="map map-wide"><iframe src="https://www.google.com/maps?q=${q}&amp;z=16&amp;output=embed" title="Harta: cabinetul de pe strada Aristide Demetriade 1/3, Timișoara" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div></div>`;
  return layout({ title: 'Contact și programări | Adrian Bălan, psiholog Timișoara', description: 'Programări la 0720 754 920, telefonic, pe WhatsApp sau prin formular. Cabinet pe strada Aristide Demetriade nr. 1/3, Timișoara.', path: '/contact.html', current: '/contact.html', body });
}

export function notFoundPage() {
  return layout({
    title: 'Pagina nu există | Adrian Bălan, psiholog Timișoara',
    description: 'Pagina căutată nu există.',
    path: '/404.html',
    body: '<div class="wrap page-head"><h1>Pagina nu există</h1><p>Linkul poate fi greșit sau articolul a fost mutat. Poți merge la <a class="text-link" href="/articole.html">articole</a> sau la <a class="text-link" href="/">pagina principală</a>.</p></div>',
  });
}
