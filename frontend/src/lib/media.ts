/**
 * URLs optimisées pour les médias de la galerie.
 *
 * Les fichiers téléversés depuis l'admin sont sur Cloudinary : on insère une
 * transformation dans l'URL (/upload/<transfo>/...) pour recevoir une version
 * redimensionnée, compressée et au meilleur format (AVIF/WebP) au lieu de
 * l'original de plusieurs Mo. Les anciennes URLs Pexels gardent leurs paramètres.
 */

// Doit rester identique à VIDEO_DELIVERY_TRANSFORMATION côté backend (upload.routes.ts) :
// Cloudinary pré-génère cette version à l'upload (eager), elle est donc servie
// immédiatement au lieu d'être encodée à la première lecture.
export const VIDEO_TRANSFORMATION = 'c_limit,w_1280,q_auto,vc_h264';

const CLOUDINARY_UPLOAD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/(?:image|video)\/upload\/)(.+)$/;

export const isCloudinary = (url: string): boolean => CLOUDINARY_UPLOAD.test(url);

const withTransformation = (url: string, transformation: string): string => {
  const match = url.match(CLOUDINARY_UPLOAD);
  if (!match) return url;
  return `${match[1]}${transformation}/${match[2]}`;
};

const replaceExtension = (url: string, ext: string): string => url.replace(/\.[a-z0-9]+(\?.*)?$/i, `.${ext}`);

/** Image redimensionnée à `width` px (format et qualité automatiques). */
export function imageUrl(url: string, width: number): string {
  if (isCloudinary(url)) return withTransformation(url, `c_limit,w_${width},q_auto,f_auto`);
  if (url.includes('images.pexels.com')) {
    const base = url.split('?')[0];
    return `${base}?auto=compress&cs=tinysrgb&w=${width}`;
  }
  return url;
}

/** srcset multi-résolution : le navigateur choisit la plus petite suffisante. */
export function imageSrcSet(url: string, widths: number[] = [320, 480, 640, 960, 1280]): string | undefined {
  if (!isCloudinary(url) && !url.includes('images.pexels.com')) return undefined;
  return widths.map(w => `${imageUrl(url, w)} ${w}w`).join(', ');
}

/** Minuscule aperçu flouté (≈1 Ko) affiché instantanément pendant le chargement. */
export function placeholderUrl(url: string): string | undefined {
  if (!isCloudinary(url)) return undefined;
  return withTransformation(url, 'c_limit,w_32,q_10,e_blur:400,f_auto');
}

/** Version web de la vidéo : MP4 H.264 ≤ 1280 px, lisible partout, pré-générée à l'upload. */
export function videoUrl(url: string): string {
  if (!isCloudinary(url)) return url;
  return replaceExtension(withTransformation(url, VIDEO_TRANSFORMATION), 'mp4');
}

/** Image d'affiche extraite de la première image de la vidéo (légère, s'affiche tout de suite). */
export function videoPosterUrl(url: string, width = 800): string {
  if (!isCloudinary(url)) return '';
  return replaceExtension(withTransformation(url, `so_0,c_limit,w_${width},q_auto,f_auto`), 'jpg');
}

const preloaded = new Map<string, HTMLVideoElement>();
const MAX_PRELOADS = 4;

/**
 * Commence à télécharger le début d'une vidéo avant le clic (survol, toucher) :
 * la lecture démarre alors sans attente à l'ouverture. Désactivé si l'utilisateur
 * a activé l'économie de données, et limité à quelques vidéos.
 */
export function preloadVideo(url: string): void {
  const src = videoUrl(url);
  if (preloaded.has(src) || preloaded.size >= MAX_PRELOADS) return;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return;
  const video = document.createElement('video');
  video.preload = 'auto';
  video.muted = true;
  video.src = src;
  video.load();
  preloaded.set(src, video);
}
