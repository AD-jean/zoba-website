import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Heart, CheckCircle, Shield, Smartphone, CreditCard, XCircle } from 'lucide-react';
import { donationsApi } from '../lib/api';
import StripePanel from './donations/StripePanel';
import FedaPayPanel from './donations/FedaPayPanel';

type Method = 'PayPal' | 'Stripe' | 'FedaPay';

const AMOUNTS = [1000, 2500, 5000, 10000, 25000];

const METHODS: {
  id: Method;
  label: string;
  tagline: string;
  icon: React.ReactNode;
  selectedClasses: string;
  idleHoverClasses: string;
}[] = [
  {
    id: 'Stripe',
    label: 'Carte bancaire',
    tagline: 'Visa, Mastercard — via Stripe',
    icon: <CreditCard size={20} />,
    selectedClasses: 'border-[#635BFF] bg-[#635BFF]/5 text-[#635BFF]',
    idleHoverClasses: 'hover:border-[#635BFF]/40',
  },
  {
    id: 'FedaPay',
    label: 'Mobile Money',
    tagline: 'Moov, MTN, cartes — via FedaPay',
    icon: <Smartphone size={20} />,
    selectedClasses: 'border-emerald-600 bg-emerald-50 text-emerald-700',
    idleHoverClasses: 'hover:border-emerald-300',
  },
  {
    id: 'PayPal',
    label: 'PayPal',
    tagline: 'Paiement direct PayPal',
    icon: <Shield size={20} />,
    selectedClasses: 'border-[#0070BA] bg-[#0070BA]/5 text-[#0070BA]',
    idleHoverClasses: 'hover:border-[#0070BA]/40',
  },
];

const MANUAL_METHODS: Record<'PayPal', { color: string; button: string; instructions: string }> = {
  PayPal: {
    color: 'text-[#0070BA] border-[#0070BA]/20',
    button: 'bg-[#0070BA] hover:bg-[#005c99]',
    instructions: 'Nous vous recontacterons pour finaliser ce don par PayPal.',
  },
};

function ManualMethodPanel({ method, amount }: { method: 'PayPal'; amount: number }) {
  const [donor, setDonor] = useState({ name: '', email: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { color, button, instructions } = MANUAL_METHODS[method];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    setStatus('loading');
    try {
      await donationsApi.record({
        amount,
        currency: 'XOF',
        paymentMethod: method,
        donorName: donor.name || undefined,
        donorEmail: donor.email || undefined,
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <p className={`text-sm bg-white border-2 rounded-xl p-4 animate-scale-in ${color}`}>
        Merci ! Votre don de {amount.toLocaleString('fr-FR')} XOF via {method} a bien été enregistré. {instructions}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className={`rounded-2xl border-2 bg-white p-6 space-y-4 animate-fade-in ${color}`}>
      <p className="text-sm text-gray-500">{instructions}</p>
      <input
        autoComplete="name"
        value={donor.name}
        onChange={e => setDonor(d => ({ ...d, name: e.target.value }))}
        placeholder="Nom complet (optionnel)"
        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      <input
        type="email"
        inputMode="email"
        autoComplete="email"
        value={donor.email}
        onChange={e => setDonor(d => ({ ...d, email: e.target.value }))}
        placeholder="E-mail (optionnel)"
        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      {status === 'error' && <p className="text-red-500 text-sm animate-fade-in">Une erreur est survenue. Veuillez réessayer.</p>}
      <button
        type="submit"
        disabled={status === 'loading' || !amount}
        className={`w-full text-white font-semibold py-3 rounded-xl shadow-sm transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0 ${button}`}
      >
        {status === 'loading' ? 'Traitement...' : `Confirmer le don ${method}`}
      </button>
    </form>
  );
}

export default function DonationsPage() {
  const [searchParams] = useSearchParams();
  const [amount, setAmount] = useState<number | ''>('');
  const [customAmount, setCustomAmount] = useState('');
  const [method, setMethod] = useState<Method | null>(null);
  const [returnStatus, setReturnStatus] = useState<'success' | 'cancel' | null>(null);

  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment === 'success' || payment === 'cancel') setReturnStatus(payment);
  }, [searchParams]);

  const finalAmount = amount !== '' ? amount : Number(customAmount);

  return (
    <>
      <section className="relative pt-32 pb-20 bg-gradient-animated overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-teal-300 mb-4">Soutenez-nous</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-display mb-4">Faire un don</h1>
          <p className="text-teal-200 text-lg max-w-xl">
            Votre générosité permet à la Zone Baptiste Agapé de poursuivre sa mission au service de Dieu et des communautés.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4">
          {returnStatus === 'success' && (
            <div className="mb-6 flex items-start gap-3 bg-teal-50 border border-teal-200 rounded-xl p-4">
              <CheckCircle size={20} className="text-teal-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-teal-800">
                Paiement reçu, en cours de confirmation. Un reçu ne sera émis qu'une fois le paiement validé par notre système.
              </p>
            </div>
          )}
          {returnStatus === 'cancel' && (
            <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <XCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">Paiement annulé. Vous pouvez réessayer ci-dessous.</p>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-8 space-y-8">
            {/* Amount */}
            <div>
              <h3 className="font-bold text-teal-800 mb-4 flex items-center gap-2">
                <Heart size={18} className="text-teal-500" />
                Montant du don (XOF)
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
                {AMOUNTS.map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => { setAmount(a); setCustomAmount(''); }}
                    className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-200 active:scale-95 ${
                      amount === a
                        ? 'border-teal-600 bg-teal-50 text-teal-700'
                        : 'border-gray-200 text-gray-600 hover:border-teal-300'
                    }`}
                  >
                    {a.toLocaleString('fr-FR')}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Autre montant</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="100"
                  value={customAmount}
                  onChange={e => { setCustomAmount(e.target.value); setAmount(''); }}
                  placeholder="Ex: 15000"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Method — chaque carte a sa propre identité de marque */}
            <div>
              <h3 className="font-bold text-teal-800 mb-4">Mode de paiement</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {METHODS.map(({ id, label, tagline, icon, selectedClasses, idleHoverClasses }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMethod(id)}
                    className={`group p-4 rounded-xl border-2 text-left flex flex-col gap-2 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98] ${
                      method === id ? selectedClasses : `border-gray-200 text-gray-600 ${idleHoverClasses}`
                    }`}
                  >
                    <span className="inline-block transition-transform duration-200 group-hover:scale-110">{icon}</span>
                    <div>
                      <p className="text-sm font-bold leading-tight">{label}</p>
                      <p className="text-xs opacity-70 leading-tight mt-0.5">{tagline}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Panneau propre à la méthode choisie */}
            {method && !finalAmount && (
              <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-4 animate-fade-in">
                Choisissez d'abord un montant ci-dessus.
              </p>
            )}
            {method && finalAmount > 0 && (
              <div className="animate-fade-in">
                {method === 'Stripe' && <StripePanel amount={finalAmount} />}
                {method === 'FedaPay' && <FedaPayPanel amount={finalAmount} />}
                {method === 'PayPal' && (
                  <ManualMethodPanel method={method} amount={finalAmount} />
                )}
              </div>
            )}

            <p className="text-xs text-gray-400 text-center">
              Votre don contribue directement aux activités de la Zone Baptiste Agapé. Que Dieu vous bénisse.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
