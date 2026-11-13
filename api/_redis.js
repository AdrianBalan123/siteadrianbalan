// Statisticile site-ului stau într-o bază Redis (Upstash, legată din Vercel → Storage).
// Vercel pune singur variabilele KV_REST_API_URL / KV_REST_API_TOKEN (sau UPSTASH_REDIS_REST_*).
const URL_ = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const statsConfigured = () => Boolean(URL_() && TOKEN());

// several commands in one request; returns the list of results (an error result becomes null)
export async function redis(commands) {
  if (!commands.length) return [];
  const res = await fetch(`${URL_()}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`Redis ${res.status}`);
  return (await res.json()).map((r) => (r && 'result' in r ? r.result : null));
}

// calendar day in Romania, e.g. "2026-11-13"
export const dayKey = (date = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Bucharest', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);

// the last n days, oldest first, ending today (offset = how many days before today it ends)
export function lastDays(n, offset = 0) {
  const out = [];
  const now = Date.now();
  for (let i = n - 1 + offset; i >= offset; i--) out.push(dayKey(new Date(now - i * 86400000)));
  return [...new Set(out)]; // DST days could repeat a date
}

export const RETENTION = 60 * 60 * 24 * 400; // daily counters are kept ~13 months
