import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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

const AdminPage = lazy(() => import('./pages/admin/AdminPage'));

function AdminFallback() {
  return (
    <div className="min-h-screen bg-teal-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-teal-400 border-t-white rounded-full animate-spin" />
    </div>
  );
}

function Layout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Navbar />}
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
          <Route path="/billet/:ticketCode" element={<TicketPage />} />
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminPage />
              </Suspense>
            }
          />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <BackToTop />}
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
