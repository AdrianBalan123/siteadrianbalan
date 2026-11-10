import { checkPassword, configured, sameOrigin, sameUser, setSession } from './_session.js';

// încercări greșite pe adresă IP (în memoria instanței) + o pauză la fiecare eșec, contra ghicirii parolei
const fails = new Map();
const LIMIT = 8;
const WINDOW = 15 * 60 * 1000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodă nepermisă.' });
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Cerere respinsă.' });
  if (!configured()) return res.status(500).json({ error: 'Administrarea nu e configurată încă (variabilele de mediu din Vercel).' });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'necunoscut';
  const now = Date.now();
  const f = fails.get(ip);
  if (f && now - f.since < WINDOW && f.count >= LIMIT) {
    return res.status(429).json({ error: 'Prea multe încercări. Mai încearcă peste 15 minute.' });
  }

  const { username, password } = req.body || {};
  const ok = sameUser(username) && checkPassword(password);
  if (!ok) {
    const cur = f && now - f.since < WINDOW ? f : { count: 0, since: now };
    cur.count += 1;
    fails.set(ip, cur);
    await sleep(800);
    return res.status(401).json({ error: 'Utilizator sau parolă greșită.' });
  }
  fails.delete(ip);
  setSession(res, process.env.ADMIN_USER);
  return res.status(200).json({ user: process.env.ADMIN_USER });
}
