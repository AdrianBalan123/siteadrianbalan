// Generează valorile pentru variabilele de mediu din Vercel (ADMIN_PASSWORD_HASH și SESSION_SECRET).
// Rulează:  node scripts/parola-admin.mjs
// Parola nu se salvează nicăieri; în Vercel pui doar hash-ul.
import { randomBytes, scryptSync } from 'node:crypto';
import { createInterface } from 'node:readline/promises';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const pass = await rl.question('Parola dorită pentru administrare (minim 12 caractere): ');
rl.close();
if (pass.length < 12) {
  console.error('Parola e prea scurtă. Alege cel puțin 12 caractere.');
  process.exit(1);
}
const salt = randomBytes(16);
const hash = scryptSync(pass, salt, 64);
console.log('\nPune în Vercel → Settings → Environment Variables:\n');
console.log(`ADMIN_PASSWORD_HASH = scrypt:${salt.toString('hex')}:${hash.toString('hex')}`);
console.log(`SESSION_SECRET      = ${randomBytes(32).toString('hex')}`);
