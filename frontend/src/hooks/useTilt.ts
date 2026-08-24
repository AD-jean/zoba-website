import { useEffect, useRef } from 'react';

const canHover = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface UseTiltOptions {
  max?: number;
  scale?: number;
}

// Transform/box-shadow appliques en inline (pas via classe/custom property) : certains elements
// combinent ce hook avec `.card`, dont le hover Tailwind (`hover:-translate-y-1 hover:shadow-lg`)
// cible aussi transform/box-shadow avec une specificite egale ou superieure a une classe seule --
// l'inline gagne toujours et evite que l'effet soit silencieusement annule au survol.
export function useTilt<T extends HTMLElement>({ max = 14, scale = 1.04 }: UseTiltOptions = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const apply = (rx: number, ry: number, s: number, glareX: number, glareY: number) => {
      el.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${s})`;
      el.style.boxShadow = `${(-ry * 2).toFixed(1)}px ${(rx * -2 + 14).toFixed(1)}px 32px -12px rgba(7, 51, 64, ${(0.15 + Math.abs(rx / max) * 0.15 + Math.abs(ry / max) * 0.15).toFixed(2)})`;
      el.style.setProperty('--glare-x', `${glareX.toFixed(1)}%`);
      el.style.setProperty('--glare-y', `${glareY.toFixed(1)}%`);
      el.style.setProperty('--glare-opacity', s > 1 ? '1' : '0');
    };

    const reset = () => apply(0, 0, 1, 50, 50);
    reset();

    if (!canHover() || prefersReducedMotion()) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      apply(-y * max, x * max, scale, (x + 0.5) * 100, (y + 0.5) * 100);
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', reset);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', reset);
    };
  }, [max, scale]);

  return ref;
}
