import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Calendar, MapPin } from 'lucide-react';
import { registrationsApi } from '../lib/api';
import { formatDate } from '../lib/format';
import type { Ticket } from '../types/database';

const STATUS_META: Record<Ticket['paymentStatus'], { label: string; color: string; icon: React.ReactNode }> = {
  not_required: { label: 'Billet valide', color: 'text-teal-700 bg-teal-50 border-teal-200', icon: <CheckCircle size={20} /> },
  paid: { label: 'Billet valide (payé)', color: 'text-teal-700 bg-teal-50 border-teal-200', icon: <CheckCircle size={20} /> },
  pending: { label: 'Paiement en attente', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: <Clock size={20} /> },
  failed: { label: 'Paiement échoué', color: 'text-red-700 bg-red-50 border-red-200', icon: <XCircle size={20} /> },
};

export default function TicketPage() {
  const { ticketCode } = useParams<{ ticketCode: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!ticketCode) return;
    registrationsApi
      .getTicket(ticketCode)
      .then(setTicket)
      .catch(() => setNotFound(true));
  }, [ticketCode]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <XCircle size={40} className="text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-800 mb-2">Billet introuvable</h1>
          <p className="text-gray-500 mb-6">Ce lien de billet n'est pas valide.</p>
          <Link to="/" className="btn-primary">Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const meta = STATUS_META[ticket.paymentStatus];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 max-w-md w-full p-8 text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold mb-6 ${meta.color}`}>
          {meta.icon} {meta.label}
        </div>

        <h1 className="text-xl font-bold text-teal-800 mb-1">{ticket.activityTitle}</h1>
        <p className="text-gray-500 text-sm mb-6">Billet de {ticket.name}</p>

        <div className="space-y-2 text-sm text-left bg-gray-50 rounded-xl p-4 mb-6">
          {ticket.activityDate && (
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={14} className="text-teal-500" /> {formatDate(ticket.activityDate)}
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={14} className="text-teal-500" /> {ticket.activityLocation}
          </div>
        </div>

        {ticket.checkedIn && (
          <p className="text-sm text-teal-700 bg-teal-50 border border-teal-200 rounded-xl p-3 mb-4">
            Présence enregistrée{ticket.checkedInAt ? ` — ${new Date(ticket.checkedInAt).toLocaleString('fr-FR')}` : ''}
          </p>
        )}

        <Link to="/activites" className="btn-outline w-full justify-center">Voir toutes les activités</Link>
      </div>
    </div>
  );
}
