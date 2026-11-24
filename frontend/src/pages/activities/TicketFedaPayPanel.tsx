import { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';
import { registrationsApi, type TicketPaymentResult } from '../../lib/api';
import { loadFedaPayScript, type FedaPayGlobal } from '../../lib/fedapay';

const publicKey = import.meta.env.VITE_FEDAPAY_PUBLIC_KEY as string | undefined;

interface TicketFedaPayPanelProps {
  activityId: string;
  name: string;
  email: string;
  phone: string;
  onResult: (result: TicketPaymentResult) => void;
}

export default function TicketFedaPayPanel({ activityId, name, email, phone, onResult }: TicketFedaPayPanelProps) {
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [fedapay, setFedapay] = useState<FedaPayGlobal | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transactionId === null || registrationId === null || !publicKey) return;
    let cancelled = false;

    loadFedaPayScript()
      .then(FedaPay => {
        if (cancelled) return;
        setFedapay(FedaPay);
        FedaPay.init('#fedapay-ticket-pay-btn', {
          public_key: publicKey,
          transaction: { id: transactionId },
          customer: { email: email || undefined, firstname: name || undefined },
          onComplete: (reason, transaction) => {
            // Fenetre fermee sans payer : rien a annoncer, le bouton reste disponible.
            if (reason !== FedaPay.CHECKOUT_COMPLETED) return;
            const status = transaction?.status;
            if (status === 'declined' || status === 'canceled') {
              onResult({
                registrationId,
                kind: 'failed',
                message: status === 'canceled'
                  ? "Le paiement Mobile Money a été annulé. Aucun montant n'a été débité."
                  : "Le paiement Mobile Money a été refusé (solde insuffisant, délai dépassé ou code erroné). Aucun montant n'a été débité.",
              });
              return;
            }
            onResult({ registrationId, kind: status === 'approved' ? 'paid' : 'processing' });
          },
        });
      })
      .catch(() => setError("Impossible de charger le module de paiement FedaPay."));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId, registrationId, email, name]);

  const startCheckout = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const data = await registrationsApi.checkout({ activityId, name, email, phone, provider: 'fedapay' });
      if (data.provider === 'fedapay') {
        setRegistrationId(data.id);
        setTransactionId(data.transactionId);
      }
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

  const buttonClasses = "w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold py-3 rounded-xl shadow-sm " +
    "transition-all duration-200 ease-out hover:bg-emerald-700 hover:shadow-md hover:-translate-y-0.5 " +
    "active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0";

  return (
    <div className="rounded-2xl border-2 border-emerald-500/20 bg-white p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Smartphone size={20} className="text-emerald-600" />
        <h4 className="font-bold text-emerald-700">Mobile Money — FedaPay</h4>
      </div>

      {error && <p className="text-red-500 text-sm mb-3 animate-fade-in">{error}</p>}

      {transactionId === null ? (
        <button type="button" onClick={startCheckout} disabled={submitting} className={buttonClasses}>
          {submitting ? 'Préparation...' : 'Continuer avec Mobile Money'}
        </button>
      ) : (
        <button id="fedapay-ticket-pay-btn" type="button" disabled={!fedapay} className={buttonClasses}>
          {fedapay ? 'Payer via FedaPay' : 'Chargement...'}
        </button>
      )}

      <p className="text-xs text-gray-400 mt-4">
        Ouvre une fenêtre FedaPay sécurisée pour finaliser le paiement (Moov Money, MTN, cartes) sans quitter cette page.
      </p>
    </div>
  );
}
