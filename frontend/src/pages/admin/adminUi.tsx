/** Briques d'interface partagées par les onglets du tableau de bord. */

export function Panel({ title, subtitle, action, className = '', children }: {
  title: string; subtitle?: string; action?: React.ReactNode; className?: string; children: React.ReactNode;
}) {
  return (
    <section className={`bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5 ${className}`}>
      <header className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 w-1.5 h-5 rounded-full bg-[#F2A900]" aria-hidden />
          <div>
            <h2 className="font-semibold text-[#0e4a56] text-[15px] leading-tight">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

const STATUS: Record<string, { label: string; className: string }> = {
  confirmed: { label: 'Confirmée', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  completed: { label: 'Reçu', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  pending: { label: 'En attente', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  payment_pending: { label: 'Paiement en attente', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  cancelled: { label: 'Annulée', className: 'bg-gray-100 text-gray-500 ring-gray-200' },
  failed: { label: 'Échec', className: 'bg-red-50 text-red-700 ring-red-200' },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 ring-gray-200' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ring-1 whitespace-nowrap ${s.className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden />
      {s.label}
    </span>
  );
}

/** « 2026-11-24 » -> « 24 nov. » ; « 2026-11 » -> « nov. 26 ». */
export function formatBucket(key: string): string {
  if (key.length === 7) {
    return new Date(`${key}-01T00:00:00Z`).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit', timeZone: 'UTC' });
  }
  return new Date(`${key}T00:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}
