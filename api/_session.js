// Sesiunea din panoul de administrare: un cookie HttpOnly semnat cu SESSION_SECRET.
// Tokenul GitHub nu ajunge niciodată în browser; stă doar în variabilele de mediu din Vercel.
import { createHmac, scryptSync, timingSafeEqual } from 'node:crypto';

const COOKIE = 'ab_admin';
const MAX_AGE = 12 * 60 * 60; // 12 ore

const b64url = (buf) => Buffer.from(buf).toString('base64url');
const sign = (data) => createHmac('sha256', process.env.SESSION_SECRET).update(data).digest('base64url');

export function setSession(res, user) {
  const payload = b64url(JSON.stringify({ u: user, exp: Math.floor(Date.now() / 1000) + MAX_AGE }));
  res.setHeader('Set-Cookie', `${COOKIE}=${payload}.${sign(payload)}; Path=/api; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Strict`);
}

export function clearSession(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/api; Max-Age=0; HttpOnly; Secure; SameSite=Strict`);
}

export function getSession(req) {
  if (!process.env.SESSION_SECRET) return null;
  const raw = (req.headers.cookie || '').split(/;\s*/).find((c) => c.startsWith(COOKIE + '='));
  if (!raw) return null;
  const [payload, sig] = raw.slice(COOKIE.length + 1).split('.');
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const s = JSON.parse(Buffer.from(payload, 'base64url').toString());
    // a user removed from ADMIN_USERS loses access right away, even with a valid cookie
    return s.exp > Date.now() / 1000 && users().has(s.u) ? s : null;
  } catch {
    return null;
  }
}

// Utilizatorii: ADMIN_USERS = "admin=scrypt:<salt>:<hash>;tudor=scrypt:<salt>:<hash>"
// (generat cu: node scripts/parola-admin.mjs). Merge și varianta cu un singur utilizator: ADMIN_USER + ADMIN_PASSWORD_HASH.
function users() {
  const map = new Map();
  for (const entry of String(process.env.ADMIN_USERS || '').split(';')) {
    const k = entry.indexOf('=');
    if (k > 0) map.set(entry.slice(0, k).trim(), entry.slice(k + 1).trim());
  }
  if (process.env.ADMIN_USER && process.env.ADMIN_PASSWORD_HASH) map.set(process.env.ADMIN_USER, process.env.ADMIN_PASSWORD_HASH);
  return map;
}

function matches(stored, password) {
  const [kind, salt, hash] = String(stored || '').split(':');
  if (kind !== 'scrypt' || !salt || !hash) return false;
  const want = Buffer.from(hash, 'hex');
  const got = scryptSync(String(password), Buffer.from(salt, 'hex'), want.length);
  return timingSafeEqual(want, got);
}

const DUMMY = 'scrypt:00000000000000000000000000000000:' + '0'.repeat(128);

// the user's name when user and password match, otherwise null (an unknown user costs the same time)
export function checkLogin(user, password) {
  const stored = users().get(String(user || ''));
  const ok = matches(stored || DUMMY, password);
  return stored && ok ? String(user) : null;
}

// cererile care modifică ceva trebuie să vină de pe același site (protecție CSRF, pe lângă SameSite=Strict)
export function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

export function configured() {
  return missing().length === 0;
}

// names (never values) of the settings still missing, so the error says what to add in Vercel
export function missing() {
  const out = users().size > 0 ? [] : ['ADMIN_USERS'];
  for (const k of ['SESSION_SECRET', 'GITHUB_TOKEN', 'GITHUB_REPO']) if (!process.env[k]) out.push(k);
  return out;
}
