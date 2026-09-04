import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { AlertCircle, CheckCircle2, Loader2, Shield } from 'lucide-react';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get('token');

  const { registerAgency, acceptInvitation } = useAuth();
  const navigate = useNavigate();

  const [agencyName, setAgencyName] = useState('');
  const [country, setCountry] = useState('Sénégal');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (invitationToken) {
        // Inscription via invitation collaborateur
        const res = await acceptInvitation({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          invitationToken
        });

        if (!res.success) {
          setErrorMsg(res.error || "Impossible d'activer l'invitation. Vérifiez le lien ou l'email.");
          setLoading(false);
          return;
        }
      } else {
        // Inscription d'une nouvelle agence indépendante
        const res = await registerAgency({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          agencyName: agencyName.trim(),
          phone: phone.trim(),
          country
        });

        if (!res.success) {
          setErrorMsg(res.error || "Erreur lors de la création de l'agence.");
          setLoading(false);
          return;
        }
      }

      navigate('/app');
    } catch (err) {
      setErrorMsg(err.message || 'Une erreur inattendue est survenue.');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          {invitationToken ? (
            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-[#0F766E] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Invitation Collaborateur</span>
            </span>
          ) : (
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">
              Nouvelle Agence
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold font-title text-slate-900">
          {invitationToken ? 'Activer votre accès agent' : 'Créer votre agence de voyages'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {invitationToken
            ? 'Renseignez votre mot de passe pour intégrer l’espace de travail de votre agence.'
            : '14 jours d’essai complet. Aucune carte bancaire requise.'}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        
        {/* Champs spécifiques à la création d'agence */}
        {!invitationToken && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nom de l'agence *</label>
              <input
                type="text"
                required
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                placeholder="Ex: Sahel Horizon Voyages"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pays du siège</label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-mono"
                  placeholder="+221 77 000 00 00"
                />
              </div>
            </div>
          </>
        )}

        {/* Coordonnées personnelles de l'agent */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Prénom & Nom du titulaire *</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            placeholder="Ex: Amadou Diallo"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Email professionnel *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            placeholder="amadou@votre-agence.com"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Mot de passe sécurisé *</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-mono"
            placeholder="••••••••••••"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">Au moins 6 caractères</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="fluent-btn w-full py-3 rounded-xl bg-[#0F766E] hover:bg-[#0b5751] text-white font-bold text-sm shadow-md shadow-teal-900/10 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{invitationToken ? 'Activation en cours...' : 'Initialisation de l’agence...'}</span>
            </>
          ) : (
            <span>{invitationToken ? 'Rejoindre l’agence' : 'Créer mon agence'}</span>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          Vous possédez déjà des accès ?{' '}
          <Link to="/login" className="text-[#0F766E] font-bold hover:underline">
            Connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
