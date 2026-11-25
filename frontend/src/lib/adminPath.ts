import { useEffect, useState } from 'react';

/**
 * Adresse secrète de l'espace admin.
 *
 * Le code publié ne contient jamais l'adresse elle-même, seulement son empreinte SHA-256
 * (VITE_ADMIN_PATH_HASH, générée par `npm run admin-path`). Lire le JavaScript du site ne
 * permet donc pas de la retrouver. Toute autre adresse, `/admin` compris, affiche la page
 * « introuvable ».
 *
 * Sans VITE_ADMIN_PATH_HASH (développement local), l'admin reste sur `/admin`.
 */
const HASH = (import.meta.env.VITE_ADMIN_PATH_HASH ?? '').trim().toLowerCase();
const DEFAULT_SEGMENT = 'admin';

const cache = new Map<string, boolean>();

const firstSegment = (pathname: string) => {
  try {
    return decodeURIComponent(pathname.split('/')[1] ?? '').toLowerCase();
  } catch {
    return '';
  }
};

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}

function check(segment: string): boolean | null {
  if (!HASH) return segment === DEFAULT_SEGMENT;
  if (!segment) return false;
  return cache.get(segment) ?? null;
}

/** true : espace admin ; false : site public ; null : vérification en cours (quelques ms). */
export function useIsAdminRoute(pathname: string): boolean | null {
  const segment = firstSegment(pathname);
  const [, rerender] = useState(0);
  const result = check(segment);

  useEffect(() => {
    if (result !== null) return;
    let alive = true;
    sha256Hex(segment)
      .then(h => cache.set(segment, h === HASH))
      .catch(() => cache.set(segment, false)) // crypto.subtle indisponible (http hors localhost)
      .finally(() => alive && rerender(n => n + 1));
    return () => { alive = false; };
  }, [segment, result]);

  return result;
}

// Indique au client API qu'on est dans l'espace admin (déconnexion automatique sur 401).
let adminArea = false;
export const setAdminArea = (value: boolean) => { adminArea = value; };
export const isAdminArea = () => adminArea;
