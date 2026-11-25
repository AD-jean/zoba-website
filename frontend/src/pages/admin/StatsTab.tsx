import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { analyticsApi } from '../../lib/api';
import type { AudienceStats, StatsPeriod } from '../../lib/api';
import { AreaChart, BarList, DonutChart, EmptyState, CHART_COLORS, nf } from '../../components/admin/charts';
import { formatBucket, Panel } from './adminUi';

const PERIODS: { id: StatsPeriod; label: string; long: string }[] = [
  { id: '7d', label: '7 j', long: '7 derniers jours' },
  { id: '30d', label: '30 j', long: '30 derniers jours' },
  { id: '12m', label: '12 mois', long: '12 derniers mois' },
];

const PAGE_NAMES: Record<string, string> = {
  '/': 'Accueil', '/a-propos': 'À propos', '/departements': 'Départements', '/activites': 'Activités',
  '/actualites': 'Actualités', '/galerie': 'Galerie', '/contact': 'Contact', '/dons': 'Dons',
  '/dons/retour': 'Retour de paiement (don)', '/billet': 'Billet', '/confidentialite': 'Confidentialité',
};
const DEVICE_NAMES: Record<string, string> = { mobile: 'Mobile', desktop: 'Ordinateur', tablet: 'Tablette' };
const DEVICE_ORDER = ['mobile', 'desktop', 'tablet'];

const countryNames = (() => {
  try { return new Intl.DisplayNames(['fr'], { type: 'region' }); } catch { return null; }
})();

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm px-4 py-3.5">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xl sm:text-2xl font-bold text-[#0e4a56] tabular-nums mt-0.5">{value}</p>
    </div>
  );
}

export default function StatsTab() {
  const [period, setPeriod] = useState<StatsPeriod>('30d');
  const [data, setData] = useState<AudienceStats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError('');
    analyticsApi.stats(period)
      .then(setData)
      .catch(err => setError(err instanceof Error ? err.message : 'Erreur'))
      .finally(() => setLoading(false));
  }, [period]);

  const current = PERIODS.find(p => p.id === period)!;
  const empty = data && data.totals.views === 0;
  const sources = data
    ? [...(data.direct ? [{ key: 'Accès direct', views: data.direct, visitors: 0 }] : []), ...data.referrers].sort((a, b) => b.views - a.views)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#0e4a56]">Statistiques de visite</h1>
          <p className="text-xs text-gray-400">{current.long} · mesure anonyme, sans cookie</p>
        </div>
        <div className="inline-flex rounded-xl bg-white ring-1 ring-gray-200 p-1 text-sm font-medium shadow-sm" role="group" aria-label="Période">
          {PERIODS.map(p => (
            <button key={p.id} onClick={() => setPeriod(p.id)} aria-pressed={period === p.id}
              className={`px-3.5 py-1.5 rounded-lg transition-colors ${period === p.id ? 'bg-[#0e4a56] text-white' : 'text-gray-500 hover:text-[#0e4a56]'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">Impossible de charger les statistiques : {error}</p>}

      {data && (
        <div className={`space-y-6 transition-opacity ${loading ? 'opacity-50' : ''}`}>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <Tile label="Visiteurs" value={nf.format(data.totals.visitors)} />
            <Tile label="Pages vues" value={nf.format(data.totals.views)} />
            <Tile label="Pages / visiteur" value={data.totals.visitors ? (data.totals.views / data.totals.visitors).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) : '—'} />
          </div>

          <Panel title="Audience" subtitle={period === '12m' ? 'Par mois' : 'Par jour'}>
            {empty ? (
              <EmptyState illustration="chart" title="Aucune visite sur cette période">Essayez une période plus longue.</EmptyState>
            ) : (
              <AreaChart
                labels={data.series.map(p => formatBucket(p.key))}
                series={[
                  { name: 'Visiteurs', color: CHART_COLORS[0], values: data.series.map(p => p.visitors) },
                  { name: 'Pages vues', color: CHART_COLORS[1], values: data.series.map(p => p.views) },
                ]}
              />
            )}
          </Panel>

          {!empty && (
            <div className="grid md:grid-cols-2 gap-6">
              <Panel title="Pages les plus vues">
                <BarList items={data.pages} format={k => PAGE_NAMES[k] ?? k} />
              </Panel>
              <Panel title="Sources" subtitle="D'où viennent les visiteurs">
                <BarList items={sources} color={CHART_COLORS[2]} />
              </Panel>
              <Panel title="Appareils">
                <DonutChart
                  centerLabel="Répartition des visites par appareil"
                  slices={DEVICE_ORDER
                    .map((d, i) => ({ d, i, row: data.devices.find(x => x.key === d) }))
                    .filter(x => x.row)
                    .map(({ d, i, row }) => ({ label: DEVICE_NAMES[d], value: row!.views, color: CHART_COLORS[i], detail: `${nf.format(row!.views)} vues` }))}
                />
              </Panel>
              <Panel title="Pays" subtitle="Approximatif">
                {data.countries.length
                  ? <BarList items={data.countries} color={CHART_COLORS[1]} format={k => countryNames?.of(k) ?? k} />
                  : <EmptyState illustration="search" title="Pays non déterminé">Il s'affichera dès que des visiteurs seront localisés.</EmptyState>}
              </Panel>
            </div>
          )}

          <p className="flex items-start gap-2 text-xs text-gray-400">
            <ShieldCheck size={14} className="flex-shrink-0 mt-px" />
            Aucune adresse IP ni cookie n'est enregistré : chaque visiteur est compté grâce à une empreinte anonyme
            renouvelée chaque jour. Les signaux « Ne pas me suivre » des navigateurs sont respectés.
          </p>
        </div>
      )}
    </div>
  );
}
