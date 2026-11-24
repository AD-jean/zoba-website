import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X, Play } from 'lucide-react';
import type { GalleryItem } from '../types/database';
import { imageUrl, imageSrcSet, videoUrl, videoPosterUrl, preloadVideo } from '../lib/media';

interface GalleryLightboxProps {
  items: GalleryItem[];
  startIndex: number;
  onClose: () => void;
}

const isVideoItem = (item: GalleryItem) => item.mediaType === 'video' && !!item.videoUrl;

/** Charge à l'avance l'élément voisin pour que la navigation soit immédiate. */
function warmUp(item: GalleryItem | undefined) {
  if (!item) return;
  if (isVideoItem(item)) {
    preloadVideo(item.videoUrl as string);
    return;
  }
  const img = new Image();
  img.sizes = '100vw';
  const srcSet = imageSrcSet(item.image, [640, 960, 1280, 1600]);
  if (srcSet) img.srcset = srcSet;
  img.src = imageUrl(item.image, 1280);
}

export default function GalleryLightbox({ items, startIndex, onClose }: GalleryLightboxProps) {
  const [index, setIndex] = useState(startIndex);
  const [closing, setClosing] = useState(false);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const close = () => {
    setClosing(true);
    setTimeout(onClose, 200);
  };

  const go = (delta: number) => {
    setIndex(i => (i + delta + items.length) % items.length);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  useEffect(() => {
    thumbRefs.current[index]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    if (items.length > 1) {
      warmUp(items[(index + 1) % items.length]);
      warmUp(items[(index - 1 + items.length) % items.length]);
    }
  }, [index, items]);

  const current = items[index];
  const currentIsVideo = isVideoItem(current);

  // Lecture automatique avec le son (le clic d'ouverture l'autorise) ; si le navigateur
  // refuse, on relance en muet plutôt que de laisser une vidéo figée.
  useEffect(() => {
    const video = videoRef.current;
    if (!currentIsVideo || !video) return;
    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => undefined);
    });
  }, [current._id, currentIsVideo]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 tilt-wrap transition-opacity duration-200 ${closing ? 'opacity-0' : 'animate-fade-in'}`}
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Visionneuse de la galerie"
    >
      <button
        onClick={close}
        aria-label="Fermer"
        className="absolute top-4 right-4 z-10 text-white/70 hover:text-white hover:rotate-90 transition-all duration-200"
      >
        <X size={28} />
      </button>

      {items.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); go(-1); }}
            aria-label="Précédent"
            className="absolute z-10 left-2 sm:left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:scale-110 transition-all duration-200 bg-white/10 hover:bg-white/20 rounded-full p-2"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); go(1); }}
            aria-label="Suivant"
            className="absolute z-10 right-2 sm:right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:scale-110 transition-all duration-200 bg-white/10 hover:bg-white/20 rounded-full p-2"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      <div className="flex-1 min-h-0 flex items-center justify-center w-full">
        {currentIsVideo ? (
          <video
            key={current._id}
            ref={videoRef}
            src={videoUrl(current.videoUrl as string)}
            // L'affiche (déjà en cache depuis la grille) s'affiche instantanément
            // pendant que les premières secondes de la vidéo arrivent.
            poster={videoPosterUrl(current.videoUrl as string, 1280) || current.image}
            controls
            autoPlay
            playsInline
            preload="auto"
            className={`max-w-full max-h-full rounded-xl bg-black ${closing ? 'animate-lightbox-out' : 'animate-lightbox-in'}`}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <img
            key={current._id}
            src={imageUrl(current.image, 1280)}
            srcSet={imageSrcSet(current.image, [640, 960, 1280, 1600, 2048])}
            sizes="100vw"
            alt={current.caption || ''}
            decoding="async"
            // La vignette de la grille (déjà téléchargée) sert de fond pendant le chargement
            // de la grande version : l'image apparaît immédiatement puis gagne en netteté.
            style={{
              backgroundImage: `url(${imageUrl(current.image, 640)})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
            className={`max-w-full max-h-full rounded-xl object-contain ${closing ? 'animate-lightbox-out' : 'animate-lightbox-in'}`}
            onClick={e => e.stopPropagation()}
          />
        )}
      </div>

      {current.caption && (
        <p className="text-white text-sm mt-3 text-center max-w-xl">{current.caption}</p>
      )}

      {items.length > 1 && (
        <div
          className="flex gap-2 mt-4 max-w-full overflow-x-auto px-4 py-1"
          onClick={e => e.stopPropagation()}
        >
          {items.map((item, i) => (
            <button
              key={item._id}
              ref={el => { thumbRefs.current[i] = el; }}
              onClick={() => setIndex(i)}
              aria-label={`Afficher l'élément ${i + 1}`}
              className={`relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                i === index ? 'border-white scale-105' : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <img
                src={imageUrl(item.image, 120)}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
              {isVideoItem(item) && (
                <Play size={14} className="absolute inset-0 m-auto text-white drop-shadow fill-white" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
