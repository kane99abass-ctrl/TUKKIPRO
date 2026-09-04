import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const res = await login(email.trim(), password);
    if (!res.success) {
      setErrorMsg(res.error || 'Identifiants invalides. Veuillez réessayer.');
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate('/app');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-title text-slate-900">Connexion Agence</h1>
        <p className="text-xs text-slate-500 mt-1">
          Accédez à vos dossiers de voyage et à votre tableau de bord.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Email professionnel
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            placeholder="agent@votre-agence.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Mot de passe
            </label>
            <Link to="/forgot-password" className="text-xs text-[#0F766E] hover:underline font-medium">
              Oublié ?
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-mono"
            placeholder="••••••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="fluent-btn w-full py-3 rounded-xl bg-[#0F766E] hover:bg-[#0b5751] text-white font-bold text-sm shadow-md shadow-teal-900/10 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Connexion en cours...</span>
            </>
          ) : (
            <span>Se connecter</span>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          Votre agence n'est pas encore inscrite ?{' '}
          <Link to="/register" className="text-[#0F766E] font-bold hover:underline">
            Créer un compte (14 jours d'essai)
          </Link>
        </p>
      </div>
    </div>
  );
}
