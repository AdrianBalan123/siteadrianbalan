// Primește vizualizările și clickurile importante de pe site. Anonim: fără cookie-uri,
// fără adrese IP salvate. Vizitatorii unici se numără cu o amprentă care se schimbă zilnic
// (hash din IP + browser + o cheie secretă a zilei), deci nu pot fi urmăriți de la o zi la alta.
import { createHash } from 'node:crypto';
import { dayKey, redis, RETENTION, statsConfigured } from './_redis.js';
import { sameOrigin } from './_session.js';

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|gtmetrix|preview|facebookexternalhit|whatsapp|telegram|discord|slack|skype|curl|wget|python|node-fetch|axios|go-http|java\/|okhttp|vercel/i;
const PAGE = /^\/(?:articole(?:\/[a-z0-9-]{1,140})?|despre|servicii|contact|confidentialitate)?$/;
const EVENTS = new Set(['call', 'whatsapp', 'book', 'form', 'maps', 'faq', 'read', 'share-whatsapp', 'share-facebook', 'share-copy']);

// where the visit came from, from the referrer's host
function source(ref, host) {
  let h = '';
  try {
    h = new URL(ref).hostname.replace(/^www\.|^m\.|^l\.|^lm\./, '');
  } catch {
    return 'Direct';
  }
  if (!h) return 'Direct';
  if (h === host.replace(/^www\./, '')) return null; // a page of this site: not a new visit
  const known = [
    [/(^|\.)google\./, 'Google'],
    [/(^|\.)bing\.com$/, 'Bing'],
    [/duckduckgo\.com$/, 'DuckDuckGo'],
    [/yahoo\./, 'Yahoo'],
    [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, 'Facebook'],
    [/instagram\.com$/, 'Instagram'],
    [/(^|\.)(t\.co|x\.com|twitter\.com)$/, 'X / Twitter'],
    [/linkedin\.com$|lnkd\.in$/, 'LinkedIn'],
    [/tiktok\.com$/, 'TikTok'],
    [/reddit\.com$/, 'Reddit'],
    [/whatsapp\.com$|wa\.me$/, 'WhatsApp'],
    [/chatgpt\.com$|openai\.com$/, 'ChatGPT'],
    [/perplexity\.ai$/, 'Perplexity'],
    [/claude\.ai$/, 'Claude'],
    [/gemini\.google\.com$/, 'Gemini'],
  ];
  for (const [rx, name] of known) if (rx.test(h)) return name;
  return h.slice(0, 60);
}

// simple per-instance limit, so nobody can flood the counters
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.t > 60000) {
    hits.set(ip, { n: 1, t: now });
    if (hits.size > 5000) hits.clear();
    return false;
  }
  return ++h.n > 60;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(204);
  if (req.method !== 'POST' || !statsConfigured() || !sameOrigin(req)) return res.end();
  const ua = String(req.headers['user-agent'] || '');
  if (!ua || BOT.test(ua)) return res.end();
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  if (limited(ip)) return res.end();

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.end();
    }
  }
  if (!body || typeof body !== 'object') return res.end();

  const p = String(body.p || '/').split(/[?#]/)[0].replace(/\.html$/, '').replace(/\/index$/, '/').replace(/(.)\/$/, '$1') || '/';
  if (!PAGE.test(p)) return res.end();

  const d = dayKey();
  const k = (name) => `st:${name}:${d}`;
  const cmds = [];
  const touched = new Set();
  const add = (cmd) => {
    cmds.push(cmd);
    touched.add(cmd[1]);
  };

  if (body.e) {
    const e = String(body.e);
    if (!EVENTS.has(e)) return res.end();
    add(['ZINCRBY', k('e'), 1, e]);
    if (e === 'read') add(['ZINCRBY', k('rd'), 1, p]);
  } else {
    const visitor = createHash('sha256').update(`${process.env.SESSION_SECRET || ''}|${d}|${ip}|${ua}`).digest('hex').slice(0, 20);
    add(['HINCRBY', k('d'), 'pv', 1]);
    add(['PFADD', k('u'), visitor]);
    add(['ZINCRBY', k('p'), 1, p]);
    const src = source(String(body.r || ''), String(req.headers.host || ''));
    if (src) {
      // the first page of a visit: where it came from and on what device
      const w = Number(body.w) || 0;
      add(['HINCRBY', k('d'), 'visits', 1]);
      add(['ZINCRBY', k('s'), 1, src]);
      add(['ZINCRBY', k('dv'), 1, w && w < 768 ? 'Telefon' : w && w < 1100 ? 'Tabletă' : 'Calculator']);
      add(['ZINCRBY', k('in'), 1, p]);
    }
  }
  for (const key of touched) cmds.push(['EXPIRE', key, RETENTION]);
  try {
    await redis(cmds);
  } catch {}
  return res.end();
}
