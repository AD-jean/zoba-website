import { useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';
import { donationsApi } from '../../lib/api';

interface StripePanelProps {
  amount: number;
}

export default function StripePanel({ amount }: StripePanelProps) {
  const [email, setEmail] = useState('');
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
        provider: 'stripe',
        donorEmail: email || undefined,
      });
      if (data.provider === 'stripe') {
        window.location.href = data.url;
        return;
      }
    } catch {
      setError("Impossible d'initialiser le paiement par carte. Veuillez réessayer.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border-2 border-[#635BFF]/20 bg-white p-6">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard size={20} className="text-[#635BFF]" />
        <h4 className="font-bold text-[#635BFF]">Carte bancaire — Stripe</h4>
      </div>

      <input
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="E-mail pour le reçu (optionnel)"
        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm mb-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
      />

      {error && <p className="text-red-500 text-sm mb-3 animate-fade-in">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#635BFF] text-white font-semibold py-3 rounded-xl shadow-sm
                   transition-all duration-200 ease-out hover:bg-[#524ae0] hover:shadow-md hover:-translate-y-0.5
                   active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0"
      >
        <Lock size={16} />
        {loading ? 'Redirection...' : 'Payer avec Stripe'}
      </button>

      <p className="text-xs text-gray-400 mt-4 flex items-center gap-1.5">
        <Lock size={12} /> Vous serez redirigé vers la page de paiement sécurisée de Stripe. Vos coordonnées bancaires ne transitent jamais par nos serveurs.
      </p>
    </form>
  );
}
