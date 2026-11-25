import { useEffect, useState } from 'react';
import { ZoomIn, Play } from 'lucide-react';
import { galleryApi } from '../lib/api';
import { imageUrl, imageSrcSet, placeholderUrl, preloadVideo } from '../lib/media';
import Reveal from '../components/Reveal';
import TiltCard from '../components/TiltCard';
import GalleryLightbox from '../components/GalleryLightbox';
import type { GalleryItem, Department } from '../types/database';
import EmptyState from '../components/EmptyState';

const DEPARTMENTS: Department[] = ['Tous', 'Hommes', 'Femmes', 'Jeunesse', 'Enfants'];

const GRID_SIZES = '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw';

/**
 * Vignette de la grille : version redimensionnée (et non l'original de plusieurs Mo),
 * aperçu flouté instantané, chargement prioritaire pour les premières visibles.
 */
function GalleryThumb({ item, index }: { item: GalleryItem; index: number }) {
  const [loaded, setLoaded] = useState(false);
  const isVideo = item.mediaType === 'video' && !!item.videoUrl;
  const placeholder = placeholderUrl(item.image);
  const aboveTheFold = index < 8;

  return (
    <div
      className="relative bg-gray-100 bg-cover bg-center min-h-[120px]"
      style={placeholder ? { backgroundImage: `url(${placeholder})` } : undefined}
      onMouseEnter={isVideo ? () => preloadVideo(item.videoUrl as string) : undefined}
      onTouchStart={isVideo ? () => preloadVideo(item.videoUrl as string) : undefined}
    >
      <img
        src={imageUrl(item.image, 640)}
        srcSet={imageSrcSet(item.image)}
        sizes={GRID_SIZES}
        alt={item.caption || ''}
        loading={aboveTheFold ? 'eager' : 'lazy'}
        decoding="async"
        {...(index < 4 ? { fetchpriority: 'high' } : {})}
        onLoad={() => setLoaded(true)}
        className={`w-full h-auto group-hover:scale-[1.03] transition-[transform,opacity] duration-500 tilt-layer ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
      {isVideo && (
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
            <Play size={24} className="text-white fill-white ml-1" />
          </span>
        </span>
      )}
    </div>
  );
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState<Department>('Tous');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    galleryApi.getAll(filter === 'Tous' ? undefined : { department: filter })
      .then((data: GalleryItem[]) => setItems(data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <>
      {lightboxIndex !== null && (
        <GalleryLightbox
          items={items}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <section className="relative pt-32 pb-20 bg-gradient-animated overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-teal-300 mb-4">Photos &amp; vidéos</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-display mb-4">Notre galerie</h1>
          <p className="text-teal-200 text-lg max-w-xl">
            Revivez les moments forts de la vie de notre zone en images et en vidéos.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 mb-10">
            {DEPARTMENTS.map(d => (
              <button
                key={d}
                onClick={() => setFilter(d)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 ${
                  filter === d
                    ? 'bg-teal-600 text-white shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-gray-100 animate-pulse" style={{ height: `${150 + (i % 3) * 60}px` }} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              illustration="gallery"
              title={filter === 'Tous' ? 'La galerie se remplit bientôt' : 'Rien pour ce département'}
              description={filter === 'Tous'
                ? 'Les photos et vidéos de nos rencontres seront publiées ici.'
                : 'Aucune photo ni vidéo pour ce département pour le moment.'}
              action={filter !== 'Tous' && <button onClick={() => setFilter('Tous')} className="btn-outline text-sm">Voir toute la galerie</button>}
            />
          ) : (
            <Reveal className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 overflow-hidden">
              {items.map((item, i) => (
                <TiltCard
                  key={item._id}
                  max={5}
                  wrapClassName="break-inside-avoid"
                  className="relative rounded-xl overflow-hidden cursor-pointer group transition-shadow duration-300 hover:shadow-lg"
                  onClick={() => setLightboxIndex(i)}
                >
                  <GalleryThumb item={item} index={i} />
                  {item.mediaType !== 'video' && (
                    <div className="absolute inset-0 bg-teal-900/0 group-hover:bg-teal-900/50 transition-colors duration-300 flex items-center justify-center">
                      <ZoomIn size={24} className="text-white opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200" />
                    </div>
                  )}
                </TiltCard>
              ))}
            </Reveal>
          )}
        </div>
      </section>
    </>
  );
}
