import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, CheckCircle, X, ArrowLeft, Ticket as TicketIcon } from 'lucide-react';
import { activitiesApi, registrationsApi } from '../lib/api';
import { formatDate } from '../lib/format';
import Reveal from '../components/Reveal';
import TiltCard from '../components/TiltCard';
import TicketStripePanel from './activities/TicketStripePanel';
import TicketFedaPayPanel from './activities/TicketFedaPayPanel';
import type { Activity, Department } from '../types/database';

const DEPARTMENTS: Department[] = ['Tous', 'Hommes', 'Femmes', 'Jeunesse', 'Enfants'];

const deptColors: Record<string, string> = {
  Tous: 'bg-teal-100 text-teal-700',
  Hommes: 'bg-blue-100 text-blue-700',
  Femmes: 'bg-rose-100 text-rose-700',
  Jeunesse: 'bg-amber-100 text-amber-700',
  Enfants: 'bg-green-100 text-green-700',
};

function RegistrationModal({ activity, onClose }: { activity: Activity; onClose: () => void }) {
  const isPaid = activity.price > 0;
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [ticketCode, setTicketCode] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);

  const requestClose = () => {
    setClosing(true);
    setTimeout(onClose, 200);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isPaid) {
      setStep('payment');
      return;
    }

    setStatus('loading');
    try {
      const res = await registrationsApi.register({ activityId: activity._id, ...form });
      setTicketCode(res.ticketCode);
      setStep('success');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Une erreur est survenue. Veuillez réessayer.');
      setStatus('error');
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${closing ? 'opacity-0' : 'animate-fade-in'}`}
      onClick={requestClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-md ${closing ? 'animate-scale-out' : 'animate-scale-in'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b">
          <div>
            <h3 className="font-bold text-teal-800 text-lg">
              {step === 'payment' ? 'Paiement du billet' : "S'inscrire à l'activité"}
            </h3>
            <p className="text-gray-500 text-sm mt-0.5">
              {activity.title}
              {isPaid && <span className="ml-2 font-semibold text-teal-700">{activity.price.toLocaleString('fr-FR')} XOF</span>}
            </p>
          </div>
          <button onClick={requestClose} className="text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all duration-200">
            <X size={20} />
          </button>
        </div>

        {step === 'success' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-teal-600" />
            </div>
            <h4 className="font-bold text-teal-800 text-lg mb-2">Inscription confirmée !</h4>
            <p className="text-gray-500 text-sm mb-6">Votre billet vient de vous être envoyé par e-mail.</p>
            {ticketCode && (
              <Link
                to={`/billet/${ticketCode}`}
                className="btn-outline w-full justify-center mb-3"
                onClick={requestClose}
              >
                <TicketIcon size={16} /> Voir mon billet
              </Link>
            )}
            <button onClick={requestClose} className="btn-primary w-full justify-center">Fermer</button>
          </div>
        )}

        {step === 'payment' && (
          <div className="p-6 space-y-4">
            <button
              onClick={() => setStep('form')}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-700 transition-colors"
            >
              <ArrowLeft size={14} /> Modifier mes informations
            </button>
            <TicketStripePanel activityId={activity._id} name={form.name} email={form.email} phone={form.phone} />
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <div className="flex-1 h-px bg-gray-200" /> OU <div className="flex-1 h-px bg-gray-200" />
            </div>
            <TicketFedaPayPanel activityId={activity._id} name={form.name} email={form.email} phone={form.phone} />
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={submit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
              <input
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Votre nom et prénom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse e-mail *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                required={isPaid}
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="+228 XX XX XX XX"
              />
            </div>
            {status === 'error' && (
              <p className="text-red-500 text-sm animate-fade-in">{errorMessage}</p>
            )}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-primary w-full justify-center"
            >
              {status === 'loading' ? 'Inscription en cours...' : isPaid ? 'Continuer vers le paiement' : "Confirmer l'inscription"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<Department>('Tous');
  const [selected, setSelected] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    activitiesApi.getAll(filter === 'Tous' ? undefined : { department: filter })
      .then((data: Activity[]) => { setActivities(data); setLoading(false); });
  }, [filter]);

  return (
    <>
      {selected && <RegistrationModal activity={selected} onClose={() => setSelected(null)} />}

      <section className="relative pt-32 pb-20 bg-teal-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-teal-300 mb-4">Agenda</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-display mb-4">Nos activités</h1>
          <p className="text-teal-200 text-lg max-w-xl">
            Retrouvez tous nos événements à venir et inscrivez-vous en ligne.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-12">
            {DEPARTMENTS.map(d => (
              <button
                key={d}
                onClick={() => setFilter(d)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 ${
                  filter === d
                    ? 'bg-teal-600 text-white shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-72" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <Calendar size={40} className="mx-auto mb-4 opacity-40" />
              <p>Aucune activité trouvée pour ce filtre.</p>
            </div>
          ) : (
            <Reveal className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map(activity => (
                <TiltCard key={activity._id} className="card group flex flex-col">
                  <div className="relative h-52 overflow-hidden bg-teal-50 tilt-layer">
                    {activity.image ? (
                      <img
                        src={activity.image}
                        alt={activity.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Calendar size={36} className="text-teal-300" />
                      </div>
                    )}
                    <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${deptColors[activity.department]}`}>
                      {activity.department}
                    </span>
                    <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90 text-gray-600">
                      {activity.organizer}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-teal-800 text-lg mb-2 leading-snug">{activity.title}</h3>
                    {activity.description && (
                      <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">{activity.description}</p>
                    )}
                    <div className="space-y-1.5 mb-5">
                      {activity.date && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar size={12} className="text-teal-500" />
                          {formatDate(activity.date)}
                        </div>
                      )}
                      {activity.location && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MapPin size={12} className="text-teal-500" />
                          {activity.location}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setSelected(activity)}
                      className="btn-primary w-full justify-center text-sm"
                    >
                      S'inscrire
                    </button>
                  </div>
                </TiltCard>
              ))}
            </Reveal>
          )}
        </div>
      </section>
    </>
  );
}
