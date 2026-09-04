import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { 
  ArrowLeft, FileText, ShieldCheck, CreditCard, Clock, Users, Plane, 
  Plus, Check, CheckCircle2, AlertCircle, X, Download, MessageSquare, Send, Loader2
} from 'lucide-react';

export default function TravelFileDetailPage() {
  const { id } = useParams();
  const { canManageFinance, canIssueTickets, role, isAdmin } = useAuth();
  const { 
    dossiers, 
    updateDossierStatus, 
    addDocument, 
    addPayment, 
    addVisa, 
    addPassengerToDossier,
    formatMoney,
    isLoading 
  } = useData();

  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'passengers' | 'documents' | 'visas' | 'payments' | 'history'

  // Modales d'actions
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Passeport');

  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Virement Bancaire');

  const [isAddPaxOpen, setIsAddPaxOpen] = useState(false);
  const [paxName, setPaxName] = useState('');
  const [paxPassport, setPaxPassport] = useState('');
  const [paxRole, setPaxRole] = useState('Passager');

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Récupération du dossier correspondant à l'ID
  const dossier = dossiers.find(d => d.id === id);

  if (!dossier) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Dossier introuvable</h2>
        <p className="text-xs text-slate-500">
          Le dossier avec la référence <strong>{id}</strong> n'existe pas ou a été archivé.
        </p>
        <Link
          to="/app/dossiers"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F766E] text-white text-xs font-bold shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la liste des dossiers</span>
        </Link>
      </div>
    );
  }

  // Calculs financiers
  const total = dossier.totalAmount || 0;
  const paid = dossier.paidAmount || 0;
  const remaining = Math.max(0, total - paid);

  const availableStatuses = [
    'Brouillon',
    'Option vol',
    'Acompte reçu',
    'Visa déposé',
    'Billet émis',
    'Soldé',
    'Terminé',
    'Annulé'
  ];

  // Soumission Document
  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!docName.trim()) return;

    try {
      await addDocument({
        name: docName.endsWith('.pdf') ? docName : `${docName}.pdf`,
        type: docType,
        client: dossier.client,
        dossierId: dossier.id,
        size: '1.4 MB',
        status: 'Validé'
      });

      setDocName('');
      setIsAddDocOpen(false);
      showToast('Document attaché avec succès au dossier !');
    } catch (err) {
      alert(err.message || 'Erreur lors de l’ajout du document.');
    }
  };

  // Soumission Paiement
  const handleAddPayment = async (e) => {
    e.preventDefault();
    const amt = parseInt(paymentAmount, 10);
    if (isNaN(amt) || amt <= 0) return;

    try {
      await addPayment({
        dossierId: dossier.id,
        client: dossier.client,
        amount: amt,
        method: paymentMethod,
        status: 'Encaissé'
      });

      setPaymentAmount('');
      setIsAddPaymentOpen(false);
      showToast(`Paiement de ${formatMoney(amt)} enregistré !`);
    } catch (err) {
      alert(err.message || 'Erreur lors de l’enregistrement du paiement.');
    }
  };

  // Soumission Passager
  const handleAddPassenger = async (e) => {
    e.preventDefault();
    if (!paxName.trim()) return;

    try {
      await addPassengerToDossier(dossier.id, {
        name: paxName.trim(),
        passport: paxPassport.trim() || 'En attente',
        role: paxRole
      });

      setPaxName('');
      setPaxPassport('');
      setIsAddPaxOpen(false);
      showToast('Nouveau passager ajouté au dossier !');
    } catch (err) {
      alert(err.message || 'Erreur lors de l’ajout du passager.');
    }
  };

  return (
    <div className="space-y-6 pb-16">

      {/* Notification Toast */}
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
        <Link to="/app/dossiers" className="hover:text-[#0F766E] flex items-center gap-1 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour aux dossiers</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-700">Dossier {dossier.id}</span>
      </div>

      {/* En-tête Dossier */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <span className="font-mono text-xs font-bold text-[#0F766E] bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded-md">
                {dossier.id}
              </span>

              {/* Statut avec Dropdown interactif pour modifier le statut */}
              <div className="relative">
                <button
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 cursor-pointer hover:opacity-90 ${dossier.badge || 'bg-slate-100 text-slate-800'}`}
                >
                  <span>{dossier.status}</span>
                  <span className="text-[9px] opacity-60">▼</span>
                </button>

                {isStatusDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-44 rounded-xl bg-white border border-slate-200 shadow-xl z-30 py-1 text-xs">
                    <span className="px-3 py-1 text-[10px] font-bold text-slate-400 block uppercase">
                      Changer le statut
                    </span>
                    {availableStatuses.map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          updateDossierStatus(dossier.id, st);
                          setIsStatusDropdownOpen(false);
                          showToast(`Statut mis à jour : ${st}`);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                          dossier.status === st ? 'font-bold text-[#0F766E] bg-teal-50/50' : 'text-slate-700'
                        }`}
                      >
                        <span>{st}</span>
                        {dossier.status === st && <Check className="w-3.5 h-3.5 text-[#0F766E]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-xs text-slate-400 font-mono">
                PNR : <strong className="text-slate-700">{dossier.pnr || 'GDS EN ATTENTE'}</strong>
              </span>
            </div>

            <h1 className="text-2xl font-bold font-title text-slate-900 mt-1">
              {dossier.client} • {dossier.route}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {dossier.dates} • {dossier.pax} {dossier.pax > 1 ? 'voyageurs' : 'voyageur'} • Compagnie : <strong className="text-slate-700">{dossier.airline}</strong>
            </p>
          </div>

          {/* Actions rapides d'en-tête selon permissions RBAC */}
          <div className="flex flex-wrap items-center gap-2.5">
            {canManageFinance && (
              <button
                onClick={() => setIsAddPaymentOpen(true)}
                className="fluent-btn px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0b5751] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Encaisser Acompte</span>
              </button>
            )}

            {canIssueTickets && (
              <button
                onClick={() => setIsAddDocOpen(true)}
                className="fluent-btn px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" />
                <span>Ajouter Document</span>
              </button>
            )}
          </div>

        </div>

        {/* Barre de navigation des 6 Onglets Fonctionnels */}
        <div className="flex items-center gap-2 pt-4 border-b border-slate-100 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'summary', label: 'Vue d’ensemble', icon: FileText },
            { id: 'passengers', label: `Passagers (${dossier.passengers?.length || dossier.pax})`, icon: Users },
            { id: 'documents', label: `Documents (${dossier.documents?.length || 0})`, icon: FileText },
            { id: 'visas', label: `Visas (${dossier.visas?.length || 0})`, icon: ShieldCheck },
            { id: 'payments', label: `Paiements (${dossier.payments?.length || 0})`, icon: CreditCard },
            { id: 'history', label: `Historique (${dossier.history?.length || 0})`, icon: Clock },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-[#0F766E] text-[#0F766E] font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================= CONTENU DES ONGLETS ================= */}
        <div className="pt-6 text-xs text-slate-700">

          {/* 1. VUE D'ENSEMBLE */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              
              {/* Résumé Financier & Statut des Encaissés */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px] mb-1">Montant Total Facturé</span>
                  <span className="text-xl font-extrabold text-slate-900 block font-mono">
                    {formatMoney(total)}
                  </span>
                  <span className="text-[10px] text-slate-400">Taxes aéroport & prestations incluses</span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <span className="text-emerald-800 block text-[11px] mb-1 font-semibold">Total Encaissé</span>
                  <span className="text-xl font-extrabold text-emerald-700 block font-mono">
                    {formatMoney(paid)}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    Couverture solde : {dossier.paid || '0%'}
                  </span>
                </div>

                <div className={`p-4 rounded-xl border ${remaining > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
                  <span className="text-slate-500 block text-[11px] mb-1 font-semibold">Reste à Recouvrer</span>
                  <span className={`text-xl font-extrabold block font-mono ${remaining > 0 ? 'text-amber-900' : 'text-slate-800'}`}>
                    {formatMoney(remaining)}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {remaining === 0 ? '✓ Dossier intégralement soldé' : 'Solde attendu avant émission finale'}
                  </span>
                </div>
              </div>

              {/* Cartes d'informations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Itinéraire */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">
                    Itinéraire Aérien
                  </span>
                  <div className="text-slate-700 font-semibold">{dossier.route}</div>
                  <div className="text-slate-500">{dossier.itinerary?.outbound || dossier.dates}</div>
                  {dossier.itinerary?.inbound && (
                    <div className="text-slate-500">{dossier.itinerary.inbound}</div>
                  )}
                  <div className="text-[#0F766E] font-mono font-bold pt-1">
                    Compagnie : {dossier.airline} ({dossier.flightNumber || 'Direct'})
                  </div>
                </div>

                {/* Coordonnées Client */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">
                    Contact Voyageur Référent
                  </span>
                  <div className="text-slate-900 font-bold text-sm">{dossier.client}</div>
                  <div className="text-slate-600 font-mono">{dossier.clientPhone || 'Téléphone non renseigné'}</div>
                  <div className="text-slate-600">{dossier.clientEmail || 'Email non renseigné'}</div>
                  {dossier.clientId && (
                    <Link to={`/app/clients/${dossier.clientId}`} className="text-[#0F766E] font-semibold hover:underline block pt-1">
                      Consulter fiche client →
                    </Link>
                  )}
                </div>

                {/* Notes & Instructions */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">
                    Consignes Opérationnelles
                  </span>
                  <p className="text-slate-600 leading-relaxed italic">
                    {dossier.notes || "Aucune consigne spécifique n'a été ajoutée pour ce dossier."}
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* 2. PASSAGERS */}
          {activeTab === 'passengers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">Liste des passagers déclarés</span>
                <button
                  onClick={() => setIsAddPaxOpen(true)}
                  className="fluent-btn px-3 py-1.5 rounded-lg bg-[#0F766E] text-white text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter un passager</span>
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-4">#</th>
                      <th className="py-2.5 px-4">Nom complet</th>
                      <th className="py-2.5 px-4">Numéro de passeport</th>
                      <th className="py-2.5 px-4">Rôle / Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dossier.passengers && dossier.passengers.length > 0 ? (
                      dossier.passengers.map((p, idx) => (
                        <tr key={p.id || idx} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{p.name}</td>
                          <td className="py-3 px-4 font-mono text-slate-700">{p.passport}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                              {p.role}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-slate-400">
                          Aucun passager enregistré. Cliquez sur "Ajouter un passager".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">Pièces justificatives, billets et visas attachés</span>
                <button
                  onClick={() => setIsAddDocOpen(true)}
                  className="fluent-btn px-3 py-1.5 rounded-lg bg-[#0F766E] text-white text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter un document</span>
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-4">Fichier</th>
                      <th className="py-2.5 px-4">Type</th>
                      <th className="py-2.5 px-4">Date d'ajout</th>
                      <th className="py-2.5 px-4">Statut</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dossier.documents && dossier.documents.length > 0 ? (
                      dossier.documents.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                            <span>📄</span>
                            <span>{d.name}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{d.type}</td>
                          <td className="py-3 px-4 text-slate-500">{d.date}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {d.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => showToast(`Téléchargement de ${d.name} en cours...`)}
                              className="text-[#0F766E] font-bold hover:underline inline-flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              <span>Télécharger</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-400">
                          Aucun document n'est encore attaché à ce dossier.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. DEMANDE DE VISA */}
          {activeTab === 'visas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">Suivi consulaire et démarches de visa</span>
                <button
                  onClick={() => {
                    addVisa({
                      client: dossier.client,
                      dossierId: dossier.id,
                      destination: dossier.destination,
                      type: 'Court séjour',
                      status: 'En cours'
                    });
                    showToast("Demande de visa enregistrée pour ce dossier !");
                  }}
                  className="fluent-btn px-3 py-1.5 rounded-lg bg-[#0F766E] text-white text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Enregistrer dépôt consulaire</span>
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-4">Bénéficiaire</th>
                      <th className="py-2.5 px-4">Destination</th>
                      <th className="py-2.5 px-4">Catégorie</th>
                      <th className="py-2.5 px-4">Date de dépôt</th>
                      <th className="py-2.5 px-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dossier.visas && dossier.visas.length > 0 ? (
                      dossier.visas.map((v, i) => (
                        <tr key={v.id || i} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-bold text-slate-800">{v.traveler || dossier.client}</td>
                          <td className="py-3 px-4 text-slate-700">{v.destination}</td>
                          <td className="py-3 px-4 text-slate-600">{v.type}</td>
                          <td className="py-3 px-4 text-slate-500">{v.depositDate}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              v.status === 'Délivré' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {v.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-400">
                          Aucune formalité de visa n'est encore enregistrée pour ce dossier.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. FACTURATION & PAIEMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Dû</span>
                    <span className="font-mono font-bold text-base text-slate-900">{formatMoney(total)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Encaissé</span>
                    <span className="font-mono font-bold text-base text-emerald-600">{formatMoney(paid)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Solde</span>
                    <span className="font-mono font-bold text-base text-amber-700">{formatMoney(remaining)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddPaymentOpen(true)}
                  className="fluent-btn px-4 py-2 rounded-xl bg-[#0F766E] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>+ Encaisser un acompte</span>
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-4">Réf</th>
                      <th className="py-2.5 px-4">Moyen de règlement</th>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Montant</th>
                      <th className="py-2.5 px-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dossier.payments && dossier.payments.length > 0 ? (
                      dossier.payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.id}</td>
                          <td className="py-3 px-4 text-slate-700 font-medium">{p.method}</td>
                          <td className="py-3 px-4 text-slate-500">{p.date}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {p.amountFormatted || formatMoney(p.amountNum || p.amount)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-400">
                          Aucun encaissement n'a encore été enregistré sur ce dossier.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* 6. HISTORIQUE */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <span className="font-bold text-slate-900 text-sm block mb-2">
                Journal chronologique des opérations
              </span>
              
              <div className="border-l-2 border-teal-200 ml-3 pl-4 space-y-4">
                {dossier.history && dossier.history.length > 0 ? (
                  dossier.history.map((h, i) => (
                    <div key={i} className="relative">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E] absolute -left-[21.5px] top-1.5 border-2 border-white"></span>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>{h.date}</span>
                          <span className="font-semibold text-slate-600">{h.author}</span>
                        </div>
                        <p className="text-xs text-slate-800 font-medium">{h.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400">Aucun historique disponible.</p>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ================= MODAL AJOUT DOCUMENT ================= */}
      {isAddDocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 relative">
            <button 
              onClick={() => setIsAddDocOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
            <h3 className="font-bold text-base text-slate-900 mb-1">Attacher un Document</h3>
            <p className="text-xs text-slate-500 mb-4">
              Ajoutez un passeport numérisé, visa, e-billet ou assurance à ce dossier.
            </p>

            <form onSubmit={handleAddDocument} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom du document *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Passeport_Amadou_Diallo.pdf"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catégorie du document</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option>Passeport</option>
                  <option>Billet électronique</option>
                  <option>E-Visa / Visa</option>
                  <option>Assurance voyage</option>
                  <option>Réservation d'hôtel</option>
                  <option>Bon de commande</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddDocOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="fluent-btn px-4 py-2 rounded-xl bg-[#0F766E] text-white font-bold"
                >
                  Valider et attacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL ENCAISSER PAIEMENT ================= */}
      {isAddPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 relative">
            <button 
              onClick={() => setIsAddPaymentOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
            <h3 className="font-bold text-base text-slate-900 mb-1">Encaisser un Acompte / Paiement</h3>
            <p className="text-xs text-slate-500 mb-4">
              Dossier #{dossier.id} ({dossier.client}). Reste dû : <strong>{formatMoney(remaining)}</strong>.
            </p>

            <form onSubmit={handleAddPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Montant encaissé (FCFA) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Ex: 500000"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Moyen de règlement</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option>Virement Bancaire (CBAO / BOA)</option>
                  <option>Orange Money</option>
                  <option>Wave Sénégal</option>
                  <option>Chèque certifié</option>
                  <option>Espèces en agence</option>
                  <option>Carte Bancaire Visa/Mastercard</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPaymentOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="fluent-btn px-4 py-2 rounded-xl bg-[#0F766E] text-white font-bold"
                >
                  Valider l'encaissement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL AJOUT PASSAGER ================= */}
      {isAddPaxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 relative">
            <button 
              onClick={() => setIsAddPaxOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
            <h3 className="font-bold text-base text-slate-900 mb-1">Ajouter un Passager</h3>
            <p className="text-xs text-slate-500 mb-4">
              Dossier #{dossier.id} ({dossier.route}).
            </p>

            <form onSubmit={handleAddPassenger} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom et Prénom *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fatoumata Ndiaye"
                  value={paxName}
                  onChange={(e) => setPaxName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Numéro de passeport</label>
                <input
                  type="text"
                  placeholder="Ex: SN-0982341"
                  value={paxPassport}
                  onChange={(e) => setPaxPassport(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rôle / Catégorie</label>
                <select
                  value={paxRole}
                  onChange={(e) => setPaxRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option>Adulte</option>
                  <option>Enfant (2 - 11 ans)</option>
                  <option>Bébé (0 - 2 ans)</option>
                  <option>Accompagnateur</option>
                  <option>Responsable de groupe</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPaxOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="fluent-btn px-4 py-2 rounded-xl bg-[#0F766E] text-white font-bold"
                >
                  Enregistrer le passager
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
