import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-title text-slate-900">Mot de passe oublié</h2>
        <p className="text-xs text-slate-500 mt-1">
          Recevez un lien sécurisé pour réinitialiser votre accès.
        </p>
      </div>

      {sent ? (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs leading-relaxed">
          <p className="font-bold mb-1">Email de réinitialisation envoyé !</p>
          Si un compte correspond à <strong>{email}</strong>, un lien sécurisé vous a été transmis.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email professionnel</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              placeholder="agent@votre-agence.com"
            />
          </div>

          <button
            type="submit"
            className="fluent-btn w-full py-3 rounded-xl bg-[#0F766E] hover:bg-[#0b5751] text-white font-bold text-sm shadow-md shadow-teal-900/10 cursor-pointer"
          >
            Envoyer le lien
          </button>
        </form>
      )}

      <div className="mt-6 pt-6 border-t border-slate-100 text-center">
        <Link to="/login" className="text-xs text-[#0F766E] font-bold hover:underline">
          ← Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
