import { useState } from 'react';
import { Smartphone } from 'lucide-react';
import { donationsApi } from '../../lib/api';

interface FedaPayPanelProps {
  amount: number;
}

export default function FedaPayPanel({ amount }: FedaPayPanelProps) {
  const [donor, setDonor] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    setLoading(true);
    setError(null);
    try {
      const data = await donationsApi.checkout({
        amount,
        currency: 'XOF',
        provider: 'fedapay',
        donorName: donor.name || undefined,
        donorEmail: donor.email || undefined,
        donorPhone: donor.phone || undefined,
      });
      if (data.provider === 'fedapay') {
        window.location.href = data.url;
        return;
      }
    } catch {
      setError("Impossible d'initialiser le paiement FedaPay. Veuillez réessayer.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border-2 border-emerald-500/20 bg-white p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Smartphone size={20} className="text-emerald-600" />
        <h4 className="font-bold text-emerald-700">Mobile Money — FedaPay</h4>
      </div>

      <div className="space-y-3 mb-4">
        <input
          autoComplete="name"
          value={donor.name}
          onChange={e => setDonor(d => ({ ...d, name: e.target.value }))}
          placeholder="Nom complet (optionnel)"
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={donor.email}
            onChange={e => setDonor(d => ({ ...d, email: e.target.value }))}
            placeholder="E-mail (optionnel)"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={donor.phone}
            onChange={e => setDonor(d => ({ ...d, phone: e.target.value }))}
            placeholder="Téléphone (optionnel)"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-3 animate-fade-in">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold py-3 rounded-xl shadow-sm
                   transition-all duration-200 ease-out hover:bg-emerald-700 hover:shadow-md hover:-translate-y-0.5
                   active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {loading ? 'Redirection...' : 'Continuer avec Mobile Money'}
      </button>

      <p className="text-xs text-gray-400 mt-4">
        Vous serez redirigé vers la page de paiement sécurisée de FedaPay (Moov Money, MTN, cartes).
      </p>
    </form>
  );
}
