// Generează valorile pentru variabilele de mediu din Vercel: ADMIN_USERS și SESSION_SECRET.
// Rulează:  node scripts/parola-admin.mjs
// Parolele nu se salvează nicăieri; în Vercel pui doar hash-urile.
import { randomBytes, scryptSync } from 'node:crypto';
import { createInterface } from 'node:readline/promises';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const entries = [];
for (;;) {
  const user = (await rl.question('Utilizator (Enter gol = gata): ')).trim();
  if (!user) break;
  const pass = await rl.question(`Parola pentru ${user}: `);
  const salt = randomBytes(16);
  entries.push(`${user}=scrypt:${salt.toString('hex')}:${scryptSync(pass, salt, 64).toString('hex')}`);
}
rl.close();
if (!entries.length) process.exit(0);
console.log('\nPune în Vercel → Settings → Environment Variables:\n');
console.log(`ADMIN_USERS    = ${entries.join(';')}`);
console.log(`SESSION_SECRET = ${randomBytes(32).toString('hex')}  (doar prima dată; schimbarea lui deconectează pe toată lumea)`);
