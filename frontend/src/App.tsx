import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import Home from './pages/Home';
import AboutPage from './pages/AboutPage';
import DepartmentsPage from './pages/DepartmentsPage';
import ActivitiesPage from './pages/ActivitiesPage';
import NewsPage from './pages/NewsPage';
import GalleryPage from './pages/GalleryPage';
import ContactPage from './pages/ContactPage';
import DonationsPage from './pages/DonationsPage';
import TicketPage from './pages/TicketPage';
import PrivacyPage from './pages/PrivacyPage';
import { usePageTracking } from './lib/analytics';
import { setAdminArea, useIsAdminRoute } from './lib/adminPath';

const AdminPage = lazy(() => import('./pages/admin/AdminPage'));

function AdminFallback() {
  return (
    <div className="min-h-screen bg-teal-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-teal-400 border-t-white rounded-full animate-spin" />
    </div>
  );
}

/** Remonte en haut à chaque changement de page, ou défile jusqu'à l'ancre (#cookies...). */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      // laisse le temps à la page cible de s'afficher avant de chercher l'ancre
      const timer = setTimeout(() => {
        document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: 'instant' });
      }, 50);
      return () => clearTimeout(timer);
    }
    // 'instant' : le CSS du site impose scroll-behavior: smooth, qui ferait défiler
    // toute la page à rebours à chaque changement de route.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return null;
}

function NotFoundPage() {
  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 pt-28 pb-16">
      <p className="text-6xl font-bold text-teal-700">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-gray-800">Page introuvable</h1>
      <p className="mt-2 text-gray-500">Cette page n'existe pas ou a été déplacée.</p>
      <Link to="/" className="mt-6 inline-block rounded-full bg-teal-700 px-6 py-2.5 text-white font-medium hover:bg-teal-800">
        Retour à l'accueil
      </Link>
    </section>
  );
}

function Layout() {
  const location = useLocation();
  const adminRoute = useIsAdminRoute(location.pathname);
  const isAdmin = adminRoute === true;
  setAdminArea(isAdmin);
  usePageTracking(adminRoute !== false);

  // Vérification de l'adresse en cours (quelques millisecondes, une seule fois par adresse).
  if (adminRoute === null) return null;

  if (isAdmin) {
    return (
      <main>
        <Suspense fallback={<AdminFallback />}>
          <AdminPage />
        </Suspense>
      </main>
    );
  }

  return (
    <>
      <ScrollManager />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/a-propos" element={<AboutPage />} />
          <Route path="/departements" element={<DepartmentsPage />} />
          <Route path="/activites" element={<ActivitiesPage />} />
          <Route path="/actualites" element={<NewsPage />} />
          <Route path="/galerie" element={<GalleryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/dons" element={<DonationsPage />} />
          <Route path="/dons/retour/:donationId" element={<DonationsPage />} />
          <Route path="/billet/:ticketCode" element={<TicketPage />} />
          <Route path="/confidentialite" element={<PrivacyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
