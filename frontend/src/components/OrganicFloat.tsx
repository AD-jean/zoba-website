import { useEffect, useRef } from 'react';

interface OrganicFloatProps {
  variant?: 'hero' | 'cta';
  className?: string;
}

const canHover = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Formes organiques flottantes en arrière-plan (Hero, CTA final) : profondeur en CSS pur
 * (transform/opacity uniquement), avec un léger parallax souris sur desktop. N'utilise aucune
 * dépendance 3D — le rendu perçu de profondeur vient de la superposition + du flou, pas d'une
 * vraie scène 3D, ce qui garde le coût proche de zéro.
 */
export default function OrganicFloat({ variant = 'hero', className = '' }: OrganicFloatProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !canHover() || prefersReducedMotion()) return;

    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      el.style.setProperty('--px', `${(x * 14).toFixed(1)}px`);
      el.style.setProperty('--py', `${(y * 14).toFixed(1)}px`);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const palette = variant === 'hero'
    ? ['bg-white/40', 'bg-teal-200/40', 'bg-white/25']
    : ['bg-teal-100', 'bg-teal-50', 'bg-teal-200/60'];

  return (
    <div ref={ref} className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      <div
        className={`organic-blob organic-blob-1 ${palette[0]}`}
        style={{ top: '-6%', left: '68%', width: '380px', height: '380px' }}
      />
      <div
        className={`organic-blob organic-blob-2 ${palette[1]}`}
        style={{ top: '42%', left: '84%', width: '280px', height: '280px' }}
      />
      <div
        className={`organic-blob organic-blob-3 ${palette[2]}`}
        style={{ top: '68%', left: '6%', width: '220px', height: '220px' }}
      />
    </div>
  );
}
