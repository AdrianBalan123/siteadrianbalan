// Dashboard-ul de statistici din panoul de administrare.
// Datele vin de la /api/stats; graficul e desenat în SVG, fără biblioteci externe.

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
  if (!prev) return `<span class="kpi-delta">${days === 1 ? 'ieri: 0' : 'fără date pentru perioada anterioară'}</span>`;
  const d = Math.round(((cur - prev) / prev) * 100);
  const label = days === 1 ? 'față de ieri' : 'față de perioada anterioară';
  if (d === 0) return `<span class="kpi-delta">la fel ca ${days === 1 ? 'ieri' : 'perioada anterioară'}</span>`;
  return `<span class="kpi-delta ${d > 0 ? 'up' : 'down'}">${d > 0 ? '▲ +' : '▼ '}${d}% ${label}</span>`;
}

function kpi(label, value, sub, cur, prev, days) {
  return `<div class="kpi"><span class="kpi-label">${label}</span><strong class="kpi-value">${num(value)}</strong>${sub ? `<span class="kpi-sub">${sub}</span>` : ''}${delta(cur, prev, days)}</div>`;
}

// a ranked list with a thin bar per row (one hue: it shows size, not identity)
function bars(title, rows, { note = '', empty = 'Încă nu sunt date.', limit = 8, extra } = {}) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  const total = rows.reduce((a, r) => a + r[1], 0);
  const item = (r, i) =>
    `<li${i >= limit ? ' class="more" hidden' : ''}><div class="bar-row"><span class="bar-label">${esc(r[0])}</span><span class="bar-value">${num(r[1])}${extra ? extra(r) : `<small>${pct(r[1], total)}%</small>`}</span></div><span class="bar" style="--w:${(r[1] / max) * 100}%"></span></li>`;
  return `<section class="stat-card"><h2>${title}</h2>${note ? `<p class="stat-note">${note}</p>` : ''}${
    rows.length
      ? `<ol class="bars">${rows.map(item).join('')}</ol>${rows.length > limit ? `<button type="button" class="linklike show-more">Arată toate (${rows.length})</button>` : ''}`
      : `<p class="stat-empty">${empty}</p>`
  }</section>`;
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
  const body = state.root;
  const t = s.totals;
  const p = s.prev;
  const articles = s.pages.filter(([path]) => path.startsWith('/articole/'));
  const reads = Object.fromEntries(s.reads);
  const pagesOther = s.pages.filter(([path]) => !path.startsWith('/articole/')).map(([path, n]) => [PAGES[path] || path, n]);
  const ev = Object.fromEntries(s.events);
  const evRows = EVENTS.filter(([k]) => ev[k]).map(([k, label]) => [label, ev[k]]);
  const art = articles.sort((a, b) => b[1] - a[1]).map(([path, n]) => [state.titleOf(path.slice(10)) || path.slice(10), n, reads[path] || 0]);
  const entries = s.entries.sort((a, b) => b[1] - a[1]).map(([path, n]) => [PAGES[path] || state.titleOf(path.slice(10)) || path, n]);
  const sortDesc = (l) => [...l].sort((a, b) => b[1] - a[1]);

  body.innerHTML = `
<div class="kpis">
${kpi('Vizitatori unici', t.uv, '', t.uv, p.uv, days)}
${kpi('Vizite', t.visits, t.visits ? `${(t.pv / t.visits).toLocaleString('ro-RO', { maximumFractionDigits: 1 })} pagini pe vizită` : '', t.visits, p.visits, days)}
${kpi('Pagini vizualizate', t.pv, '', t.pv, p.pv, days)}
${kpi('Contactări', t.contacts, t.uv ? `Sună, WhatsApp sau formular · ${pct(t.contacts, t.uv)}% din vizitatori` : 'Sună, WhatsApp sau formular', t.contacts, p.contacts, days)}
</div>
${
  days > 1
    ? `<section class="stat-card chart-card"><div class="chart-head"><h2>Pe zile</h2><div class="seg" role="group" aria-label="Ce arată graficul"><button type="button" data-metric="uv" aria-pressed="${state.metric === 'uv'}">Vizitatori</button><button type="button" data-metric="pv" aria-pressed="${state.metric === 'pv'}">Vizualizări</button></div></div><div class="chart"></div></section>`
    : ''
}
<div class="stat-grid">
${bars('Articole citite', art, {
  note: 'Vizualizări și câți au ajuns până la finalul articolului.',
  empty: 'Niciun articol vizualizat în perioada asta.',
  extra: (r) => `<small title="citite până la final">${num(r[2])} până la final</small>`,
})}
${bars('Interacțiuni', evRows, { note: 'Clickuri care pot aduce o programare.', empty: 'Nicio interacțiune încă.', limit: 10, extra: () => '' })}
${bars('De unde vin vizitatorii', sortDesc(s.sources), { note: '„Direct” = au scris adresa sau au venit dintr-o aplicație.' })}
${bars('Pagini', sortDesc(pagesOther))}
${bars('Dispozitive', sortDesc(s.devices))}
${bars('Prima pagină văzută', entries, { note: 'Pe ce pagină intră oamenii pe site.' })}
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
        more.previousElementSibling.querySelectorAll('.more').forEach((li) => (li.hidden = false));
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
