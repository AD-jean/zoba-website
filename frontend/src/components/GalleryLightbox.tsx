import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { GalleryItem } from '../types/database';

interface GalleryLightboxProps {
  items: GalleryItem[];
  startIndex: number;
  onClose: () => void;
}

export default function GalleryLightbox({ items, startIndex, onClose }: GalleryLightboxProps) {
  const [index, setIndex] = useState(startIndex);
  const [closing, setClosing] = useState(false);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

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
  }, [index]);

  const current = items[index];

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 tilt-wrap transition-opacity duration-200 ${closing ? 'opacity-0' : 'animate-fade-in'}`}
      onClick={close}
    >
      <button
        onClick={close}
        className="absolute top-4 right-4 text-white/70 hover:text-white hover:rotate-90 transition-all duration-200"
      >
        <X size={28} />
      </button>

      {items.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); go(-1); }}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:scale-110 transition-all duration-200 bg-white/10 hover:bg-white/20 rounded-full p-2"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); go(1); }}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:scale-110 transition-all duration-200 bg-white/10 hover:bg-white/20 rounded-full p-2"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      <div className="flex-1 min-h-0 flex items-center justify-center w-full">
        <img
          key={current._id}
          src={`${current.image}?auto=compress&cs=tinysrgb&w=1400`}
          alt={current.caption || ''}
          className={`max-w-full max-h-full rounded-xl object-contain ${closing ? 'animate-lightbox-out' : 'animate-lightbox-in'}`}
          onClick={e => e.stopPropagation()}
        />
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
              className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                i === index ? 'border-white scale-105' : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <img
                src={`${item.image}?auto=compress&cs=tinysrgb&w=100`}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
