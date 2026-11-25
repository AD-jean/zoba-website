import { useId, useMemo, useState } from 'react';

/**
 * Petits graphiques SVG du tableau de bord (aucune dépendance).
 * Palette catégorielle validée (lisibilité daltonisme) : bleu, or, vert, dans cet ordre.
 */
export const CHART_COLORS = ['#1f4fbf', '#D18F00', '#0f8f7a'] as const;

export const nf = new Intl.NumberFormat('fr-FR');

// ─── Courbe d'aire ────────────────────────────────────────────────────────────

export interface Series {
  name: string;
  color: string;
  values: number[];
}

export function AreaChart({ labels, series, height = 220 }: { labels: string[]; series: Series[]; height?: number }) {
  const gradientId = useId();
  const [hover, setHover] = useState<number | null>(null);
  const width = 640;
  const pad = { top: 12, right: 12, bottom: 26, left: 36 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const n = labels.length;

  const max = useMemo(() => {
    const m = Math.max(1, ...series.flatMap(s => s.values));
    // borne « ronde » pour des graduations lisibles
    const step = Math.pow(10, Math.floor(Math.log10(m)));
    return Math.max(2, Math.ceil(m / step) * step);
  }, [series]);

  const x = (i: number) => pad.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v: number) => pad.top + innerH - (v / max) * innerH;
  const ticks = [0, max / 2, max];
  const labelEvery = Math.max(1, Math.ceil(n / 7));

  const path = (values: number[]) => values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setHover(Math.min(n - 1, Math.max(0, Math.round(ratio * (n - 1)))));
  };

  const primary = series[0];

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label={series.map(s => s.name).join(' et ')}>
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={primary.color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={primary.color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map(t => (
          <g key={t}>
            <line x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} stroke="#e5e7eb" strokeDasharray={t ? '3 4' : undefined} />
            <text x={pad.left - 8} y={y(t) + 4} textAnchor="end" className="fill-gray-400" fontSize="11">{nf.format(t)}</text>
          </g>
        ))}
        {labels.map((l, i) => (i % labelEvery === 0 || i === n - 1) && (
          <text key={l + i} x={x(i)} y={height - 6} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} className="fill-gray-400" fontSize="11">{l}</text>
        ))}
        <path d={`${path(primary.values)} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill={`url(#${gradientId})`} />
        {series.map((s, si) => (
          <path key={s.name} d={path(s.values)} fill="none" stroke={s.color} strokeWidth={2}
            strokeDasharray={si ? '5 4' : undefined} strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={pad.top + innerH} stroke="#9ca3af" strokeDasharray="2 3" />
            {series.map(s => (
              <circle key={s.name} cx={x(hover)} cy={y(s.values[hover])} r={4.5} fill={s.color} stroke="#fff" strokeWidth={2} />
            ))}
          </g>
        )}
        <rect x={pad.left} y={pad.top} width={innerW} height={innerH} fill="transparent"
          onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)} />
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg bg-white shadow-lg ring-1 ring-black/5 px-3 py-2 text-xs whitespace-nowrap"
          style={{ left: `${Math.min(85, Math.max(15, (x(hover) / width) * 100))}%` }}
        >
          <p className="font-semibold text-gray-800 mb-1">{labels[hover]}</p>
          {series.map(s => (
            <p key={s.name} className="flex items-center gap-2 text-gray-600">
              <span className="w-2.5 h-0.5 rounded" style={{ background: s.color }} />
              {s.name} <span className="ml-auto pl-3 font-semibold text-gray-800">{nf.format(s.values[hover])}</span>
            </p>
          ))}
        </div>
      )}
      {series.length > 1 && (
        <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
          {series.map((s, si) => (
            <span key={s.name} className="flex items-center gap-1.5">
              <svg width="18" height="4"><line x1="0" x2="18" y1="2" y2="2" stroke={s.color} strokeWidth="2" strokeDasharray={si ? '5 3' : undefined} /></svg>
              {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Anneau ───────────────────────────────────────────────────────────────────

export interface Slice {
  label: string;
  value: number;
  color: string;
  detail?: string;
}

export function DonutChart({ slices, centerLabel }: { slices: Slice[]; centerLabel: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const total = slices.reduce((s, x) => s + x.value, 0);
  const r = 70;
  const c = 2 * Math.PI * r;
  const gap = slices.filter(s => s.value > 0).length > 1 ? 3 : 0;
  let offset = 0;
  const shown = hover !== null ? slices[hover] : slices[0];
  const pct = (v: number) => (total ? Math.round((v / total) * 100) : 0);

  return (
    <div className="flex flex-col items-center gap-5">
      <svg viewBox="0 0 180 180" className="w-40 h-40 flex-shrink-0" role="img" aria-label={centerLabel}>
        <g transform="rotate(-90 90 90)">
          <circle cx="90" cy="90" r={r} fill="none" stroke="#eef0f4" strokeWidth="18" />
          {slices.map((s, i) => {
            const len = total ? (s.value / total) * c : 0;
            const el = len > 0 && (
              <circle
                key={s.label}
                cx="90" cy="90" r={r} fill="none" stroke={s.color}
                strokeWidth={hover === i ? 22 : 18}
                strokeDasharray={`${Math.max(len - gap, 0.01)} ${c}`}
                strokeDashoffset={-offset}
                className="transition-[stroke-width] duration-200 cursor-pointer"
                onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}
              />
            );
            offset += len;
            return el;
          })}
        </g>
        <text x="90" y="90" textAnchor="middle" fontSize="26" fontWeight="700" className="fill-gray-800">
          {pct(shown?.value ?? 0)} %
        </text>
        <text x="90" y="110" textAnchor="middle" fontSize="11" className="fill-gray-400">{shown?.label}</text>
      </svg>
      <ul className="w-full space-y-1.5 text-sm">
        {slices.map((s, i) => (
          <li key={s.label} className={`flex items-center gap-2.5 rounded-lg px-2 py-1 transition-colors ${hover === i ? 'bg-gray-50' : ''}`}
            onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
            <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: s.color }} />
            <span className="flex flex-col min-w-0 leading-tight">
              <span className="text-gray-700">{s.label}</span>
              {s.detail && <span className="text-xs text-gray-400 tabular-nums">{s.detail}</span>}
            </span>
            <span className="ml-auto font-semibold text-gray-800 tabular-nums">{pct(s.value)} %</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Liste à barres ───────────────────────────────────────────────────────────

export function BarList({ items, color = CHART_COLORS[0], format = (k: string) => k }: {
  items: { key: string; views: number; visitors: number }[];
  color?: string;
  format?: (key: string) => string;
}) {
  const max = Math.max(1, ...items.map(i => i.views));
  return (
    <ul className="space-y-3">
      {items.map(item => (
        <li key={item.key} className="group" title={`${nf.format(item.views)} pages vues · ${nf.format(item.visitors)} visiteurs`}>
          <div className="flex items-center justify-between gap-3 text-sm mb-1">
            <span className="truncate text-gray-700">{format(item.key)}</span>
            <span className="font-semibold text-gray-800 tabular-nums">{nf.format(item.views)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500 group-hover:opacity-80" style={{ width: `${(item.views / max) * 100}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4 text-sm text-gray-400">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 text-gray-300">
        <path d="M3 3v18h18" /><path d="M7 15l4-4 3 3 5-6" />
      </svg>
      {children}
    </div>
  );
}
