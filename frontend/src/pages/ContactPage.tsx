import { useState } from 'react';
import { MapPin, Phone, Mail, CheckCircle } from 'lucide-react';
import { contactsApi } from '../lib/api';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await contactsApi.submit(form);
      setStatus('success');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <section className="relative pt-32 pb-20 bg-teal-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-teal-300 mb-4">Nos contacts</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-display mb-4">Contactez-nous</h1>
          <p className="text-teal-200 text-lg max-w-xl">
            Nous sommes à votre disposition pour toute question ou demande.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-teal-800 mb-2">Informations</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  N'hésitez pas à nous contacter pour toute information concernant nos activités, nos départements ou pour rejoindre la zone.
                </p>
              </div>

              <div className="space-y-5">
                <div className="group flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5">
                    <MapPin size={18} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-teal-800 text-sm">Adresse</p>
                    <p className="text-gray-600 text-sm">Lomé, Togo — Zone Baptiste Agapé</p>
                  </div>
                </div>

                <div className="group flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:rotate-6">
                    <Phone size={18} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-teal-800 text-sm">Téléphone</p>
                    <p className="text-gray-600 text-sm">+228 XX XX XX XX</p>
                  </div>
                </div>

                <div className="group flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">
                    <Mail size={18} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-teal-800 text-sm">Email</p>
                    <p className="text-gray-600 text-sm">contact@zoba-cbt.org</p>
                  </div>
                </div>
              </div>

              <div className="bg-teal-50 rounded-xl p-5 border border-teal-100">
                <h3 className="font-semibold text-teal-800 mb-2 text-sm">Horaires de bureau</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Lundi – Vendredi</span>
                    <span className="font-medium">08h00 – 17h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Samedi</span>
                    <span className="font-medium">09h00 – 13h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dimanche</span>
                    <span className="text-teal-500 font-medium">Culte</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-scale-in">
                  <CheckCircle size={48} className="text-teal-500 mb-4" />
                  <h3 className="text-xl font-bold text-teal-800 mb-2">Message envoyé !</h3>
                  <p className="text-gray-500 mb-6">Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais.</p>
                  <button onClick={() => setStatus('idle')} className="btn-primary">
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-5 bg-gray-50 rounded-2xl p-8">
                  <h2 className="text-xl font-bold text-teal-800 mb-6">Envoyez-nous un message</h2>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet *</label>
                      <input
                        required
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                        placeholder="Votre nom et prénom"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                      <input
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                        placeholder="+228 XX XX XX XX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse e-mail *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                      placeholder="votre@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
                    <textarea
                      required
                      rows={6}
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white resize-none"
                      placeholder="Décrivez votre demande ou question..."
                    />
                  </div>

                  {status === 'error' && (
                    <p className="text-red-500 text-sm animate-fade-in">Une erreur est survenue. Veuillez réessayer.</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="btn-primary w-full justify-center"
                  >
                    {status === 'loading' ? 'Envoi en cours...' : 'Envoyer le message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
