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
    return s.exp > Date.now() / 1000 ? s : null;
  } catch {
    return null;
  }
}

// ADMIN_PASSWORD_HASH = "scrypt:<salt hex>:<hash hex>" (generat cu: node scripts/parola-admin.mjs)
export function checkPassword(password) {
  const [kind, salt, hash] = String(process.env.ADMIN_PASSWORD_HASH || '').split(':');
  if (kind !== 'scrypt' || !salt || !hash) return false;
  const want = Buffer.from(hash, 'hex');
  const got = scryptSync(String(password), Buffer.from(salt, 'hex'), want.length);
  return timingSafeEqual(want, got);
}

export function sameUser(user) {
  const want = Buffer.from(String(process.env.ADMIN_USER || ''));
  const got = Buffer.from(String(user || ''));
  return want.length > 0 && want.length === got.length && timingSafeEqual(want, got);
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
  return ['ADMIN_USER', 'ADMIN_PASSWORD_HASH', 'SESSION_SECRET', 'GITHUB_TOKEN', 'GITHUB_REPO'].every((k) => process.env[k]);
}
