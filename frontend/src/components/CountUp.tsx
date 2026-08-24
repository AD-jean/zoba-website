import { useEffect, useRef, useState } from 'react';
import { useInView } from '../hooks/useInView';

interface CountUpProps {
  end: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

export default function CountUp({ end, suffix = '', duration = 1600, className }: CountUpProps) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;

    let frame: number;
    const start = performance.now();

    const tick = (now: number) => {
      // clamp to [0,1]: the rAF timestamp can precede the synchronous performance.now()
      // captured above, making progress briefly negative and overshooting the easing curve.
      const progress = Math.min(Math.max((now - start) / duration, 0), 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setValue(Math.round(eased * end));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, end, duration]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString('fr-FR')}
      {suffix}
    </span>
  );
}
