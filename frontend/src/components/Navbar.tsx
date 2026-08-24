import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Accueil', href: '/' },
  { label: 'À propos', href: '/a-propos' },
  { label: 'Départements', href: '/departements' },
  { label: 'Activités', href: '/activites' },
  { label: 'Actualités', href: '/actualites' },
  { label: 'Galerie', href: '/galerie' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  const solid = !isHome || scrolled;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        solid ? 'bg-teal-800 shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/android-chrome-192x192.png"
              alt="Logo ZOBA"
              className="w-9 h-9 rounded-full flex-shrink-0 shadow object-cover transition-transform duration-200 group-hover:scale-105"
            />
            <div className="hidden sm:block">
              <div className="text-white font-bold text-sm leading-none font-display">ZONE BAPTISTE</div>
              <div className="text-teal-300 font-semibold text-xs tracking-widest">AGAPÉ — ZOBA</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ label, href }) => {
              const active = location.pathname === href;
              return (
                <Link
                  key={href}
                  to={href}
                  className={`group relative px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                    active
                      ? 'bg-white/20 text-white'
                      : 'text-teal-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {label}
                  <span
                    className={`absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-white origin-left transition-transform duration-200 ${
                      active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/dons"
              className="hidden sm:inline-flex items-center gap-2 bg-white text-teal-700 px-4 py-2 rounded-lg text-sm font-bold
                         transition-all duration-200 ease-out shadow-sm
                         hover:bg-teal-50 hover:shadow-md hover:-translate-y-0.5
                         active:translate-y-0 active:scale-[0.98]"
            >
              Faire un don
            </Link>
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 rounded-md text-teal-100 hover:bg-white/10 hover:text-white transition-all duration-200 active:scale-90"
              aria-label="Menu"
              aria-expanded={open}
            >
              <span className="block transition-transform duration-200" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                {open ? <X size={22} /> : <Menu size={22} />}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden bg-teal-900 border-t transition-all duration-300 ease-out ${
          open ? 'max-h-[500px] opacity-100 border-teal-700' : 'max-h-0 opacity-0 border-transparent'
        }`}
      >
        <div className="px-4 py-4 space-y-1">
          {NAV_LINKS.map(({ label, href }, i) => (
            <Link
              key={href}
              to={href}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === href
                  ? 'bg-white/20 text-white'
                  : 'text-teal-100 hover:bg-white/10 hover:text-white hover:translate-x-1'
              } ${open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}
              style={{ transitionDelay: open ? `${i * 30}ms` : '0ms' }}
            >
              {label}
            </Link>
          ))}
          <Link
            to="/dons"
            className={`block mt-2 text-center bg-white text-teal-700 px-4 py-2.5 rounded-lg text-sm font-bold
                       transition-all duration-200 active:scale-[0.98] ${
              open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
            }`}
            style={{ transitionDelay: open ? `${NAV_LINKS.length * 30}ms` : '0ms' }}
          >
            Faire un don
          </Link>
        </div>
      </div>
    </header>
  );
}
