import type { ReactNode } from 'react';

/**
 * Illustrations des espaces vides (« aucune activité », « aucun message »...).
 * Dessinées en SVG, sans dépendance, aux couleurs sarcelle et or du site (variante admin un ton plus soutenu).
 */

export type IllustrationName =
  | 'calendar' | 'news' | 'gallery' | 'inbox' | 'people' | 'newsletter' | 'donation' | 'chart' | 'search';

type Palette = { ink: string; main: string; soft: string; wash: string; line: string; accent: string; accentDark: string };

const PALETTES: Record<'site' | 'admin', Palette> = {
  site: { ink: '#0e4a56', main: '#2a8ea3', soft: '#9ecfda', wash: '#e8f4f6', line: '#d3e8ed', accent: '#F2A900', accentDark: '#c98a00' },
  admin: { ink: '#0e4a56', main: '#1a6b7a', soft: '#9ecfda', wash: '#e8f4f6', line: '#d3e8ed', accent: '#F2A900', accentDark: '#c98a00' },
};

const sparkle = (x: number, y: number, r: number) =>
  `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`;

/** Décor commun : halo, ombre au sol, petites étincelles. */
function Backdrop({ p }: { p: Palette }) {
  return (
    <>
      <circle cx="120" cy="92" r="74" fill={p.wash} />
      <ellipse cx="120" cy="164" rx="64" ry="6" fill={p.ink} opacity="0.08" />
      <path d={sparkle(44, 46, 7)} fill={p.accent} />
      <path d={sparkle(200, 38, 5)} fill={p.soft} />
      <circle cx="206" cy="112" r="3" fill={p.accent} opacity="0.7" />
      <circle cx="34" cy="120" r="2.5" fill={p.soft} />
    </>
  );
}

/** Feuille blanche avec ombre portée douce. */
function Sheet({ x, y, w, h, p, r = 10 }: { x: number; y: number; w: number; h: number; p: Palette; r?: number }) {
  return (
    <>
      <rect x={x + 3} y={y + 5} width={w} height={h} rx={r} fill={p.ink} opacity="0.07" />
      <rect x={x} y={y} width={w} height={h} rx={r} fill="#fff" stroke={p.line} strokeWidth="1.5" />
    </>
  );
}

const Line = ({ x, y, w, fill }: { x: number; y: number; w: number; fill: string }) => (
  <rect x={x} y={y} width={w} height="5" rx="2.5" fill={fill} />
);

