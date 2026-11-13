// Administrarea: login cu utilizator și parolă; serverul (funcțiile din /api, pe Vercel) ține tokenul GitHub
// și face commit-urile. Fiecare salvare = un commit; Vercel publică automat noua versiune.
import * as T from '/assets/js/template.js';
import { showStats } from '/admin/stats.js';

const $ = (s) => document.querySelector(s);

// the old version kept a GitHub token in this browser: remove it
try {
  localStorage.removeItem('ab-admin');
} catch {}

let cfg = { user: '', branch: 'main' };

async function api(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    credentials: 'same-origin',
    headers: opts.body ? { 'Content-Type': 'application/json' } : {},
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error((data && data.error) || `Serverul a răspuns cu eroarea ${res.status}.`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/* ---------------- GitHub, through /api/github ---------------- */
async function gh(path, opts = {}) {
  try {
    return await api(`/api/github?path=${encodeURIComponent(path)}`, opts);
  } catch (e) {
    if (e.status === 401) {
      cfg.user = '';
      show('login');
      e.message = 'Sesiunea a expirat. Intră din nou.';
    }
    if (e.status === 409 || e.status === 422) e.message = 'Site-ul a fost modificat între timp. Reîncarcă pagina și încearcă din nou.';
    throw e;
  }
}

const b64ToText = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\n/g, '')), (c) => c.charCodeAt(0)));

async function readText(path) {
  const data = await gh(`/contents/${path.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(cfg.branch)}`);
  if (data.content) return b64ToText(data.content);
  const blob = await gh(`/git/blobs/${data.sha}`); // files over 1 MB
  return b64ToText(blob.content);
}

// One atomic commit with several file changes: {path, text} | {path, base64} | {path, remove: true}
async function commit(changes, message) {
  const ref = await gh(`/git/ref/heads/${encodeURIComponent(cfg.branch)}`);
  const head = await gh(`/git/commits/${ref.object.sha}`);
  const tree = [];
  for (const c of changes) {
    if (c.remove) {
      tree.push({ path: c.path, mode: '100644', type: 'blob', sha: null });
      continue;
    }
    const blob = await gh('/git/blobs', {
      method: 'POST',
      body: JSON.stringify(c.base64 != null ? { content: c.base64, encoding: 'base64' } : { content: c.text, encoding: 'utf-8' }),
    });
    tree.push({ path: c.path, mode: '100644', type: 'blob', sha: blob.sha });
  }
  const newTree = await gh('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: head.tree.sha, tree }) });
  const newCommit = await gh('/git/commits', { method: 'POST', body: JSON.stringify({ message, tree: newTree.sha, parents: [ref.object.sha] }) });
  await gh(`/git/refs/heads/${encodeURIComponent(cfg.branch)}`, { method: 'PATCH', body: JSON.stringify({ sha: newCommit.sha }) });
}

/* ---------------- helpers ---------------- */
function slugify(s) {
  const map = { ă: 'a', â: 'a', î: 'i', ș: 's', ş: 's', ț: 't', ţ: 't' };
  let out = s
    .toLowerCase()
    .replace(/[ăâîșşțţ]/g, (c) => map[c])
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (out.length > 80) out = out.slice(0, 81).replace(/-[^-]*$/, '');
  return out || 'articol';
}

function sanitize(html) {
  const allowed = { P: [], H2: [], H3: [], STRONG: [], EM: [], U: [], S: [], UL: [], OL: [], LI: [], BLOCKQUOTE: [], A: ['href'], BR: [] };
  const rename = { B: 'strong', I: 'em', H1: 'h2', H4: 'h3', H5: 'h3', H6: 'h3', DIV: 'p' };
  const drop = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'FORM', 'INPUT', 'BUTTON', 'TEXTAREA', 'SELECT', 'SVG', 'MATH', 'IMG', 'VIDEO', 'AUDIO', 'LINK', 'META']);
  const doc = new DOMParser().parseFromString(`<div>${html.replace(/&nbsp;| /g, ' ')}</div>`, 'text/html');
  const walk = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.COMMENT_NODE) {
        child.remove();
        continue;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      let el = child;
      if (drop.has(el.tagName)) {
        el.remove();
        continue;
      }
      if (rename[el.tagName]) {
        const n = doc.createElement(rename[el.tagName]);
        while (el.firstChild) n.appendChild(el.firstChild);
        el.replaceWith(n);
        el = n;
      }
      walk(el);
      if (!allowed[el.tagName]) {
        el.replaceWith(...el.childNodes);
        continue;
      }
      for (const a of [...el.attributes]) if (!allowed[el.tagName].includes(a.name)) el.removeAttribute(a.name);
      if (el.tagName === 'A') {
        const href = (el.getAttribute('href') || '').trim();
        if (!/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(href)) el.removeAttribute('href');
        else if (/^https?:\/\//i.test(href)) {
          el.setAttribute('target', '_blank');
          el.setAttribute('rel', 'noopener noreferrer');
        }
      }
      if (['P', 'H2', 'H3', 'LI', 'BLOCKQUOTE'].includes(el.tagName) && !el.textContent.trim()) el.remove();
    }
  };
  const root = doc.body.firstChild;
  walk(root);
  return [...root.children].map((e) => e.outerHTML).join('\n');
}

