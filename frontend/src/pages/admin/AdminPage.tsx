import { useEffect, useState } from 'react';
import { authApi } from '../../lib/api';
import type { AdminUser } from '../../lib/api';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export default function AdminPage() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      setLoading(false);
      return;
    }
    authApi.verify()
      .then(({ valid, admin }) => setAdmin(valid && admin ? admin : null))
      .catch(() => setAdmin(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-teal-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-400 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return admin ? <AdminDashboard admin={admin} onLogout={logout} /> : <AdminLogin onLogin={setAdmin} />;
}
