import { configured, missing, getSession } from './_session.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!configured()) return res.status(500).json({ error: `Administrarea nu e configurată încă. Lipsesc în Vercel: ${missing().join(', ')}.` });
  const s = getSession(req);
  if (!s) return res.status(401).json({ error: 'Neautentificat.' });
  return res.status(200).json({ user: s.u, branch: process.env.GITHUB_BRANCH || 'main' });
}
