import { useEffect, useState } from 'react';
import { Heart, ClipboardList, Mail, MessageSquare, Eye, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { analyticsApi } from '../../lib/api';
import type { DashboardOverview } from '../../lib/api';
import { AreaChart, DonutChart, EmptyState, CHART_COLORS, nf } from '../../components/admin/charts';
import { formatBucket, Panel, StatusBadge } from './adminUi';

export type OverviewTarget = 'donations' | 'registrations' | 'subscribers' | 'contacts' | 'stats';

const PROVIDERS = {
  stripe: { label: 'Carte bancaire', color: CHART_COLORS[0] },
  fedapay: { label: 'Mobile Money', color: CHART_COLORS[1] },
  other: { label: 'Autre', color: CHART_COLORS[2] },
} as const;
const PROVIDER_ORDER = ['stripe', 'fedapay', 'other'] as const;

function KpiCard({ label, value, sub, icon, className, onClick }: {
  label: string; value: string; sub: React.ReactNode; icon: React.ReactNode; className: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl p-4 sm:p-5 text-left shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] ${className}`}
    >
      <span className="absolute -right-5 -top-5 w-20 h-20 rounded-full bg-white/10" aria-hidden />
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs sm:text-[13px] font-medium opacity-90">{label}</p>
        <span className="opacity-80">{icon}</span>
      </div>
      <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight tabular-nums">{value}</p>
      <div className="mt-1.5 text-[11px] sm:text-xs opacity-90 flex items-center gap-1">{sub}</div>
    </button>
  );
}

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

export default function OverviewTab({ onNavigate }: { onNavigate: (target: OverviewTarget) => void }) {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState('');
  const [table, setTable] = useState<'registrations' | 'donations'>('registrations');

  useEffect(() => {
    analyticsApi.overview().then(setData).catch(err => setError(err instanceof Error ? err.message : 'Erreur'));
  }, []);

  if (error) return <p className="text-sm text-red-500">Impossible de charger le tableau de bord : {error}</p>;
  if (!data) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-gray-200/70" />)}
        <div className="col-span-2 lg:col-span-3 h-72 rounded-2xl bg-gray-200/70" />
        <div className="col-span-2 h-72 rounded-2xl bg-gray-200/70" />
      </div>
    );
  }

  const { kpis, traffic, donationSplit } = data;
  const prev = kpis.donationsPrevMonth.amount;
  const trend = prev ? Math.round(((kpis.donationsMonth.amount - prev) / prev) * 100) : null;
  const hasTraffic = traffic.totals.views > 0;
  const slices = PROVIDER_ORDER
    .map(p => {
      const row = donationSplit.find(s => (s.provider in PROVIDERS ? s.provider : 'other') === p);
      return row ? { ...PROVIDERS[p], value: row.amount, detail: `${nf.format(row.amount)} F` } : null;
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);
  const donCount = kpis.donationsMonth.count;

  return (
    <div className="space-y-6">
      {/* Chiffres clés */}
      <div className="grid grid-cols-2 md:grid-cols-6 xl:grid-cols-5 gap-3 sm:gap-4">
        <KpiCard
          label="Dons du mois" icon={<Heart size={18} />}
          value={`${nf.format(kpis.donationsMonth.amount)} F`}
          className="bg-gradient-to-br from-[#F2A900] to-[#e09400] text-[#0e4a56] col-span-2 md:col-span-3 xl:col-span-1"
          onClick={() => onNavigate('donations')}
          sub={trend === null
            ? <>{donCount} don{donCount > 1 ? 's' : ''} confirmé{donCount > 1 ? 's' : ''}</>
            : <>{trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {trend >= 0 ? '+' : ''}{trend} % vs mois dernier</>}
        />
        <KpiCard
          label="Inscriptions" icon={<ClipboardList size={18} />}
          value={nf.format(kpis.registrations.total)}
          className="bg-gradient-to-br from-[#2a8ea3] to-[#1a6b7a] text-white md:col-span-3 xl:col-span-1"
          onClick={() => onNavigate('registrations')}
          sub={<>+{nf.format(kpis.registrations.month)} ce mois-ci</>}
        />
        <KpiCard
          label="Abonnés newsletter" icon={<Mail size={18} />}
          value={nf.format(kpis.subscribers.active)}
          className="bg-gradient-to-br from-[#9ecfda] to-[#6eb8cb] text-[#073340] md:col-span-2 xl:col-span-1"
          onClick={() => onNavigate('subscribers')}
          sub={<>+{nf.format(kpis.subscribers.month)} ce mois-ci</>}
        />
        <KpiCard
          label="Messages non lus" icon={<MessageSquare size={18} />}
          value={nf.format(kpis.messages.unread)}
          className="bg-gradient-to-br from-[#f0616a] to-[#e5484d] text-white md:col-span-2 xl:col-span-1"
          onClick={() => onNavigate('contacts')}
          sub={<>sur {nf.format(kpis.messages.total)} reçu{kpis.messages.total > 1 ? 's' : ''}</>}
        />
        <KpiCard
          label="Visiteurs (30 j)" icon={<Eye size={18} />}
          value={nf.format(kpis.visitors.visitors)}
          className="bg-gradient-to-br from-[#0e4a56] to-[#073340] text-white md:col-span-2 xl:col-span-1"
          onClick={() => onNavigate('stats')}
          sub={<>{nf.format(kpis.visitors.views)} pages vues</>}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Courbe d'audience */}
        <Panel
          className="lg:col-span-2"
          title="Audience du site"
          subtitle="30 derniers jours"
          action={<button onClick={() => onNavigate('stats')} className="text-xs font-semibold text-[#1a6b7a] hover:underline flex items-center gap-1">Statistiques <ArrowRight size={13} /></button>}
        >
          {hasTraffic ? (
            <AreaChart
              labels={traffic.series.map(p => formatBucket(p.key))}
              series={[
                { name: 'Visiteurs', color: CHART_COLORS[0], values: traffic.series.map(p => p.visitors) },
                { name: 'Pages vues', color: CHART_COLORS[1], values: traffic.series.map(p => p.views) },
              ]}
            />
          ) : (
            <EmptyState illustration="chart" title="Aucune visite pour l'instant">La courbe se remplira dès les premières visites du site.</EmptyState>
          )}
        </Panel>

        {/* Anneau : répartition des dons */}
        <Panel title="Répartition des dons" subtitle="Dons confirmés, par moyen de paiement">
          {slices.length ? (
            <DonutChart slices={slices} centerLabel="Répartition des dons par moyen de paiement" />
          ) : (
            <EmptyState illustration="donation" title="Aucun don confirmé">La répartition apparaîtra dès le premier don reçu.</EmptyState>
          )}
        </Panel>
      </div>

      {/* Tableau */}
      <Panel
        title={table === 'registrations' ? 'Dernières inscriptions' : 'Derniers dons'}
        action={
          <div className="inline-flex rounded-lg bg-gray-100 p-0.5 text-xs font-medium">
            {(['registrations', 'donations'] as const).map(t => (
              <button key={t} onClick={() => setTable(t)}
                className={`px-3 py-1.5 rounded-md transition-colors ${table === t ? 'bg-white text-[#0e4a56] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {t === 'registrations' ? 'Inscriptions' : 'Dons'}
              </button>
            ))}
          </div>
        }
      >
        {table === 'registrations' ? (
          data.latestRegistrations.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr className="bg-[#1a6b7a] text-white text-left text-xs">
                    <th className="px-4 py-2.5 font-semibold rounded-l-lg">Nom</th>
                    <th className="px-4 py-2.5 font-semibold">Activité</th>
                    <th className="px-4 py-2.5 font-semibold">Date</th>
                    <th className="px-4 py-2.5 font-semibold rounded-r-lg">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.latestRegistrations.map(r => (
                    <tr key={r._id} className="hover:bg-gray-50/80">
                      <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                      <td className="px-4 py-3 text-gray-500 truncate max-w-[220px]">{typeof r.activityId === 'object' && r.activityId ? r.activityId.title : '—'}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(r.createdAt)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.paymentStatus === 'failed' ? 'failed' : r.paymentStatus === 'pending' ? 'payment_pending' : r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <EmptyState illustration="people" title="Aucune inscription pour l'instant">Les inscriptions aux activités s'afficheront ici.</EmptyState>
        ) : (
          data.latestDonations.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="bg-[#1a6b7a] text-white text-left text-xs">
                    <th className="px-4 py-2.5 font-semibold rounded-l-lg">Donateur</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Montant</th>
                    <th className="px-4 py-2.5 font-semibold">Moyen</th>
                    <th className="px-4 py-2.5 font-semibold">Date</th>
                    <th className="px-4 py-2.5 font-semibold rounded-r-lg">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.latestDonations.map(d => (
                    <tr key={d._id} className="hover:bg-gray-50/80">
                      <td className="px-4 py-3 font-medium text-gray-800">{d.donorName || 'Anonyme'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800 tabular-nums whitespace-nowrap">{nf.format(d.amount)} F</td>
                      <td className="px-4 py-3 text-gray-500">{d.provider === 'fedapay' ? 'Mobile Money' : d.provider === 'stripe' ? 'Carte' : d.paymentMethod}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(d.createdAt)}</td>
                      <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <EmptyState illustration="donation" title="Aucun don pour l'instant">Les dons reçus s'afficheront ici, avec leur statut.</EmptyState>
        )}
      </Panel>
    </div>
  );
}
