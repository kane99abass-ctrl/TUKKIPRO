import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { supabase } from '../../lib/supabase.js';
import { Settings, CheckCircle2, Save, Shield, AlertCircle, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { agency, setAgency, isAdmin, role } = useAuth();
  const [name, setName] = useState(agency?.name || 'Teranga Voyages Dakar');
  const [currency, setCurrency] = useState(agency?.currency || 'FCFA');
  const [country, setCountry] = useState(agency?.country || 'Sénégal');
  const [city, setCity] = useState(agency?.city || 'Dakar');
  const [phoneWhatsApp, setPhoneWhatsApp] = useState(agency?.phoneWhatsApp || '+221 77 123 45 67');
  const [email, setEmail] = useState(agency?.email || 'contact@terangavoyages.sn');
  const [ninea, setNinea] = useState('007894562 2V3');
  const [rccm, setRccm] = useState('SN-DKR-2022-B-14890');
  const [iata, setIata] = useState('Agrément AV-2022/41 • Code IATA 74-2 1980 4');
  const [address, setAddress] = useState('32, Avenue Léopold Sédar Senghor, Dakar Plateau');
  const [logoPreview, setLogoPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result);
        showToast("Nouveau logo chargé ! N'oubliez pas d'enregistrer.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setErrorMsg('Seul un Administrateur peut modifier les paramètres de l’agence.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      if (agency?.id) {
        const { error } = await supabase
          .from('agencies')
          .update({
            name,
            currency,
            country,
            city,
            phone_whatsapp: phoneWhatsApp,
            updated_at: new Date().toISOString()
          })
          .eq('id', agency.id);

        if (error) throw error;
      }

      setAgency(prev => ({ ...prev, name, currency, country, city, phoneWhatsApp }));
      showToast("Paramètres, logo et identité légale enregistrés avec succès !");
    } catch (err) {
      setErrorMsg(err.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 pb-12">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-white/10 text-xs flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            ✕
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-title text-slate-900">Paramètres de l'Agence</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Informations légales, devise principale et coordonnées de votre agence.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5 text-[#0F766E]" />
          <span>Rôle : {role}</span>
        </div>
      </div>

      {!isAdmin && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            Votre rôle actuel (<strong>{role}</strong>) vous permet de consulter les paramètres en lecture seule. Seul un <strong>Administrateur</strong> peut enregistrer des modifications.
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        
        {/* LOGO DE L'AGENCE */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
            <span>🖼</span> Logo Officiel de l'Agence
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#0F766E] to-emerald-600 flex items-center justify-center text-white font-bold text-2xl shadow-md overflow-hidden shrink-0 border-2 border-white">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                name.charAt(0) || 'T'
              )}
            </div>
            <div className="space-y-1.5 text-xs">
              <p className="font-semibold text-slate-800">Logo pour billets d'avion, devis et reçus certifiés</p>
              <p className="text-[11px] text-slate-500">Formats PNG transparent ou JPG haute définition (Max 5 Mo).</p>
              <div className="flex items-center gap-2 pt-1">
                <label className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-xs">
                  Choisir un fichier
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                </label>
                {logoPreview && (
                  <button type="button" onClick={() => setLogoPreview(null)} className="text-xs text-rose-600 hover:underline">
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* INFORMATIONS LÉGALES & ENREGISTREMENT */}
        <form onSubmit={handleSave} className="space-y-5 text-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span>🏛</span> Informations Légales & Fiscale
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Raison Sociale / Nom commercial *</label>
                <input
                  type="text"
                  required
                  disabled={!isAdmin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Numéro NINEA (Identification Fiscale) *</label>
                <input
                  type="text"
                  required
                  disabled={!isAdmin}
                  value={ninea}
                  onChange={(e) => setNinea(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono font-bold disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Registre de Commerce (RCCM) *</label>
                <input
                  type="text"
                  required
                  disabled={!isAdmin}
                  value={rccm}
                  onChange={(e) => setRccm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono font-bold disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Licence d'Exploitation & Code IATA</label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={iata}
                  onChange={(e) => setIata(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* CONTACTS & COORDONNÉES */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span>📞</span> Coordonnées & Contacts Officiels
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Officiel de l'Agence *</label>
                <input
                  type="email"
                  required
                  disabled={!isAdmin}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Numéro WhatsApp / Téléphone Mobile *</label>
                <input
                  type="text"
                  required
                  disabled={!isAdmin}
                  value={phoneWhatsApp}
                  onChange={(e) => setPhoneWhatsApp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pays du siège</label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ville</label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Adresse Physique du Siège</label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Devise légale verrouillée (FCFA)</label>
                <input
                  type="text"
                  readOnly
                  value="FCFA (XOF) — Franc CFA BCEAO"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="fluent-btn px-6 py-3 rounded-xl bg-[#0F766E] hover:bg-[#0b5751] text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Enregistrer les paramètres de l'entreprise</span>
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>

    </div>
  );
}
