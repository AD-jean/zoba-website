import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { CreditCard, Lock } from 'lucide-react';
import { donationsApi } from '../../lib/api';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const appearance = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#0e4a56',
    colorText: '#1f2937',
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: '12px',
  },
};

interface StripePanelProps {
  amount: number;
}

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/dons?payment=success` },
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message || 'Le paiement a échoué. Veuillez réessayer.');
      setSubmitting(false);
      return;
    }

    setSucceeded(true);
    setSubmitting(false);
  };

  if (succeeded) {
    return (
      <p className="text-sm text-violet-800 bg-violet-50 border border-violet-200 rounded-xl p-4 animate-scale-in">
        Paiement reçu, en cours de confirmation. Merci pour votre générosité !
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-red-500 text-sm animate-fade-in">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full flex items-center justify-center gap-2 bg-[#635BFF] text-white font-semibold py-3 rounded-xl shadow-sm
                   transition-all duration-200 ease-out hover:bg-[#524ae0] hover:shadow-md hover:-translate-y-0.5
                   active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0"
      >
        <Lock size={16} />
        {submitting ? 'Traitement...' : 'Payer avec Stripe'}
      </button>
    </form>
  );
}

export default function StripePanel({ amount }: StripePanelProps) {
  const [email, setEmail] = useState('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!amount || amount <= 0 || !publishableKey) return;
    setClientSecret(null);
    setError(null);
    const handle = setTimeout(() => {
      donationsApi
        .checkout({ amount, currency: 'XOF', provider: 'stripe', donorEmail: email || undefined })
        .then(data => {
          if (data.provider === 'stripe') setClientSecret(data.clientSecret);
        })
        .catch(() => setError('Impossible d\'initialiser le paiement par carte. Veuillez réessayer.'));
    }, 500);
    return () => clearTimeout(handle);
  }, [amount, email]);

  if (!publishableKey) {
    return (
      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-4">
        Le paiement par carte n'est pas encore configuré.
      </p>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-[#635BFF]/20 bg-white p-6">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard size={20} className="text-[#635BFF]" />
        <h4 className="font-bold text-[#635BFF]">Carte bancaire — Stripe</h4>
      </div>

      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="E-mail pour le reçu (optionnel)"
        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm mb-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
      />

      {error && <p className="text-red-500 text-sm mb-3 animate-fade-in">{error}</p>}
      {clientSecret && stripePromise ? (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
          <CheckoutForm />
        </Elements>
      ) : (
        !error && <div className="h-40 rounded-xl bg-gray-100 animate-pulse" />
      )}
      <p className="text-xs text-gray-400 mt-4 flex items-center gap-1.5">
        <Lock size={12} /> Paiement sécurisé traité directement par Stripe. Vos coordonnées bancaires ne transitent jamais par nos serveurs.
      </p>
    </div>
  );
}
