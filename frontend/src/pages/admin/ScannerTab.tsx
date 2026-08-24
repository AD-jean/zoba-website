import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { registrationsApi } from '../../lib/api';

type Feedback = { kind: 'success' | 'repeat' | 'error'; message: string } | null;

const extractTicketCode = (decodedText: string): string => {
  try {
    const url = new URL(decodedText);
    const parts = url.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || decodedText;
  } catch {
    return decodedText;
  }
};

export default function ScannerTab() {
  const [feedback, setFeedback] = useState<Feedback>(null);
  const processingRef = useRef(false);
  const lastCodeRef = useRef<string | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-scanner-region', { fps: 10, qrbox: 250 }, false);

    const onScanSuccess = async (decodedText: string) => {
      if (processingRef.current || decodedText === lastCodeRef.current) return;
      processingRef.current = true;
      lastCodeRef.current = decodedText;

      const ticketCode = extractTicketCode(decodedText);
      try {
        const result = await registrationsApi.checkIn(ticketCode);
        setFeedback(
          result.alreadyCheckedIn
            ? { kind: 'repeat', message: `${result.name} — déjà scanné à ${new Date(result.checkedInAt).toLocaleTimeString('fr-FR')}` }
            : { kind: 'success', message: `Bienvenue ${result.name} !` }
        );
      } catch (err) {
        setFeedback({ kind: 'error', message: err instanceof Error ? err.message : 'Billet invalide' });
      }

      setTimeout(() => {
        processingRef.current = false;
        lastCodeRef.current = null;
      }, 2500);
    };

    scanner.render(onScanSuccess, () => {});

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  const feedbackStyles = {
    success: 'bg-teal-50 border-teal-200 text-teal-700',
    repeat: 'bg-amber-50 border-amber-200 text-amber-700',
    error: 'bg-red-50 border-red-200 text-red-700',
  };
  const feedbackIcons = {
    success: <CheckCircle size={20} />,
    repeat: <Clock size={20} />,
    error: <XCircle size={20} />,
  };

  return (
    <div className="space-y-6">
      <h2 className="font-bold text-teal-800 text-lg">Scanner les billets</h2>
      <p className="text-sm text-gray-500">Scannez le QR code d'un billet pour enregistrer la présence. Nécessite l'autorisation caméra du navigateur (HTTPS ou localhost).</p>

      {feedback && (
        <div className={`flex items-center gap-2 p-4 rounded-xl border font-medium animate-fade-in ${feedbackStyles[feedback.kind]}`}>
          {feedbackIcons[feedback.kind]} {feedback.message}
        </div>
      )}

      <div id="qr-scanner-region" className="max-w-md" />
    </div>
  );
}