const SCENES: Record<IllustrationName, (p: Palette) => ReactNode> = {
  calendar: p => (
    <>
      <Sheet x={70} y={48} w={100} h={98} p={p} r={12} />
      <path d="M70 60a12 12 0 0 1 12-12h76a12 12 0 0 1 12 12v14H70z" fill={p.main} />
      <rect x="92" y="38" width="7" height="18" rx="3.5" fill={p.ink} />
      <rect x="141" y="38" width="7" height="18" rx="3.5" fill={p.ink} />
      {[0, 1, 2].map(row => [0, 1, 2, 3].map(col => (
        <rect key={`${row}-${col}`} x={82 + col * 20} y={86 + row * 17} width="14" height="11" rx="3"
          fill={row === 1 && col === 2 ? p.accent : p.line} />
      )))}
      <circle cx="170" cy="132" r="19" fill={p.ink} />
      <circle cx="170" cy="132" r="13" fill="#fff" />
      <path d="M170 124v8l5 4" stroke={p.ink} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  news: p => (
    <>
      <rect x="88" y="46" width="84" height="104" rx="10" fill={p.line} transform="rotate(8 130 98)" />
      <Sheet x={68} y={44} w={90} h={110} p={p} />
      <rect x="78" y="55" width="70" height="34" rx="6" fill={p.wash} />
      <path d="M78 83l17-15 13 11 10-7 30 17v0a6 6 0 0 1-6 0H84a6 6 0 0 1-6-6z" fill={p.soft} />
      <circle cx="134" cy="66" r="5" fill={p.accent} />
      <Line x={78} y={99} w={46} fill={p.main} />
      <Line x={78} y={111} w={70} fill={p.line} />
      <Line x={78} y={122} w={58} fill={p.line} />
      <Line x={78} y={133} w={64} fill={p.line} />
      <g transform="rotate(32 176 100)">
        <rect x="171" y="70" width="10" height="52" rx="2" fill={p.accent} />
        <rect x="171" y="70" width="10" height="9" rx="2" fill={p.accentDark} />
        <path d="M171 122h10l-5 11z" fill={p.ink} />
      </g>
    </>
  ),
  gallery: p => (
    <>
      <g transform="rotate(-9 104 92)">
        <Sheet x={58} y={58} w={88} h={70} p={p} r={8} />
        <rect x="65" y="65" width="74" height="48" rx="4" fill={p.line} />
      </g>
      <g transform="rotate(6 140 86)">
        <Sheet x={94} y={46} w={92} h={76} p={p} r={8} />
        <rect x="101" y="53" width="78" height="52" rx="4" fill={p.wash} />
        <path d="M101 99l22-22 16 15 11-9 29 23v0a4 4 0 0 1-4 4h-70a4 4 0 0 1-4-4z" fill={p.main} />
        <path d="M139 92l11-9 29 23a4 4 0 0 1-4 4h-28z" fill={p.ink} opacity="0.35" />
        <circle cx="163" cy="66" r="6" fill={p.accent} />
      </g>
      <circle cx="178" cy="136" r="15" fill={p.ink} />
      <path d="M174 129v14l11-7z" fill="#fff" />
    </>
  ),
  inbox: p => (
    <>
      <Sheet x={84} y={40} w={72} h={62} p={p} r={6} />
      <Line x={94} y={52} w={40} fill={p.main} />
      <Line x={94} y={63} w={52} fill={p.line} />
      <Line x={94} y={74} w={46} fill={p.line} />
      <rect x="71" y="83" width="104" height="70" rx="10" fill={p.ink} opacity="0.07" />
      <path d="M68 86l52 32 52-32v52a10 10 0 0 1-10 10H78a10 10 0 0 1-10-10z" fill="#fff" stroke={p.line} strokeWidth="1.5" />
      <path d="M68 86l52 32 52-32" fill="none" stroke={p.soft} strokeWidth="2" strokeLinejoin="round" />
      <path d="M68 148l38-30M172 148l-38-30" stroke={p.line} strokeWidth="1.5" />
      <circle cx="172" cy="80" r="15" fill={p.accent} />
      <path d="M165 80l5 5 9-10" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  people: p => (
    <>
      <Sheet x={76} y={46} w={88} h={108} p={p} />
      <rect x="102" y="39" width="36" height="15" rx="5" fill={p.ink} />
      {[0, 1, 2].map(i => (
        <g key={i}>
          <circle cx="94" cy={76 + i * 25} r="8" fill={i === 0 ? p.main : p.soft} />
          <Line x={108} y={71 + i * 25} w={i === 0 ? 40 : 32} fill={i === 0 ? p.main : p.line} />
          <Line x={108} y={80 + i * 25} w={24} fill={p.line} />
        </g>
      ))}
      <circle cx="170" cy="134" r="20" fill={p.accent} />
      <circle cx="170" cy="128" r="6" fill="#fff" />
      <path d="M159 144a11 11 0 0 1 22 0" fill="#fff" />
      <circle cx="186" cy="118" r="7" fill={p.ink} />
      <path d="M186 114.5v7M182.5 118h7" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  newsletter: p => (
    <>
      <path d="M36 144c22-4 30-22 46-30" fill="none" stroke={p.soft} strokeWidth="2.5" strokeDasharray="5 7" strokeLinecap="round" />
      <path d="M70 104l112-50-30 92-26-26z" fill={p.ink} opacity="0.08" transform="translate(4 6)" />
      <path d="M70 104l112-50-30 92-26-26z" fill="#fff" stroke={p.line} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M126 120l56-66-46 70z" fill={p.soft} />
      <path d="M126 120l4 24 6-20" fill={p.main} />
      <path d="M126 120l56-66" stroke={p.main} strokeWidth="1.5" />
      <rect x="150" y="122" width="46" height="32" rx="6" fill={p.accent} />
      <path d="M150 128l23 14 23-14" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
    </>
  ),
  donation: p => (
    <>
      <path d="M108 140C66 115 58 89 74 74c12-11 27-7 34 6 7-13 22-17 34-6 16 15 8 41-34 66z" fill={p.ink} opacity="0.08" transform="translate(4 6)" />
      <path d="M108 140C66 115 58 89 74 74c12-11 27-7 34 6 7-13 22-17 34-6 16 15 8 41-34 66z" fill={p.main} />
      <path d="M80 86c2-6 8-10 14-9" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.55" />
      {[0, 1, 2].map(i => {
        const y = 146 - i * 11;
        return (
          <g key={i}>
            <rect x="146" y={y - 5} width="40" height="11" fill={p.accentDark} />
            <ellipse cx="166" cy={y + 6} rx="20" ry="5.5" fill={p.accentDark} />
            <ellipse cx="166" cy={y - 5} rx="20" ry="5.5" fill={p.accent} />
          </g>
        );
      })}
      <path d={sparkle(160, 98, 6)} fill={p.accent} />
    </>
  ),
  chart: p => (
    <>
      <Sheet x={62} y={48} w={116} h={92} p={p} />
      <Line x={74} y={60} w={36} fill={p.main} />
      <path d="M74 128h92" stroke={p.line} strokeWidth="1.5" />
      {[16, 28, 22, 40, 32].map((h, i) => (
        <rect key={i} x={78 + i * 17} y={126 - h} width="10" height={h} rx="3" fill={i === 3 ? p.main : p.soft} />
      ))}
      <path d="M83 100l17-10 17 6 17-20 17 8" fill="none" stroke={p.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="176" cy="130" r="16" fill="#fff" stroke={p.ink} strokeWidth="5" />
      <path d="M188 142l11 11" stroke={p.ink} strokeWidth="7" strokeLinecap="round" />
    </>
  ),
  search: p => (
    <>
      <Sheet x={70} y={44} w={86} h={106} p={p} />
      <Line x={82} y={58} w={44} fill={p.main} />
      <Line x={82} y={70} w={62} fill={p.line} />
      <Line x={82} y={81} w={54} fill={p.line} />
      <Line x={82} y={92} w={40} fill={p.line} />
      <circle cx="148" cy="116" r="27" fill={p.wash} stroke={p.ink} strokeWidth="6" />
      <path d="M167 136l18 18" stroke={p.ink} strokeWidth="9" strokeLinecap="round" />
      <path d="M141 108a7 7 0 1 1 10 6c-2 1-3 3-3 5" fill="none" stroke={p.main} strokeWidth="4" strokeLinecap="round" />
      <circle cx="148" cy="128" r="2.6" fill={p.main} />
    </>
  ),
};

export function Illustration({ name, palette = 'site', className = '' }: {
  name: IllustrationName; palette?: 'site' | 'admin'; className?: string;
}) {
  const p = PALETTES[palette];
  return (
    <svg viewBox="0 0 240 180" className={className} aria-hidden="true" focusable="false">
      <Backdrop p={p} />
      {SCENES[name](p)}
    </svg>
  );
}

export default function EmptyState({ illustration, title, description, action, palette = 'site', size = 'md', className = '' }: {
  illustration: IllustrationName;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  palette?: 'site' | 'admin';
  size?: 'sm' | 'md';
  className?: string;
}) {
  const small = size === 'sm';
  return (
    <div role="status" className={`flex flex-col items-center text-center px-4 ${small ? 'py-6' : 'py-14'} ${className}`}>
      <Illustration name={illustration} palette={palette} className={small ? 'w-40 h-auto' : 'w-56 sm:w-64 h-auto'} />
      <p className={`mt-3 font-semibold ${small ? 'text-[15px]' : 'text-lg font-display'} ${palette === 'admin' ? 'text-[#0e4a56]' : 'text-teal-800'}`}>
        {title}
      </p>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-gray-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
