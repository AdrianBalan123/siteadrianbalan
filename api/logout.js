import { clearSession, sameOrigin } from './_session.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodă nepermisă.' });
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Cerere respinsă.' });
  clearSession(res);
  return res.status(204).end();
}
