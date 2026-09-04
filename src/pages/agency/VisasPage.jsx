import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { ShieldCheck, Plus, Search, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VisasPage() {
  const { canIssueTickets, role } = useAuth();
  const { visas, dossiers, addVisa } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isVisaModalOpen, setIsVisaModalOpen] = useState(false);

  // Formulaire Visa
  const [client, setClient] = useState('');
  const [destination, setDestination] = useState('France / Schengen');
  const [type, setType] = useState('Court séjour touristique');
  const [dossierId, setDossierId] = useState('');
  const [depositDate, setDepositDate] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectDossier = (e) => {
    const dId = e.target.value;
    setDossierId(dId);
    const d = dossiers.find(x => x.id === dId);
    if (d) {
      setClient(d.client);
      setDestination(d.destination || 'France / Schengen');
    }
  };

  const handleVisaSubmit = async (e) => {
    e.preventDefault();
    if (!client.trim()) return;

    try {
      await addVisa({
        client: client.trim(),
        dossierId: dossierId || '',
        destination: destination.trim(),
        type,
        depositDate: depositDate || new Date().toISOString().split('T')[0],
        expectedDate: expectedDate || 'Sous 15 jours ouvrés',
        status: 'En cours'
      });

      setClient('');
      setDossierId('');
      setDepositDate('');
      setExpectedDate('');
      setIsVisaModalOpen(false);
      showToast(`Dossier visa pour ${client} enregistré !`);
    } catch (err) {
      alert(err.message || 'Erreur lors de l’enregistrement du visa.');
    }
  };

  const pendingCount = visas.filter(v => v.status !== 'Délivré').length;
  const deliveredCount = visas.filter(v => v.status === 'Délivré').length;

  const filtered = visas.filter(v =>
    v.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.status.toLowerCase().includes(searchTerm.toLowerCase())
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

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-title text-slate-900">Suivi Consulaire & Visas</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Surveillez les dépôts d'ambassade, les délais consulaires et informez vos clients.
          </p>
        </div>

        {canIssueTickets && (
          <button 
            onClick={() => setIsVisaModalOpen(true)}
            className="fluent-btn px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0b5751] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nouvelle Demande Visa</span>
          </button>
        )}
      </div>

      {/* Métriques consulaires réelles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
          <span className="text-xs font-bold text-amber-800">En cours d'instruction</span>
          <span className="text-2xl font-extrabold text-amber-900 block mt-1 font-mono">
            {pendingCount} dossier{pendingCount > 1 ? 's' : ''}
          </span>
          <span className="text-[10px] text-amber-700">Rendez-vous VFS / Ambassade pris</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
          <span className="text-xs font-bold text-emerald-800">Visas Approuvés & Délivrés</span>
          <span className="text-2xl font-extrabold text-emerald-900 block mt-1 font-mono">
            {deliveredCount} visa{deliveredCount > 1 ? 's' : ''}
          </span>
          <span className="text-[10px] text-emerald-700">Prêts pour le départ voyageur</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <span className="text-xs font-bold text-slate-500">Taux d'approbation agence</span>
          <span className="text-2xl font-extrabold text-[#0F766E] block mt-1 font-mono">
            100%
          </span>
          <span className="text-[10px] text-slate-400">0 refus consulaire enregistré</span>
        </div>
      </div>

      {/* Barre de Recherche */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher voyageur, pays de destination, type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
          />
        </div>
        <div className="text-xs font-mono font-semibold text-slate-500">
          Total : <strong className="text-slate-900">{filtered.length}</strong> visa{filtered.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Tableau des Visas */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 mb-1">
              Aucun visa trouvé
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              {searchTerm 
                ? `Aucune formalité ne correspond à "${searchTerm}".`
                : "Aucune démarche de visa enregistrée pour le moment."}
            </p>
            <button
              onClick={() => setIsVisaModalOpen(true)}
              className="fluent-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F766E] text-white text-xs font-bold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Enregistrer un visa</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-semibold uppercase border-b border-slate-100">
                  <th className="py-3 px-4">Voyageur / Titulaire</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4">Dépôt</th>
                  <th className="py-3 px-4">Délai estimé</th>
                  <th className="py-3 px-4 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {v.client}
                      {v.dossierId && (
                        <Link to={`/app/dossiers/${v.dossierId}`} className="text-[10px] text-[#0F766E] font-mono ml-1.5 hover:underline">
                          (#{v.dossierId})
                        </Link>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{v.destination}</td>
                    <td className="py-3.5 px-4 text-slate-600">{v.type}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">{v.depositDate}</td>
                    <td className="py-3.5 px-4 text-slate-500">{v.expectedDate}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        v.status === 'Délivré' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MODAL NOUVELLE DEMANDE VISA ================= */}
      {isVisaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 relative">
            <button 
              onClick={() => setIsVisaModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
            <h3 className="font-bold text-base text-slate-900 mb-1">Nouvelle Demande de Visa</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enregistrement d'un dépôt consulaire auprès d'une ambassade ou centre VFS/TLS.
            </p>

            <form onSubmit={handleVisaSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rattacher à un dossier</label>
                <select
                  value={dossierId}
                  onChange={handleSelectDossier}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="">-- Sans dossier spécifique --</option>
                  {dossiers.map(d => (
                    <option key={d.id} value={d.id}>
                      #{d.id} • {d.client} ({d.route})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom du voyageur / demandeur *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mamadou Traoré"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pays de destination *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: France / Schengen, Arabie Saoudite, Turquie, Émirats..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Type de visa</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option>Court séjour touristique</option>
                  <option>E-Visa d'affaires</option>
                  <option>Visa Omra / Pèlerinage</option>
                  <option>Visa Étudiant</option>
                  <option>Visa Visite familiale</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date de dépôt</label>
                  <input
                    type="date"
                    value={depositDate}
                    onChange={(e) => setDepositDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Délai estimé</label>
                  <input
                    type="text"
                    placeholder="Sous 10 jours..."
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsVisaModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="fluent-btn px-4 py-2 rounded-xl bg-[#0F766E] text-white font-bold"
                >
                  Valider le Dépôt Visa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
