// Génère l'adresse secrète de l'espace admin et l'empreinte à mettre dans VITE_ADMIN_PATH_HASH.
//   npm run admin-path                  -> propose une adresse aléatoire
//   npm run admin-path -- mon-adresse   -> calcule l'empreinte d'une adresse choisie
import { createHash, randomBytes } from 'node:crypto';

const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
const random = Array.from(randomBytes(18), b => alphabet[b % alphabet.length]).join('');
const segment = (process.argv[2] ?? `espace-${random}`).replace(/^\/+|\/+$/g, '').toLowerCase();

if (!/^[a-z0-9-]{12,}$/.test(segment)) {
  console.error("L'adresse doit faire au moins 12 caractères (lettres minuscules, chiffres, tirets).");
  process.exit(1);
}

const hash = createHash('sha256').update(segment).digest('hex');
console.log(`\nAdresse de l'admin (à garder pour vous, à mettre en favori) :\n  /${segment}\n`);
console.log(`Variable à ajouter sur Vercel (Settings > Environment Variables), puis redéployer :\n  VITE_ADMIN_PATH_HASH=${hash}\n`);
