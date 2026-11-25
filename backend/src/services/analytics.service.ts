import crypto from 'crypto';

/**
 * Mesure d'audience maison, sans cookie et sans donnee personnelle brute.
 * L'IP sert uniquement, en memoire, a calculer une empreinte du jour :
 *   HMAC(secret, jour) -> sel du jour ; SHA-256(sel + IP + user-agent) -> visiteur.
 * Le sel change chaque jour : impossible de relier deux journees, ni de remonter a l'IP.
 */

// Secret de serveur : jamais stocke en base. A defaut, un secret aleatoire par processus
// (les visiteurs uniques sont alors simplement recomptes apres un redemarrage).
const SECRET = process.env.ANALYTICS_SALT || process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

export const dayKey = (date = new Date()): string => date.toISOString().slice(0, 10);

export function visitorHash(ip: string, userAgent: string, day: string): string {
  const salt = crypto.createHmac('sha256', SECRET).update(day).digest();
  return crypto.createHash('sha256').update(salt).update(ip).update('|').update(userAgent).digest('hex').slice(0, 32);
}

const BOT_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|pingdom|uptimerobot|curl|wget|python|axios|node-fetch/i;
export const isBot = (userAgent: string): boolean => !userAgent || BOT_RE.test(userAgent);

export function deviceFromUserAgent(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(userAgent)) return 'tablet';
  if (/mobi|iphone|ipod|android|windows phone|opera mini/i.test(userAgent)) return 'mobile';
  return 'desktop';
}

/**
 * Chemin normalise : sans query string ni fragment, et sans les segments secrets
 * (le code d'un billet est un jeton d'acces, l'identifiant d'un don un numero interne).
 */
export function normalizePath(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.startsWith('/')) return null;
  let path = raw.split(/[?#]/)[0].slice(0, 200);
  if (path.startsWith('/admin')) return null;
  path = path.replace(/^\/billet\/[^/]+/, '/billet').replace(/^\/dons\/retour\/[^/]+/, '/dons/retour');
  if (path.length > 1) path = path.replace(/\/+$/, '');
  return path || '/';
}

/** Referrer reduit a son domaine ; les navigations internes et les adresses invalides sont ignorees. */
export function referrerHost(raw: unknown, ownHosts: string[]): string | undefined {
  if (typeof raw !== 'string' || !raw) return undefined;
  try {
    const host = new URL(raw).hostname.replace(/^www\./, '').toLowerCase();
    if (!host || ownHosts.includes(host)) return undefined;
    return host.slice(0, 120);
  } catch {
    return undefined;
  }
}

// Fuseau horaire du navigateur -> pays (repli quand l'hebergeur ne fournit pas d'en-tete pays).
const TIMEZONE_COUNTRY: Record<string, string> = {
  'Africa/Lome': 'TG', 'Africa/Porto-Novo': 'BJ', 'Africa/Accra': 'GH', 'Africa/Abidjan': 'CI',
  'Africa/Ouagadougou': 'BF', 'Africa/Lagos': 'NG', 'Africa/Niamey': 'NE', 'Africa/Bamako': 'ML',
  'Africa/Dakar': 'SN', 'Africa/Douala': 'CM', 'Africa/Libreville': 'GA', 'Africa/Kinshasa': 'CD',
  'Africa/Brazzaville': 'CG', 'Africa/Conakry': 'GN', 'Africa/Casablanca': 'MA', 'Africa/Johannesburg': 'ZA',
  'Europe/Paris': 'FR', 'Europe/Brussels': 'BE', 'Europe/Zurich': 'CH', 'Europe/London': 'GB',
  'Europe/Berlin': 'DE', 'Europe/Rome': 'IT', 'Europe/Madrid': 'ES', 'Europe/Amsterdam': 'NL',
  'America/Toronto': 'CA', 'America/Montreal': 'CA', 'America/New_York': 'US', 'America/Chicago': 'US',
  'America/Denver': 'US', 'America/Los_Angeles': 'US'
};

export function countryFrom(headerCountry: unknown, timezone: unknown): string | undefined {
  if (typeof headerCountry === 'string' && /^[A-Z]{2}$/.test(headerCountry) && headerCountry !== 'XX') return headerCountry;
  if (typeof timezone === 'string') return TIMEZONE_COUNTRY[timezone];
  return undefined;
}
