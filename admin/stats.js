// Dashboard-ul de statistici din panoul de administrare.
// Datele vin de la /api/stats; graficul e desenat în SVG, fără biblioteci externe.

import { icon } from '/assets/js/template.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const num = (n) => Number(n || 0).toLocaleString('ro-RO');
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const MONTHS = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const fmtDay = (d) => {
  const [, m, day] = d.split('-').map(Number);
  return `${day} ${MONTHS[m - 1]}`;
};

const PAGES = { '/': 'Prima pagină', '/despre': 'Despre', '/servicii': 'Servicii', '/contact': 'Contact', '/articole': 'Lista de articole', '/confidentialitate': 'Confidențialitate' };
const EVENTS = [
  ['call', 'Au apăsat „Sună”'],
  ['whatsapp', 'Au deschis WhatsApp'],
  ['form', 'Au trimis formularul de programare'],
  ['book', 'Au apăsat „Programează o ședință”'],
  ['maps', 'Au deschis harta cabinetului'],
  ['read', 'Au citit un articol până la final'],
  ['faq', 'Au deschis o întrebare frecventă'],
  ['share-whatsapp', 'Au distribuit pe WhatsApp'],
  ['share-facebook', 'Au distribuit pe Facebook'],
  ['share-copy', 'Au copiat linkul unui articol'],
];

let state = { days: 30, data: null, metric: 'uv', api: null, titleOf: null, root: null };

/* ---------- pieces ---------- */
function delta(cur, prev, days) {
  const vs = days === 1 ? 'față de ieri' : 'față de perioada trecută';
  if (!prev) return `<span class="kpi-delta">${days === 1 ? `ieri: 0` : 'prima perioadă cu date'}</span>`;
  const d = Math.round(((cur - prev) / prev) * 100);
  if (d === 0) return `<span class="kpi-delta"><span class="pill">0%</span> ${vs}</span>`;
  return `<span class="kpi-delta"><span class="pill ${d > 0 ? 'up' : 'down'}">${d > 0 ? '▲' : '▼'} ${Math.abs(d)}%</span> ${vs}</span>`;
}

function kpi(ic, label, value, cur, prev, days, sub = '') {
  return `<div class="kpi"><span class="kpi-label"><span class="kpi-icon">${icon(ic)}</span>${label}</span><strong class="kpi-value">${num(value)}${sub ? `<small>${sub}</small>` : ''}</strong>${delta(cur, prev, days)}</div>`;
}

// a ranked list with a thin bar per row (one hue: it shows size, not identity)
function bars(title, rows, { note = '', empty = 'Încă nu sunt date.', limit = 6, extra } = {}) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  const total = rows.reduce((a, r) => a + r[1], 0);
  const item = (r, i) =>
    `<li${i >= limit ? ' class="more" hidden' : ''}><div class="bar-row"><span class="bar-label" title="${esc(r[0])}">${esc(r[0])}</span><span class="bar-value">${num(r[1])}${extra ? extra(r) : `<small>${pct(r[1], total)}%</small>`}</span></div><span class="bar" style="--w:${(r[1] / max) * 100}%"></span></li>`;
  return `<section class="stat-card"><h2>${title}</h2>${note ? `<p class="stat-note">${note}</p>` : ''}${
    rows.length
      ? `<ol class="bars">${rows.map(item).join('')}</ol>${rows.length > limit ? `<button type="button" class="linklike show-more">Arată toate (${rows.length})</button>` : ''}`
      : `<p class="stat-empty">${empty}</p>`
  }</section>`;
}

// articles as a real table: views, read to the end, and the share that finished it
function articleTable(rows) {
  const limit = 10;
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return `<section class="stat-card"><div class="card-head"><div><h2>Articole</h2><p class="stat-note">Câte vizualizări a avut fiecare articol și câți cititori au ajuns până la final.</p></div></div>${
    rows.length
      ? `<table class="art-table"><thead><tr><th scope="col">Articol</th><th scope="col">Vizualizări</th><th scope="col">Citite integral</th></tr></thead><tbody>${rows
          .map(
            (r, i) =>
              `<tr${i >= limit ? ' class="more" hidden' : ''}><th scope="row"><span class="art-title" title="${esc(r[0])}">${esc(r[0])}</span><span class="bar" style="--w:${(r[1] / max) * 100}%"></span></th><td>${num(r[1])}</td><td>${num(r[2])}<small>${pct(r[2], r[1])}%</small></td></tr>`
          )
          .join('')}</tbody></table>${rows.length > limit ? `<button type="button" class="linklike show-more">Arată toate (${rows.length})</button>` : ''}`
      : `<p class="stat-empty">Niciun articol vizualizat în perioada asta.</p>`
  }</section>`;
}

