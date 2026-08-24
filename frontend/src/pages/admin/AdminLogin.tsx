import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../lib/api';
import type { AdminUser } from '../../lib/api';

export default function AdminLogin({ onLogin }: { onLogin: (admin: AdminUser) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token, admin } = await authApi.login(email, password);
      localStorage.setItem('adminToken', token);
      onLogin(admin);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 to-teal-700 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/android-chrome-192x192.png" alt="Logo ZOBA" className="w-16 h-16 rounded-full mx-auto mb-4 shadow-lg object-cover" />
          <h1 className="text-2xl font-bold text-white font-display">Espace Admin</h1>
          <p className="text-teal-300 text-sm mt-1">Zone Baptiste Agapé — ZOBA</p>
        </div>

        <form onSubmit={login} className="bg-white rounded-2xl shadow-2xl p-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse e-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="admin@zoba-cbt.org"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-10 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-200 active:scale-90"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2 animate-fade-in">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
