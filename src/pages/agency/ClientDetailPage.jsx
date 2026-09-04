import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext.jsx';
import { ArrowLeft, User, Phone, Mail, FileText, Plus, CheckCircle2, ArrowRight, AlertCircle, Edit } from 'lucide-react';

export default function ClientDetailPage() {
  const { id } = useParams();
  const { clients, dossiers, updateClient } = useData();

  const client = clients.find(c => c.id === id);

  // Edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassport, setEditPassport] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openEditModal = () => {
    if (client) {
      setEditName(client.name);
      setEditPhone(client.phone || '');
      setEditEmail(client.email || '');
      setEditPassport(client.passport || '');
      setEditNotes(client.notes || '');
      setIsEditOpen(true);
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    updateClient(client.id, {
      name: editName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
      passport: editPassport.trim(),
      notes: editNotes.trim()
    });

    setIsEditOpen(false);
    showToast('Coordonnées client mises à jour !');
  };

  if (!client) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Client introuvable</h2>
        <p className="text-xs text-slate-500">
          La référence client <strong>{id}</strong> n'existe pas dans l'annuaire de l'agence.
        </p>
        <Link
          to="/app/clients"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F766E] text-white text-xs font-bold shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l'annuaire des clients</span>
        </Link>
      </div>
    );
  }

  // Dossiers associés
  const clientDossiers = dossiers.filter(d => 
    d.clientId === client.id || 
    d.client.toLowerCase().includes(client.name.toLowerCase()) ||
    client.name.toLowerCase().includes(d.client.toLowerCase())
  );

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

      {/* Fil d'ariane & Bouton retour */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/app/clients" className="hover:text-[#0F766E] flex items-center gap-1 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour aux clients</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-700">Fiche Client {client.name}</span>
      </div>

      {/* Fiche Client Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-[#0F766E] font-bold bg-teal-50 px-2 py-0.5 rounded">
                CLIENT #{client.id}
              </span>
              <span className="text-xs text-slate-400">
                {client.city || 'Dakar'} ({client.country || 'Sénégal'})
              </span>
            </div>
            <h1 className="text-2xl font-bold font-title text-slate-900">
              {client.name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Enregistré le {client.registeredDate || '12 Janvier 2025'} • {clientDossiers.length} dossier{clientDossiers.length > 1 ? 's' : ''} de voyage
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button 
              onClick={openEditModal}
              className="fluent-btn px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 text-slate-500" />
              <span>Modifier les coordonnées</span>
            </button>

            <Link
              to="/app/dossiers/new"
              className="fluent-btn px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0b5751] text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau Dossier</span>
            </Link>
          </div>
        </div>

        {/* Détails coordonnées */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Téléphone & WhatsApp</span>
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm font-mono">
              <Phone className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>{client.phone || 'Non renseigné'}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Email professionnel / personnel</span>
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <Mail className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>{client.email || 'Non renseigné'}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Passeport principal</span>
            <div className="flex items-center gap-2 font-mono font-bold text-slate-800 text-sm">
              <FileText className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>{client.passport || 'En attente de scan'}</span>
            </div>
          </div>
        </div>

        {/* Notes internes */}
        {client.notes && (
          <div className="py-4 border-b border-slate-100 text-xs">
            <span className="font-semibold text-slate-700 block mb-1">Notes internes agence :</span>
            <p className="text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
              {client.notes}
            </p>
          </div>
        )}

        {/* Historique des dossiers de voyage du client */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">
              Dossiers de voyage associés ({clientDossiers.length})
            </h2>
            <Link
              to="/app/dossiers/new"
              className="text-xs text-[#0F766E] font-bold hover:underline"
            >
              + Ouvrir un dossier pour ce client
            </Link>
          </div>

          {clientDossiers.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-400 mb-3">Aucun dossier n'a encore été créé pour ce client.</p>
              <Link
                to="/app/dossiers/new"
                className="fluent-btn inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[#0F766E] text-white text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Créer le premier voyage</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {clientDossiers.map(d => (
                <div key={d.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0F766E]">{d.id}</span>
                      <span className="font-bold text-slate-900 text-xs">{d.route}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${d.badge}`}>
                        {d.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {d.dates} • {d.pax} passager{d.pax > 1 ? 's' : ''} • {d.airline} • Montant : <strong className="text-slate-700">{d.amount}</strong>
                    </p>
                  </div>

                  <Link 
                    to={`/app/dossiers/${d.id}`} 
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0F766E] hover:underline shrink-0"
                  >
                    <span>Consulter le dossier</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Modal Modification Client */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 relative">
            <button 
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
            <h3 className="font-bold text-base text-slate-900 mb-1">Modifier le Client</h3>
            <p className="text-xs text-slate-500 mb-4">
              Mettez à jour les informations de contact de {client.name}.
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom complet *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Téléphone WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Passeport</label>
                <input
                  type="text"
                  value={editPassport}
                  onChange={(e) => setEditPassport(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows="2"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="fluent-btn px-4 py-2 rounded-xl bg-[#0F766E] text-white font-bold"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
