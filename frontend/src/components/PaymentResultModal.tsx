import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, XCircle, Loader2, Clock, X, Ban } from 'lucide-react';

export type PaymentOutcome = 'verifying' | 'success' | 'failed' | 'cancelled' | 'pending';

interface PaymentResultModalProps {
  outcome: PaymentOutcome;
  /** Titre et texte par défaut selon l'issue ; surchargeables. */
  title?: string;
  message?: ReactNode;
  /** Boutons supplémentaires (ex. "Voir mon billet"). */
  actions?: ReactNode;
  onClose: () => void;
  /** Action du bouton "Réessayer" (affiché en cas d'échec / annulation). */
  onRetry?: () => void;
}

const DEFAULTS: Record<PaymentOutcome, { title: string; message: string }> = {
  verifying: {
    title: 'Vérification du paiement…',
    message: 'Nous confirmons votre paiement auprès de la banque. Ne fermez pas cette page.',
  },
  success: {
    title: 'Paiement validé !',
    message: 'Merci ! Votre paiement a bien été reçu et confirmé.',
  },
  failed: {
    title: 'Paiement refusé',
    message: "Le paiement n'a pas abouti et aucun montant n'a été débité. Vous pouvez réessayer ou choisir un autre moyen de paiement.",
  },
  cancelled: {
    title: 'Paiement annulé',
    message: "Vous avez annulé le paiement. Aucun montant n'a été débité.",
  },
  pending: {
    title: 'Paiement en cours de traitement',
    message:
      "Votre paiement est toujours en attente de confirmation (cela peut prendre quelques minutes avec le Mobile Money). Vous recevrez un e-mail dès qu'il sera validé.",
  },
};

const STYLES: Record<PaymentOutcome, { ring: string; iconBg: string; icon: ReactNode }> = {
  verifying: { ring: 'border-teal-200', iconBg: 'bg-teal-50 text-teal-600', icon: <Loader2 size={34} className="animate-spin" /> },
  success: { ring: 'border-emerald-200', iconBg: 'bg-emerald-100 text-emerald-600', icon: <CheckCircle2 size={38} /> },
  failed: { ring: 'border-red-200', iconBg: 'bg-red-100 text-red-600', icon: <XCircle size={38} /> },
  cancelled: { ring: 'border-amber-200', iconBg: 'bg-amber-100 text-amber-600', icon: <Ban size={34} /> },
  pending: { ring: 'border-amber-200', iconBg: 'bg-amber-100 text-amber-600', icon: <Clock size={34} /> },
};

/**
 * Message plein écran affiché après un paiement (dons et billets) : vérification,
 * réussite, échec, annulation ou attente. Accessible (role="alertdialog", focus,
 * fermeture à Échap).
 */
export default function PaymentResultModal({ outcome, title, message, actions, onClose, onRetry }: PaymentResultModalProps) {
  const [closing, setClosing] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const canClose = outcome !== 'verifying';

  const close = () => {
    if (!canClose) return;
    setClosing(true);
    setTimeout(onClose, 200);
  };

  useEffect(() => {
    closeRef.current?.focus();
  }, [outcome]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canClose]);

  const style = STYLES[outcome];
  const text = DEFAULTS[outcome];

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${closing ? 'opacity-0' : 'animate-fade-in'}`}
      onClick={close}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-live="assertive"
        aria-labelledby="payment-result-title"
        aria-describedby="payment-result-message"
        className={`relative bg-white rounded-2xl shadow-2xl border-2 ${style.ring} w-full max-w-md p-8 text-center ${closing ? 'animate-scale-out' : 'animate-scale-in'}`}
        onClick={e => e.stopPropagation()}
      >
        {canClose && (
          <button
            onClick={close}
            aria-label="Fermer"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all duration-200"
          >
            <X size={20} />
          </button>
        )}

        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${style.iconBg}`}>
          {style.icon}
        </div>

        <h2 id="payment-result-title" className="text-xl font-bold text-gray-900 font-display mb-2">
          {title ?? text.title}
        </h2>
        <div id="payment-result-message" className="text-sm text-gray-600 leading-relaxed mb-6">
          {message ?? text.message}
        </div>

        {canClose && (
          <div className="space-y-3">
            {actions}
            {(outcome === 'failed' || outcome === 'cancelled') && onRetry && (
              <button
                onClick={() => {
                  onRetry();
                  close();
                }}
                className="btn-primary w-full justify-center"
              >
                Réessayer
              </button>
            )}
            <button
              ref={closeRef}
              onClick={close}
              className={`${outcome === 'success' || outcome === 'pending' ? 'btn-primary' : 'btn-outline'} w-full justify-center`}
            >
              {outcome === 'success' ? 'Continuer' : 'Fermer'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
