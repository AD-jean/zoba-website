import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Youtube, Instagram, Heart } from 'lucide-react';
import { useState } from 'react';
import { subscribersApi } from '../lib/api';
import { TikTokIcon, WhatsAppIcon } from './icons/BrandIcons';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await subscribersApi.subscribe(email);
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <footer className="bg-teal-900 text-teal-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src="/android-chrome-192x192.png" alt="Logo ZOBA" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <div className="text-white font-bold text-sm font-display">ZONE BAPTISTE</div>
                <div className="text-teal-400 text-xs tracking-widest font-semibold">AGAPÉ — ZOBA</div>
              </div>
            </div>
            <p className="text-sm text-teal-300 leading-relaxed mb-5">
              Fraternité, Foi et Service au sein de la Convention Baptiste du Togo. Ensemble pour la gloire de Dieu.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 rounded-lg bg-teal-700 flex items-center justify-center transition-all duration-200 hover:bg-teal-600 hover:-translate-y-0.5 active:scale-95"
              >
                <Facebook size={16} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 rounded-lg bg-teal-700 flex items-center justify-center transition-all duration-200 hover:bg-teal-600 hover:-translate-y-0.5 active:scale-95"
              >
                <Instagram size={16} />
              </a>
              <a
                href="#"
                aria-label="TikTok"
                className="w-9 h-9 rounded-lg bg-teal-700 flex items-center justify-center transition-all duration-200 hover:bg-teal-600 hover:-translate-y-0.5 active:scale-95"
              >
                <TikTokIcon size={16} />
              </a>
              <a
                href="#"
                aria-label="Youtube"
                className="w-9 h-9 rounded-lg bg-teal-700 flex items-center justify-center transition-all duration-200 hover:bg-teal-600 hover:-translate-y-0.5 active:scale-95"
              >
                <Youtube size={16} />
              </a>
              <a
                href="#"
                aria-label="WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-teal-700 flex items-center justify-center transition-all duration-200 hover:bg-teal-600 hover:-translate-y-0.5 active:scale-95"
              >
                <WhatsAppIcon size={16} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              {[
                ['Accueil', '/'],
                ['À propos', '/a-propos'],
                ['Départements', '/departements'],
                ['Activités', '/activites'],
                ['Actualités', '/actualites'],
                ['Galerie', '/galerie'],
                ['Contact', '/contact'],
                ['Faire un don', '/dons'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="text-teal-300 hover:text-white transition-all duration-200 inline-block hover:translate-x-0.5">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Informations</h4>
            <ul className="space-y-3 text-sm text-teal-300">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 flex-shrink-0 text-teal-400" />
                Lomé, Togo — Zone Baptiste Agapé
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="flex-shrink-0 text-teal-400" />
                +228 XX XX XX XX
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="flex-shrink-0 text-teal-400" />
                contact@zoba-cbt.org
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-4">Newsletter</h4>
            <p className="text-sm text-teal-300 mb-4">
              Restez informé de nos activités et annonces.
            </p>
            {status === 'success' ? (
              <p className="text-teal-300 text-sm flex items-center gap-2 animate-scale-in">
                <Heart size={14} className="text-teal-400" />
                Merci pour votre inscription !
              </p>
            ) : (
              <form onSubmit={subscribe} className="space-y-2">
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Votre adresse e-mail"
                  required
                  className="w-full px-3 py-2.5 rounded-lg bg-teal-800 text-white placeholder-teal-400 border border-teal-700 transition-all duration-200 focus:outline-none focus:border-teal-400 text-sm"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-teal-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm
                             transition-all duration-200 ease-out hover:bg-teal-400 hover:shadow-md hover:-translate-y-0.5
                             active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {status === 'loading' ? 'Inscription...' : "S'inscrire"}
                </button>
                {status === 'error' && (
                  <p className="text-red-400 text-xs animate-fade-in">Une erreur est survenue. Réessayez.</p>
                )}
              </form>
            )}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-teal-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-teal-500">
          <p>© {new Date().getFullYear()} Zone Baptiste Agapé — ZOBA. Tous droits réservés.</p>
          <Link to="/admin" className="hover:text-teal-300 transition-colors">
            Espace Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
