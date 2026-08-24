import { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';
import { donationsApi } from '../../lib/api';
import { loadFedaPayScript, type FedaPayGlobal } from '../../lib/fedapay';

const publicKey = import.meta.env.VITE_FEDAPAY_PUBLIC_KEY as string | undefined;

interface FedaPayPanelProps {
  amount: number;
}

export default function FedaPayPanel({ amount }: FedaPayPanelProps) {
  const [donor, setDonor] = useState({ name: '', email: '', phone: '' });
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const [fedapay, setFedapay] = useState<FedaPayGlobal | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  useEffect(() => {
    setTransactionId(null);
    setSucceeded(false);
  }, [amount]);

  useEffect(() => {
    if (transactionId === null || !publicKey) return;
    let cancelled = false;

    loadFedaPayScript()
      .then(FedaPay => {
        if (cancelled) return;
        setFedapay(FedaPay);
        FedaPay.init('#fedapay-pay-btn', {
          public_key: publicKey,
          transaction: { id: transactionId },
          customer: { email: donor.email || undefined, firstname: donor.name || undefined },
          onComplete: reason => {
            if (reason === FedaPay.CHECKOUT_COMPLETED) {
              setSucceeded(true);
            }
          },
        });
      })
      .catch(() => setError("Impossible de charger le module de paiement FedaPay."));

    return () => {
      cancelled = true;
    };
  }, [transactionId, donor.email, donor.name]);

  const startCheckout = async () => {
    if (!amount || amount <= 0) return;
    setSubmitting(true);
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
      if (data.provider === 'fedapay') setTransactionId(data.transactionId);
    } catch {
      setError("Impossible d'initialiser le paiement FedaPay. Veuillez réessayer.");
    }
    setSubmitting(false);
  };

  if (!publicKey) {
    return (
      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-4">
        Le paiement Mobile Money n'est pas encore configuré.
      </p>
    );
  }

  if (succeeded) {
    return (
      <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-4 animate-scale-in">
        Paiement reçu, en cours de confirmation. Merci pour votre générosité !
      </p>
    );
  }

  const buttonClasses = "w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold py-3 rounded-xl shadow-sm " +
    "transition-all duration-200 ease-out hover:bg-emerald-700 hover:shadow-md hover:-translate-y-0.5 " +
    "active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0";

  return (
    <div className="rounded-2xl border-2 border-emerald-500/20 bg-white p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Smartphone size={20} className="text-emerald-600" />
        <h4 className="font-bold text-emerald-700">Mobile Money — FedaPay</h4>
      </div>

      <div className="space-y-3 mb-4">
        <input
          value={donor.name}
          onChange={e => setDonor(d => ({ ...d, name: e.target.value }))}
          placeholder="Nom complet (optionnel)"
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="email"
            value={donor.email}
            onChange={e => setDonor(d => ({ ...d, email: e.target.value }))}
            placeholder="E-mail (optionnel)"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            value={donor.phone}
            onChange={e => setDonor(d => ({ ...d, phone: e.target.value }))}
            placeholder="Téléphone (optionnel)"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-3 animate-fade-in">{error}</p>}

      {transactionId === null ? (
        <button type="button" onClick={startCheckout} disabled={submitting || !amount} className={buttonClasses}>
          {submitting ? 'Préparation...' : 'Continuer avec Mobile Money'}
        </button>
      ) : (
        <button id="fedapay-pay-btn" type="button" disabled={!fedapay} className={buttonClasses}>
          {fedapay ? 'Payer via FedaPay' : 'Chargement...'}
        </button>
      )}

      <p className="text-xs text-gray-400 mt-4">
        Ouvre une fenêtre FedaPay sécurisée pour finaliser le paiement (Moov Money, MTN, cartes) sans quitter cette page.
      </p>
    </div>
  );
}
