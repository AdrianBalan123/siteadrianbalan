// Statisticile pentru panoul de administrare (doar pentru cine e autentificat).
import { lastDays, redis, statsConfigured } from './_redis.js';
import { getSession } from './_session.js';

const pairs = (flat) => {
  const out = [];
  for (let i = 0; flat && i < flat.length; i += 2) out.push([flat[i], Math.round(Number(flat[i + 1]))]);
  return out;
};
const hash = (flat) => Object.fromEntries(pairs(flat));
const CONTACT = ['call', 'whatsapp', 'form'];

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!getSession(req)) return res.status(401).json({ error: 'Sesiunea a expirat. Intră din nou.' });
  if (!statsConfigured()) return res.status(503).json({ error: 'not-configured' });

  const n = Math.min(365, Math.max(1, Math.round(Number(req.query.days) || 30)));
  const days = lastDays(n);
  const prev = lastDays(n, n);
  const keys = (name, list = days) => list.map((d) => `st:${name}:${d}`);
  const union = (name, list) => ['ZUNION', list.length, ...keys(name, list), 'WITHSCORES'];

  const cmds = [];
  for (const d of days) cmds.push(['HGETALL', `st:d:${d}`], ['PFCOUNT', `st:u:${d}`]);
  const base = cmds.length;
  cmds.push(
    ['PFCOUNT', ...keys('u')],
    union('p', days),
    union('s', days),
    union('dv', days),
    union('e', days),
    union('rd', days),
    union('in', days),
    ['PFCOUNT', ...keys('u', prev)],
    union('e', prev)
  );
  for (const d of prev) cmds.push(['HGETALL', `st:d:${d}`]);

  let r;
  try {
    r = await redis(cmds);
  } catch (e) {
    return res.status(502).json({ error: 'Baza de date pentru statistici nu răspunde. Încearcă din nou peste un minut.' });
  }

  const daily = days.map((d, i) => {
    const h = hash(r[i * 2]);
    return { d, pv: h.pv || 0, visits: h.visits || 0, uv: Number(r[i * 2 + 1]) || 0 };
  });
  const [uvAll, pages, sources, devices, events, reads, entries, uvPrev, eventsPrev] = r.slice(base, base + 9);
  const prevDaily = r.slice(base + 9).map(hash);
  const sum = (list, f) => list.reduce((a, x) => a + (Number(x[f]) || 0), 0);
  const contacts = (ev) => pairs(ev).reduce((a, [k, v]) => a + (CONTACT.includes(k) ? v : 0), 0);

  return res.status(200).json({
    days: daily,
    totals: { pv: sum(daily, 'pv'), visits: sum(daily, 'visits'), uv: Number(uvAll) || 0, contacts: contacts(events) },
    prev: { pv: sum(prevDaily, 'pv'), visits: sum(prevDaily, 'visits'), uv: Number(uvPrev) || 0, contacts: contacts(eventsPrev) },
    pages: pairs(pages),
    sources: pairs(sources),
    devices: pairs(devices),
    events: pairs(events),
    reads: pairs(reads),
    entries: pairs(entries),
  });
}
