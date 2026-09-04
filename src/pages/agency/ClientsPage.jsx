import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Search, Plus, User, Phone, Mail, FileText, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function ClientsPage() {
  const { clients, addClient, isLoading, error: dataError } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);

  // Formulaire nouveau client
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [passport, setPassport] = useState('');
  const [notes, setNotes] = useState('');
  const [city, setCity] = useState('Dakar');
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.passport?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { role, isAdmin, isManager, isComptoir } = useAuth();
  const canCreateClient = isAdmin || isManager || isComptoir;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateClient = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Le nom du voyageur ou de l’agence est requis.');
      return;
    }
    if (!phone.trim()) {
      setError('Le numéro de téléphone WhatsApp est requis.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const created = await addClient({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        passport: passport.trim(),
        notes: notes.trim(),
        city
      });

      setName('');
      setPhone('');
      setEmail('');
      setPassport('');
      setNotes('');
      setIsNewClientOpen(false);
      showToast(`Client ${created?.name || name} enregistré avec succès !`);
    } catch (err) {
      setError(err.message || 'Erreur lors de l’enregistrement du client.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">

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
      
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-title text-slate-900">Annuaire des Clients</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Consultez, ajoutez et suivez l'historique complet de chaque voyageur et famille.
          </p>
          {isLoading && (
            <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-1 font-mono">
              <Loader2 className="w-2.5 h-2.5 animate-spin" />
              <span>Synchronisation Supabase...</span>
            </span>
          )}
        </div>

        {canCreateClient && (
          <button 
            onClick={() => setIsNewClientOpen(true)}
            className="fluent-btn px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0b5751] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Ajouter un Client</span>
          </button>
        )}
      </div>

      {/* Barre de recherche et statistiques */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, passeport..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="text-xs font-mono font-semibold text-slate-500">
          Total : <strong className="text-slate-900">{filtered.length}</strong> client{filtered.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Liste des Clients en Cartes Interactives */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <User className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-800 mb-1">
            Aucun client trouvé
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {searchTerm 
              ? `Aucun contact ne correspond à "${searchTerm}".`
              : "Vous n'avez pas encore de client enregistré."}
          </p>
          <button
            onClick={() => setIsNewClientOpen(true)}
            className="fluent-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F766E] text-white text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Enregistrer le premier client</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((cli) => (
            <div key={cli.id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-teal-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded">
                    {cli.id}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {cli.tripsCount || 0} voyage{(cli.tripsCount || 0) > 1 ? 's' : ''}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">
                  {cli.name}
                </h3>

                <div className="space-y-1 text-xs text-slate-500 mb-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{cli.phone || 'Non renseigné'}</span>
                  </div>
                  {cli.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{cli.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-[11px]">Passeport : {cli.passport || 'Non renseigné'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Dernier voyage : <strong className="text-slate-600">{cli.lastTrip || 'Nouveau client'}</strong>
                </span>
                <Link
                  to={`/app/clients/${cli.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0F766E] hover:underline"
                >
                  <span>Fiche client</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= MODAL AJOUT NOUVEAU CLIENT ================= */}
      {isNewClientOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 relative">
            <button 
              onClick={() => setIsNewClientOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
            <h3 className="font-bold text-lg text-slate-900 mb-1">Nouveau Client Voyageur</h3>
            <p className="text-xs text-slate-500 mb-5">
              Enregistrez les coordonnées du passager ou de la famille pour faciliter les réservations.
            </p>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom complet ou Titre du groupe *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Famille Ba, Cheikh Tidiane Sall..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Téléphone WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+221 77 000 00 00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="contact@client.sn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Numéro de passeport</label>
                  <input
                    type="text"
                    placeholder="Ex: SN-0982410"
                    value={passport}
                    onChange={(e) => setPassport(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ville de résidence</label>
                  <input
                    type="text"
                    placeholder="Dakar, Abidjan..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes internes (préférences, visas...)</label>
                <textarea
                  rows="2"
                  placeholder="Informations utiles pour les agents..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewClientOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="fluent-btn px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0b5751] text-white font-bold shadow-sm"
                >
                  Enregistrer le Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