function excerptFrom(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  for (const p of doc.querySelectorAll('p')) {
    let t = p.textContent.replace(/\s+/g, ' ').trim();
    if (t.length > 80) {
      if (t.length > 220) t = t.slice(0, 220).replace(/\s\S*$/, '') + '…';
      return t;
    }
  }
  return '';
}

const readingMinutes = (html) => Math.max(1, Math.round(new DOMParser().parseFromString(html, 'text/html').body.textContent.split(/\s+/).filter(Boolean).length / 200));

function resizeImage(file, max = 1600) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#FBF9F5';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL('image/jpeg', 0.84).split(',')[1]);
    };
    img.onerror = () => reject(new Error('Imaginea nu poate fi citită. Folosește JPG, PNG sau WebP.'));
    img.src = URL.createObjectURL(file);
  });
}

/* ---------------- UI state ---------------- */
let articles = [];
let quill;
let editing = null; // article being edited, or null for a new one

function show(view) {
  for (const v of ['login', 'list', 'editor', 'stats']) $(`#view-${v}`).hidden = v !== view;
  $('#admin-nav').hidden = view === 'login';
  for (const a of document.querySelectorAll('#admin-nav [data-tab]')) {
    if (a.dataset.tab === (view === 'editor' ? 'list' : view)) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
  $('#loading').hidden = true;
}
function flash(msg) {
  const f = $('#flash');
  f.textContent = msg;
  f.hidden = !msg;
}
function error(msg) {
  const e = $('#error');
  e.textContent = msg || '';
  e.hidden = !msg;
  if (msg) window.scrollTo({ top: 0, behavior: 'smooth' });
}
function busy(on) {
  $('#loading').hidden = !on;
}

async function loadArticles() {
  articles = JSON.parse(await readText('data/articole.json'));
}

// the list shows LIST_PER_PAGE articles at a time; the search filters by title
const LIST_PER_PAGE = 20;
let listPage = 1;
let listQuery = '';
const fold = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const debounce = (fn, ms) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

function renderList() {
  const pub = articles.filter((a) => a.published !== false).length;
  $('#list-count').textContent = `${articles.length} articole, dintre care ${pub} publicate.`;
  // keep each article's real index: the buttons act on articles[i]
  const hits = articles.map((a, i) => [a, i]).filter(([a]) => !listQuery || fold(a.title).includes(fold(listQuery)));
  const pages = Math.max(1, Math.ceil(hits.length / LIST_PER_PAGE));
  listPage = Math.min(listPage, pages);
  const pager = $('#list-pager');
  pager.hidden = pages < 2;
  pager.innerHTML = Array.from({ length: pages }, (_, k) => `<button type="button" class="page-num" data-p="${k + 1}"${k + 1 === listPage ? ' aria-current="page"' : ''} aria-label="Pagina ${k + 1}">${k + 1}</button>`).join('');
  $('#list').innerHTML = hits
    .slice((listPage - 1) * LIST_PER_PAGE, listPage * LIST_PER_PAGE)
    .map(
      ([a, i]) => `<li>
  <div class="admin-thumb">${T.thumb(a.thumbnail)}</div>
  <div class="admin-info">
    <a class="admin-title" href="#editeaza/${T.esc(a.slug)}">${T.esc(a.title)}</a>
    <span class="admin-meta">${a.published !== false ? '<span class="pill on">Publicat</span>' : '<span class="pill off">Ascuns</span>'} ${new Date(a.date).toLocaleDateString('ro-RO')}</span>
  </div>
  <div class="admin-actions">
    <a class="btn btn-ghost btn-sm" href="#editeaza/${T.esc(a.slug)}">Editează</a>
    ${a.published !== false ? `<a class="btn btn-ghost btn-sm" href="/articole/${T.esc(a.slug)}" target="_blank" rel="noopener">Vezi</a>` : ''}
    <button class="btn btn-ghost btn-sm" data-toggle="${i}">${a.published !== false ? 'Ascunde' : 'Publică'}</button>
    <button class="btn btn-danger btn-sm" data-delete="${i}">Șterge</button>
  </div>
</li>`
    )
    .join('');
}

// Every change rewrites the shared pages that list articles.
async function sharedPageChanges() {
  const list = await readText('articole.html');
  return [
    { path: 'data/articole.json', text: JSON.stringify(articles, null, 1) + '\n' },
    { path: 'articole.html', text: T.replaceBetween(list, T.MARK.listStart, T.MARK.listEnd, T.listBlock(articles)) },
    { path: 'sitemap.xml', text: T.sitemap(articles) },
  ];
}

const isUpload = (u) => u && u.startsWith('/uploads/articole/');

/* ---------------- actions ---------------- */
async function togglePublished(i) {
  const a = articles[i];
  const wasPublished = a.published !== false;
  busy(true);
  try {
    await loadArticles();
    const cur = articles.find((x) => x.slug === a.slug);
    cur.published = !wasPublished;
    const changes = await sharedPageChanges();
    if (cur.published) {
      const content = await readText(`data/continut/${cur.slug}.html`);
      changes.push({ path: `articole/${cur.slug}.html`, text: T.articlePage(cur, content) });
    } else {
      changes.push({ path: `articole/${cur.slug}.html`, remove: true });
    }
    await commit(changes, `${cur.published ? 'Publică' : 'Ascunde'} articolul: ${cur.title}`);
    flash(cur.published ? 'Articolul a fost publicat. Site-ul se actualizează în aproximativ un minut.' : 'Articolul a fost ascuns. Site-ul se actualizează în aproximativ un minut.');
    renderList();
  } catch (e) {
    error(e.message);
  } finally {
    busy(false);
  }
}

async function remove(i) {
  const a = articles[i];
  if (!confirm(`Ștergi definitiv articolul „${a.title}”? Nu poate fi recuperat din admin.`)) return;
  busy(true);
  try {
    await loadArticles();
    const cur = articles.find((x) => x.slug === a.slug);
    articles = articles.filter((x) => x.slug !== a.slug);
    const changes = await sharedPageChanges();
    changes.push({ path: `data/continut/${cur.slug}.html`, remove: true });
    if (cur.published !== false) changes.push({ path: `articole/${cur.slug}.html`, remove: true });
    if (isUpload(cur.thumbnail)) changes.push({ path: cur.thumbnail.slice(1), remove: true });
    await commit(changes, `Șterge articolul: ${cur.title}`);
    flash(`Articolul „${cur.title}” a fost șters.`);
    renderList();
  } catch (e) {
    error(e.message);
  } finally {
    busy(false);
  }
}

async function openEditor(slug) {
  error('');
  editing = slug ? articles.find((a) => a.slug === slug) : null;
  if (slug && !editing) {
    location.hash = '';
    return;
  }
  show('editor');
  $('#editor-title').textContent = editing ? 'Editează articolul' : 'Articol nou';
  $('#title').value = editing?.title || '';
  $('#excerpt').value = editing?.excerpt || '';
  $('#published').checked = editing ? editing.published !== false : true;
  $('#thumbnail').value = '';
  $('#remove-thumb').checked = false;
  $('#remove-thumb-row').hidden = !editing?.thumbnail;
  $('#thumb-preview').innerHTML = T.thumb(editing?.thumbnail);
  const link = $('#view-on-site');
  link.hidden = !(editing && editing.published !== false);
  if (editing) link.href = `/articole/${editing.slug}`;
  $('#faq-rows').replaceChildren();
  (editing?.faq || []).forEach((f) => addFaqRow(f.q, f.a));

  if (!quill) {
    quill = new Quill('#editor', {
      theme: 'snow',
      placeholder: 'Scrie articolul aici…',
      modules: { toolbar: [[{ header: [2, 3, false] }], ['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }], ['blockquote', 'link'], ['clean']] },
    });
    quill.on('text-change', (d, o, source) => {
      if (source === 'user') dirty = true;
    });
  }
  quill.setText('');
  if (editing) {
    busy(true);
    try {
      const html = await readText(`data/continut/${editing.slug}.html`);
      quill.setContents(quill.clipboard.convert({ html }), 'silent');
    } catch (e) {
      error(e.message);
    } finally {
      busy(false);
    }
  }
  dirty = false;
}

/* ---------------- FAQ rows ---------------- */
function addFaqRow(q = '', a = '') {
  const row = document.createElement('div');
  row.className = 'faq-row';
  const qi = document.createElement('input');
  qi.type = 'text';
  qi.className = 'faq-q';
  qi.maxLength = 200;
  qi.placeholder = 'Întrebarea';
  qi.setAttribute('aria-label', 'Întrebarea');
  qi.value = q;
  const ai = document.createElement('textarea');
  ai.className = 'faq-ans';
  ai.rows = 3;
  ai.maxLength = 1000;
  ai.placeholder = 'Răspunsul';
  ai.setAttribute('aria-label', 'Răspunsul');
  ai.value = a;
  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'faq-del';
  del.textContent = 'Șterge';
  del.addEventListener('click', () => {
    row.remove();
    dirty = true;
  });
  for (const el of [qi, ai]) el.addEventListener('input', () => (dirty = true));
  row.append(qi, ai, del);
  $('#faq-rows').append(row);
  return row;
}

const readFaq = () =>
  [...document.querySelectorAll('#faq-rows .faq-row')]
    .map((r) => ({ q: r.querySelector('.faq-q').value.replace(/\s+/g, ' ').trim(), a: r.querySelector('.faq-ans').value.replace(/\s+/g, ' ').trim() }))
    .filter((f) => f.q && f.a);

async function save(ev) {
  ev.preventDefault();
  error('');
  const title = $('#title').value.replace(/\s+/g, ' ').trim();
  const content = sanitize(quill.getSemanticHTML());
  if (!title) return error('Adaugă un titlu.');
  if (!new DOMParser().parseFromString(content, 'text/html').body.textContent.trim()) return error('Articolul nu are conținut.');

  const btn = $('#save-btn');
  btn.disabled = true;
  btn.textContent = 'Se publică…';
  try {
    await loadArticles(); // always start from the latest version
    const prev = editing ? articles.find((a) => a.slug === editing.slug) : null;
    let slug = prev?.slug;
    if (!slug) {
      const base = slugify(title);
      slug = base;
      for (let n = 2; articles.some((a) => a.slug === slug); n++) slug = `${base}-${n}`;
    }
    const changes = [];
    let thumbnail = prev?.thumbnail || null;
    const file = $('#thumbnail').files[0];
    if ($('#remove-thumb').checked || file) {
      if (isUpload(thumbnail)) changes.push({ path: thumbnail.slice(1), remove: true });
      thumbnail = null;
    }
    if (file) {
      const rand = Math.random().toString(16).slice(2, 8);
      thumbnail = `/uploads/articole/${slug}-${rand}.jpg`;
      changes.push({ path: thumbnail.slice(1), base64: await resizeImage(file) });
    }
    const entry = {
      slug,
      title,
      excerpt: $('#excerpt').value.replace(/\s+/g, ' ').trim() || excerptFrom(content),
      thumbnail,
      readingMinutes: readingMinutes(content),
      published: $('#published').checked,
      date: prev?.date || new Date().toISOString(),
      faq: readFaq(),
    };
    if (prev) articles[articles.indexOf(prev)] = entry;
    else articles.unshift(entry);

    changes.push(...(await sharedPageChanges()));
    changes.push({ path: `data/continut/${slug}.html`, text: content + '\n' });
    if (entry.published) changes.push({ path: `articole/${slug}.html`, text: T.articlePage(entry, content) });
    else if (prev && prev.published !== false) changes.push({ path: `articole/${slug}.html`, remove: true });

    await commit(changes, `${prev ? 'Actualizează' : 'Articol nou'}: ${title}`);
    dirty = false;
    flash(entry.published ? 'Articolul a fost salvat. Apare pe site în aproximativ un minut.' : 'Articolul a fost salvat ca ascuns.');
    location.hash = '';
  } catch (e) {
    error(e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Salvează articolul';
  }
}

/* ---------------- routing ---------------- */
let dirty = false;
async function route() {
  if (!cfg.user) return show('login');
  const h = location.hash.slice(1);
  if (h === 'nou') return openEditor(null);
  if (h.startsWith('editeaza/')) return openEditor(decodeURIComponent(h.slice(9)));
  if (h === 'statistici') {
    show('stats');
    return showStats({ api, titleOf: (slug) => articles.find((a) => a.slug === slug)?.title });
  }
  show('list');
  renderList();
}

async function start() {
  busy(true);
  try {
    try {
      const me = await api('/api/me');
      cfg = { user: me.user, branch: me.branch || 'main' };
      // this browser belongs to an administrator: its visits don't count in the statistics
      try {
        localStorage.setItem('ab-notrack', '1');
      } catch {}
    } catch (e) {
      cfg.user = '';
      show('login');
      if (e.status !== 401) error(e.message);
      return;
    }
    await loadArticles();
    await route();
  } catch (e) {
    show('login');
    error(e.message);
  } finally {
    busy(false);
  }
}

/* ---------------- events ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    error('');
    busy(true);
    try {
      await api('/api/login', { method: 'POST', body: JSON.stringify({ username: $('#username').value.trim(), password: $('#password').value }) });
      $('#password').value = '';
      await start();
    } catch (err) {
      error(err.message);
    } finally {
      busy(false);
    }
  });

  $('#logout').addEventListener('click', async () => {
    try {
      await api('/api/logout', { method: 'POST' });
    } catch {}
    cfg = { user: '', branch: 'main' };
    location.hash = '';
    show('login');
  });

  $('#list-search').addEventListener(
    'input',
    debounce((e) => {
      listQuery = e.target.value.trim();
      listPage = 1;
      renderList();
    }, 180)
  );
  $('#list-pager').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    listPage = Number(b.dataset.p);
    renderList();
    $('#view-list').scrollIntoView({ behavior: 'smooth' });
  });

  $('#list').addEventListener('click', (e) => {
    const t = e.target.closest('[data-toggle]');
    const d = e.target.closest('[data-delete]');
    flash('');
    error('');
    if (t) togglePublished(Number(t.dataset.toggle));
    if (d) remove(Number(d.dataset.delete));
  });

  $('#article-form').addEventListener('submit', save);
  $('#faq-add').addEventListener('click', () => {
    addFaqRow().querySelector('.faq-q').focus();
    dirty = true;
  });
  $('#article-form').addEventListener('input', () => (dirty = true));
  $('#thumbnail').addEventListener('change', () => {
    const f = $('#thumbnail').files[0];
    if (f) $('#thumb-preview').innerHTML = `<img src="${URL.createObjectURL(f)}" alt="">`;
  });

  window.addEventListener('hashchange', () => {
    if (!location.hash.startsWith('#editeaza') && location.hash !== '#nou') error('');
    route();
  });
  window.addEventListener('beforeunload', (e) => {
    if (dirty && !$('#view-editor').hidden) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
  start();
});
