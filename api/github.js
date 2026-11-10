// Intermediar spre GitHub pentru panoul de administrare: doar pentru cine e autentificat,
// doar spre repository-ul site-ului și doar operațiile de care are nevoie editorul.
import { getSession, sameOrigin } from './_session.js';

const SHA = '[0-9a-f]{40}';
const ALLOWED = [
  ['GET', /^$/],
  ['GET', /^\/contents\/[^?#]+(\?ref=[\w.-]+)?$/],
  ['GET', new RegExp(`^/git/blobs/${SHA}$`)],
  ['GET', /^\/git\/ref\/heads\/[\w.-]+$/],
  ['GET', new RegExp(`^/git/commits/${SHA}$`)],
  ['POST', /^\/git\/blobs$/],
  ['POST', /^\/git\/trees$/],
  ['POST', /^\/git\/commits$/],
  ['PATCH', /^\/git\/refs\/heads\/[\w.-]+$/],
];

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!getSession(req)) return res.status(401).json({ error: 'Sesiunea a expirat. Intră din nou.' });
  if (req.method !== 'GET' && !sameOrigin(req)) return res.status(403).json({ error: 'Cerere respinsă.' });

  const path = String(req.query.path || '');
  if (path.includes('..') || !ALLOWED.some(([m, rx]) => m === req.method && rx.test(path))) {
    return res.status(400).json({ error: 'Operație nepermisă.' });
  }

  const gh = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPO}${path}`, {
    method: req.method,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'site-adrian-balan-admin',
      ...(req.method !== 'GET' ? { 'Content-Type': 'application/json' } : {}),
    },
    body: req.method !== 'GET' ? JSON.stringify(req.body || {}) : undefined,
  });
  const text = await gh.text();
  res.status(gh.status);
  res.setHeader('Content-Type', gh.headers.get('content-type') || 'application/json');
  return res.send(text);
}
