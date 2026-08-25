import { useEffect, useState, type CSSProperties } from 'react';
import { useInView } from '../hooks/useInView';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
}

// Delai maximal possible (dernier enfant : 770ms) + duree de l'animation (700ms) + marge.
const SETTLE_AFTER_MS = 1600;

export default function Reveal({ children, className = '', delay = 0, onClick }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => setSettled(true), SETTLE_AFTER_MS + delay);
    return () => clearTimeout(timer);
  }, [inView, delay]);

  const state = settled ? 'has-settled' : inView ? 'is-in-view' : '';

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`assemble-group ${state} ${className}`}
      style={{ '--group-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
