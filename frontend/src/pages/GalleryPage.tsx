import { useEffect, useState } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { galleryApi } from '../lib/api';
import Reveal from '../components/Reveal';
import TiltCard from '../components/TiltCard';
import type { GalleryItem, Department } from '../types/database';

const DEPARTMENTS: Department[] = ['Tous', 'Hommes', 'Femmes', 'Jeunesse', 'Enfants'];

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState<Department>('Tous');
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const [closing, setClosing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    galleryApi.getAll(filter === 'Tous' ? undefined : { department: filter })
      .then((data: GalleryItem[]) => { setItems(data); setLoading(false); });
  }, [filter]);

  const closeLightbox = () => {
    setClosing(true);
    setTimeout(() => { setLightbox(null); setClosing(false); }, 200);
  };

  return (
    <>
      {lightbox && (
        <div
          className={`fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 tilt-wrap transition-opacity duration-200 ${closing ? 'opacity-0' : 'animate-fade-in'}`}
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/70 hover:text-white hover:rotate-90 transition-all duration-200"
          >
            <X size={28} />
          </button>
          <img
            src={`${lightbox.image}?auto=compress&cs=tinysrgb&w=1400`}
            alt={lightbox.caption || ''}
            className={`max-w-full max-h-full rounded-xl object-contain ${closing ? 'animate-lightbox-out' : 'animate-lightbox-in'}`}
            onClick={e => e.stopPropagation()}
          />
          {lightbox.caption && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-lg text-sm">
              {lightbox.caption}
            </div>
          )}
        </div>
      )}

      <section className="relative pt-32 pb-20 bg-teal-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-teal-300 mb-4">Photothèque</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-display mb-4">Notre galerie</h1>
          <p className="text-teal-200 text-lg max-w-xl">
            Revivez les moments forts de la vie de notre zone en images.
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
            <div className="text-center py-24 text-gray-400">
              <ZoomIn size={40} className="mx-auto mb-4 opacity-40" />
              <p>Aucune photo disponible pour ce filtre.</p>
            </div>
          ) : (
            <Reveal className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {items.map(item => (
                <TiltCard
                  key={item._id}
                  max={5}
                  wrapClassName="break-inside-avoid"
                  className="relative rounded-xl overflow-hidden cursor-pointer group transition-shadow duration-300 hover:shadow-lg"
                  onClick={() => setLightbox(item)}
                >
                  <img
                    src={`${item.image}?auto=compress&cs=tinysrgb&w=600`}
                    alt={item.caption || ''}
                    loading="lazy"
                    className="w-full h-auto group-hover:scale-[1.03] transition-transform duration-500 tilt-layer"
                  />
                  <div className="absolute inset-0 bg-teal-900/0 group-hover:bg-teal-900/50 transition-colors duration-300 flex items-center justify-center">
                    <ZoomIn size={24} className="text-white opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200" />
                  </div>
                </TiltCard>
              ))}
            </Reveal>
          )}
        </div>
      </section>
    </>
  );
}
