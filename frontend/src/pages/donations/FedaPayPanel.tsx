import { useEffect, useRef, useState } from 'react';
import { Smartphone, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { donationsApi, type MobileOperator } from '../../lib/api';

interface FedaPayPanelProps {
  amount: number;
}

const OPERATORS: { id: MobileOperator; label: string; hint: string; classes: string }[] = [
  { id: 'moov_tg', label: 'Moov Money', hint: 'Flooz', classes: 'border-sky-600 bg-sky-50 text-sky-700' },
  { id: 'togocel', label: 'Mixx by Yas', hint: 'ex-T-Money', classes: 'border-amber-500 bg-amber-50 text-amber-700' },
];

// Le donateur a quelques minutes pour valider sur son telephone ; au-dela on arrete
// d'interroger le serveur mais le don reste verifiable cote admin (webhook FedaPay).
const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS = 3 * 60 * 1000;

type Step = 'form' | 'waiting' | 'success' | 'failed' | 'timeout';

const inputClasses =
  'w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500';

export default function FedaPayPanel({ amount }: FedaPayPanelProps) {
  const [operator, setOperator] = useState<MobileOperator>('moov_tg');
  const [donor, setDonor] = useState({ name: '', email: '', phone: '' });
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Arrete le suivi si le composant disparait (changement de mode de paiement, navigation).
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const pollStatus = (donationId: string, startedAt: number) => {
    timer.current = setTimeout(async () => {
      try {
        const { status } = await donationsApi.getStatus(donationId);
        if (status === 'completed') return setStep('success');
        if (status === 'failed') return setStep('failed');
      } catch {
        // Erreur reseau ponctuelle : on reessaie au prochain tour.
      }
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) return setStep('timeout');
      pollStatus(donationId, startedAt);
    }, POLL_INTERVAL_MS);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    const digits = donor.phone.replace(/\D/g, '').replace(/^(00228|228)(?=\d{8}$)/, '');
    if (!/^\d{8}$/.test(digits)) {
      setError('Numéro invalide : saisissez les 8 chiffres de votre numéro (ex. 90 12 34 56).');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { id } = await donationsApi.mobileMoney({
        amount,
        operator,
        phone: donor.phone,
        donorName: donor.name || undefined,
        donorEmail: donor.email || undefined,
      });
      setStep('waiting');
      pollStatus(id, Date.now());
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Impossible d'envoyer la demande de paiement. Veuillez réessayer.");
    }
    setLoading(false);
  };

  // Repli : page hebergee FedaPay (carte bancaire, ou si le push USSD ne fonctionne pas).
  const payOnFedaPayPage = async () => {
    setRedirecting(true);
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
      window.location.href = data.url;
      return;
    } catch {
      setError("Impossible d'ouvrir la page de paiement FedaPay. Veuillez réessayer.");
    }
    setRedirecting(false);
  };

  const reset = () => {
    if (timer.current) clearTimeout(timer.current);
    setStep('form');
  };

  const operatorLabel = OPERATORS.find(o => o.id === operator)?.label;

  if (step === 'waiting') {
    return (
      <div className="rounded-2xl border-2 border-emerald-500/20 bg-white p-6 text-center animate-fade-in" role="status" aria-live="polite">
        <Loader2 size={36} className="mx-auto text-emerald-600 animate-spin mb-4" />
        <h4 className="font-bold text-emerald-700 mb-2">Validez le paiement sur votre téléphone</h4>
        <p className="text-sm text-gray-600">
          Une demande de <strong>{amount.toLocaleString('fr-FR')} XOF</strong> a été envoyée au{' '}
          <strong>{donor.phone}</strong> ({operatorLabel}). Saisissez votre code secret pour confirmer.
        </p>
        <p className="text-xs text-gray-400 mt-4">Pas de notification ? Vérifiez votre solde et votre réseau, puis patientez quelques secondes.</p>
        <button type="button" onClick={reset} className="mt-4 text-sm text-gray-500 underline hover:text-gray-700">
          Annuler et modifier
        </button>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="rounded-2xl border-2 border-teal-200 bg-teal-50 p-6 text-center animate-scale-in" role="status">
        <CheckCircle size={36} className="mx-auto text-teal-600 mb-3" />
        <h4 className="font-bold text-teal-800 mb-1">Merci pour votre don !</h4>
        <p className="text-sm text-teal-700">Votre paiement de {amount.toLocaleString('fr-FR')} XOF a bien été confirmé. Que Dieu vous bénisse.</p>
      </div>
    );
  }

  if (step === 'failed' || step === 'timeout') {
    return (
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6 text-center animate-fade-in" role="alert">
        <XCircle size={36} className="mx-auto text-amber-600 mb-3" />
        <h4 className="font-bold text-amber-800 mb-1">
          {step === 'failed' ? 'Paiement non abouti' : 'Paiement toujours en attente'}
        </h4>
        <p className="text-sm text-amber-700">
          {step === 'failed'
            ? 'Le paiement a été refusé ou annulé. Aucun montant n’a été débité.'
            : 'Nous n’avons pas encore reçu la confirmation. Si vous avez validé, votre don sera pris en compte automatiquement.'}
        </p>
        <button type="button" onClick={reset} className="mt-4 bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-emerald-700">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border-2 border-emerald-500/20 bg-white p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Smartphone size={20} className="text-emerald-600" />
        <h4 className="font-bold text-emerald-700">Mobile Money</h4>
      </div>

      <fieldset className="mb-4">
        <legend className="block text-sm text-gray-600 mb-2">Votre opérateur</legend>
        <div className="grid grid-cols-2 gap-3">
          {OPERATORS.map(o => (
            <button
              key={o.id}
              type="button"
              aria-pressed={operator === o.id}
              onClick={() => setOperator(o.id)}
              className={`p-3 rounded-xl border-2 text-left transition-all duration-200 active:scale-[0.98] ${
                operator === o.id ? o.classes : 'border-gray-200 text-gray-600 hover:border-emerald-300'
              }`}
            >
              <p className="text-sm font-bold leading-tight">{o.label}</p>
              <p className="text-xs opacity-70">{o.hint}</p>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="space-y-3 mb-4">
        <div>
          <label htmlFor="momo-phone" className="block text-sm text-gray-600 mb-1.5">
            Numéro {operatorLabel} <span className="text-red-500">*</span>
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-sm text-gray-500">+228</span>
            <input
              id="momo-phone"
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              value={donor.phone}
              onChange={e => setDonor(d => ({ ...d, phone: e.target.value }))}
              placeholder="90 12 34 56"
              className={`${inputClasses} rounded-l-none`}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            autoComplete="name"
            value={donor.name}
            onChange={e => setDonor(d => ({ ...d, name: e.target.value }))}
            placeholder="Nom complet (optionnel)"
            className={inputClasses}
          />
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={donor.email}
            onChange={e => setDonor(d => ({ ...d, email: e.target.value }))}
            placeholder="E-mail (optionnel)"
            className={inputClasses}
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-3 animate-fade-in">{error}</p>}

      <button
        type="submit"
        disabled={loading || !donor.phone}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold py-3 rounded-xl shadow-sm
                   transition-all duration-200 ease-out hover:bg-emerald-700 hover:shadow-md hover:-translate-y-0.5
                   active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {loading ? 'Envoi de la demande...' : `Payer ${amount.toLocaleString('fr-FR')} XOF`}
      </button>

      <p className="text-xs text-gray-400 mt-4">
        Vous restez sur cette page : la demande de paiement arrive directement sur votre téléphone.{' '}
        <button type="button" onClick={payOnFedaPayPage} disabled={redirecting} className="underline hover:text-gray-600">
          {redirecting ? 'Redirection...' : 'Payer plutôt sur la page sécurisée FedaPay'}
        </button>
      </p>
    </form>
  );
}