// how people got in touch: the numbers that matter most for a practice
function contactCard(ev, uv) {
  const main = [
    ['phone', 'Sună', ev.call || 0],
    ['whatsapp', 'WhatsApp', ev.whatsapp || 0],
    ['message', 'Formular trimis', ev.form || 0],
  ];
  const total = main.reduce((a, r) => a + r[2], 0);
  return `<section class="stat-card contact-card-stats"><h2>Cum te-au contactat</h2>
<ul class="contact-list">${main.map(([ic, l, n]) => `<li><span class="kpi-icon">${icon(ic)}</span><span>${l}</span><strong>${num(n)}</strong></li>`).join('')}</ul>
<p class="conv"><strong>${pct(total, uv)}%</strong> dintre vizitatori au luat legătura</p>
<p class="stat-note">${num(ev.book || 0)} au apăsat „Programează o ședință”${ev.maps ? ` · ${num(ev.maps)} au deschis harta` : ''}</p></section>`;
}

/* ---------- the line chart ---------- */
function niceMax(v) {
  if (v <= 4) return 4;
  const p = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= v) return m * p;
  return 10 * p;
}

function drawChart() {
  const box = state.root.querySelector('.chart');
  if (!box) return;
  const days = state.data.days;
  const key = state.metric;
  const vals = days.map((d) => d[key]);
  const W = Math.max(280, box.clientWidth);
  const H = W < 520 ? 200 : 240;
  const m = { l: 40, r: 12, t: 14, b: 28 };
  const iw = W - m.l - m.r;
  const ih = H - m.t - m.b;
  const top = niceMax(Math.max(...vals));
  const x = (i) => m.l + (days.length === 1 ? iw / 2 : (i / (days.length - 1)) * iw);
  const y = (v) => m.t + ih - (v / top) * ih;

  let grid = '';
  for (let k = 0; k <= 4; k++) {
    const v = (top / 4) * k;
    grid += `<line class="grid" x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}"/><text class="tick" x="${m.l - 8}" y="${y(v) + 4}" text-anchor="end">${num(Math.round(v * 10) / 10)}</text>`;
  }
  const step = Math.max(1, Math.ceil(days.length / (W < 520 ? 4 : 7)));
  let xt = '';
  days.forEach((d, i) => {
    if (i % step === 0 || i === days.length - 1) {
      if (i !== days.length - 1 && x(days.length - 1) - x(i) < 64) return; // keep the last label clear
      xt += `<text class="tick" x="${x(i)}" y="${H - 8}" text-anchor="${i === 0 ? 'start' : i === days.length - 1 ? 'end' : 'middle'}">${fmtDay(d.d)}</text>`;
    }
  });
  const line = vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
  const area = `${line}L${x(vals.length - 1).toFixed(1)},${y(0)}L${x(0).toFixed(1)},${y(0)}Z`;
  const name = key === 'uv' ? 'vizitatori' : 'vizualizări';

  box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" tabindex="0" aria-label="Grafic: ${name} pe zi. Folosește săgețile pentru valori.">
${grid}${xt}
<path class="area" d="${area}"/><path class="line" d="${line}"/>
<line class="cross" y1="${m.t}" y2="${m.t + ih}" hidden/><circle class="dot" r="5" hidden/>
<rect class="hit" x="${m.l}" y="${m.t}" width="${iw}" height="${ih}"/>
</svg><div class="tip" hidden></div>`;

  const svg = box.querySelector('svg');
  const cross = svg.querySelector('.cross');
  const dot = svg.querySelector('.dot');
  const tip = box.querySelector('.tip');
  let cur = -1;
  const showAt = (i) => {
    cur = Math.max(0, Math.min(days.length - 1, i));
    const cx = x(cur);
    const cy = y(vals[cur]);
    cross.setAttribute('x1', cx);
    cross.setAttribute('x2', cx);
    dot.setAttribute('cx', cx);
    dot.setAttribute('cy', cy);
    cross.hidden = dot.hidden = tip.hidden = false;
    const d = days[cur];
    tip.innerHTML = `<strong>${num(vals[cur])}</strong> ${name}<span>${fmtDay(d.d)} · ${num(d.pv)} vizualizări · ${num(d.visits)} vizite</span>`;
    const left = Math.min(W - tip.offsetWidth - 4, Math.max(4, cx - tip.offsetWidth / 2));
    tip.style.left = `${left}px`;
    tip.style.top = `${Math.max(0, cy - tip.offsetHeight - 14)}px`;
  };
  const hide = () => {
    cross.hidden = dot.hidden = tip.hidden = true;
  };
  svg.addEventListener('pointermove', (e) => {
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    showAt(days.length === 1 ? 0 : Math.round(((px - m.l) / iw) * (days.length - 1)));
  });
  svg.addEventListener('pointerleave', hide);
  svg.addEventListener('blur', hide);
  svg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      showAt(cur < 0 ? days.length - 1 : cur + (e.key === 'ArrowRight' ? 1 : -1));
    }
  });
}

/* ---------- the whole page ---------- */
function render() {
  const { data: s, days } = state;
  const t = s.totals;
  const p = s.prev;
  const reads = Object.fromEntries(s.reads);
  const ev = Object.fromEntries(s.events);
  const sortDesc = (l) => [...l].sort((a, b) => b[1] - a[1]);
  const label = (path) => PAGES[path] || (path.startsWith('/articole/') && state.titleOf(path.slice(10))) || path;
  const art = sortDesc(s.pages.filter(([path]) => path.startsWith('/articole/'))).map(([path, n]) => [label(path), n, reads[path] || 0]);
  const pagesOther = sortDesc(s.pages.filter(([path]) => !path.startsWith('/articole/'))).map(([path, n]) => [label(path), n]);
  const other = EVENTS.filter(([k]) => !['call', 'whatsapp', 'form', 'book', 'maps'].includes(k) && ev[k]).map(([k, l]) => [l, ev[k]]);

  state.root.innerHTML = `
<div class="kpi-strip">
${kpi('users', 'Vizitatori unici', t.uv, t.uv, p.uv, days)}
${kpi('compass', 'Vizite', t.visits, t.visits, p.visits, days, t.visits ? `${(t.pv / t.visits).toLocaleString('ro-RO', { maximumFractionDigits: 1 })} pagini / vizită` : '')}
${kpi('fileText', 'Pagini vizualizate', t.pv, t.pv, p.pv, days)}
${kpi('phone', 'Contactări', t.contacts, t.contacts, p.contacts, days)}
</div>
<div class="dash-row${days > 1 ? '' : ' solo'}">
${
  days > 1
    ? `<section class="stat-card chart-card"><div class="chart-head"><h2>Evoluție pe zile</h2><div class="seg" role="group" aria-label="Ce arată graficul"><button type="button" data-metric="uv" aria-pressed="${state.metric === 'uv'}">Vizitatori</button><button type="button" data-metric="pv" aria-pressed="${state.metric === 'pv'}">Vizualizări</button></div></div><div class="chart"></div></section>`
    : ''
}
${contactCard(ev, t.uv)}
</div>
${articleTable(art)}
<div class="stat-grid three">
${bars('De unde vin', sortDesc(s.sources), { note: '„Direct” = adresa scrisă sau un link din aplicații.' })}
${bars('Dispozitive', sortDesc(s.devices))}
${bars('Pagini', pagesOther)}
</div>
<div class="stat-grid">
${bars('Prima pagină văzută', sortDesc(s.entries).map(([path, n]) => [label(path), n]), { note: 'Pe ce pagină intră oamenii pe site.' })}
${bars('Alte interacțiuni', other, { note: 'Citiri, întrebări frecvente deschise, distribuiri.', empty: 'Nicio interacțiune încă.', extra: () => '' })}
</div>`;
  drawChart();
}

async function load() {
  const body = state.root;
  body.classList.add('is-loading');
  try {
    state.data = await state.api(`/api/stats?days=${state.days}`);
    render();
  } catch (e) {
    if (e.message === 'not-configured') {
      body.innerHTML = `<section class="stat-card setup"><h2>Statisticile nu sunt pornite încă</h2>
<p>Ai nevoie de o bază de date gratuită, legată de site din Vercel (durează 2 minute):</p>
<ol><li>În Vercel, deschide proiectul <strong>siteadrianbalan</strong> → <strong>Storage</strong>.</li>
<li><strong>Create Database</strong> → alege <strong>Upstash</strong> (Redis) → planul gratuit → regiunea <strong>Frankfurt</strong>.</li>
<li>La <strong>Connect Project</strong> alege acest site, cu mediul <strong>Production</strong>.</li>
<li>Fă un <strong>Redeploy</strong>. De atunci încolo, fiecare vizită se numără.</li></ol></section>`;
    } else {
      body.innerHTML = `<p class="form-error">${esc(e.message)}</p>`;
    }
  } finally {
    body.classList.remove('is-loading');
  }
}

let wired = false;
export function showStats({ api, titleOf }) {
  state.api = api;
  state.titleOf = titleOf;
  state.root = document.querySelector('#stats-body');
  if (!wired) {
    wired = true;
    document.querySelector('#view-stats .range').addEventListener('click', (e) => {
      const b = e.target.closest('[data-days]');
      if (!b) return;
      state.days = Number(b.dataset.days);
      for (const x of b.parentNode.children) x.setAttribute('aria-pressed', String(x === b));
      load();
    });
    state.root.addEventListener('click', (e) => {
      const m = e.target.closest('[data-metric]');
      if (m) {
        state.metric = m.dataset.metric;
        for (const x of m.parentNode.children) x.setAttribute('aria-pressed', String(x === m));
        drawChart();
      }
      const more = e.target.closest('.show-more');
      if (more) {
        more.parentNode.querySelectorAll('.more').forEach((li) => (li.hidden = false));
        more.remove();
      }
    });
    let t;
    window.addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(() => state.data && !document.querySelector('#view-stats').hidden && drawChart(), 150);
    });
  }
  load();
}
