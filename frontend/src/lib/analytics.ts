import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { API_URL } from './api';

/**
 * Mesure d'audience maison, sans cookie ni stockage local : conforme à la politique
 * cookies du site (bannière purement informative, aucun consentement requis).
 * Le navigateur envoie seulement la page, le referrer et son fuseau horaire ;
 * le serveur en déduit un compteur anonyme (voir backend/src/services/analytics.service.ts).
 */
function doNotTrack(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.doNotTrack === '1' || nav.globalPrivacyControl === true;
}

let lastPath = '';
let lastAt = 0;
let firstView = true;

function track(path: string) {
  // Évite le double envoi des effets en mode strict de React (développement).
  const now = Date.now();
  if (path === lastPath && now - lastAt < 1000) return;
  lastPath = path;
  lastAt = now;

  // Referrer externe uniquement à l'arrivée sur le site ; ensuite, navigation interne.
  const referrer = firstView ? document.referrer : '';
  firstView = false;

  const body = JSON.stringify({ path, referrer, tz: Intl.DateTimeFormat().resolvedOptions().timeZone });
  const url = `${API_URL}/analytics/track`;
  try {
    // text/plain : requête « simple », sans pré-vol CORS.
    if (!navigator.sendBeacon?.(url, new Blob([body], { type: 'text/plain' }))) {
      fetch(url, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
    }
  } catch {
    // la mesure d'audience ne doit jamais gêner la navigation
  }
}

/** Compte une page vue à chaque changement de route du site public (jamais l'admin). */
export function usePageTracking(skip: boolean) {
  const { pathname } = useLocation();
  useEffect(() => {
    if (skip || doNotTrack()) return;
    track(pathname);
  }, [pathname, skip]);
}
