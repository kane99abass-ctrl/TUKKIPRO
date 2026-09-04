import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext.jsx';
import { Search, Plus, FolderOpen, ArrowRight, Plane, Filter } from 'lucide-react';

export default function TravelFilesPage() {
  const { dossiers, formatMoney } = useData();
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'urgent'
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrage
  const filtered = dossiers.filter(f => {
    // Filtre par catégorie
    if (filter === 'active' && (f.status === 'Terminé' || f.status === 'Annulé')) return false;
    if (filter === 'urgent' && !f.status.toLowerCase().includes('option') && !f.status.toLowerCase().includes('urgence')) return false;

    // Filtre par recherche textuelle
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchId = f.id.toLowerCase().includes(term);
      const matchClient = f.client?.toLowerCase().includes(term);
      const matchRoute = f.route?.toLowerCase().includes(term);
      const matchStatus = f.status?.toLowerCase().includes(term);
      return matchId || matchClient || matchRoute || matchStatus;
    }

    return true;
  });

  const allCount = dossiers.length;
  const activeCount = dossiers.filter(f => f.status !== 'Terminé' && f.status !== 'Annulé').length;
  const urgentCount = dossiers.filter(f => f.status.toLowerCase().includes('option') || f.status.toLowerCase().includes('urgence')).length;

  return (
    <div className="space-y-6">
      
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-title text-slate-900">Dossiers de Voyage</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi centralisé de chaque réservation, visa consulaire, échéance et encaissement.
          </p>
        </div>

        <Link
          to="/app/dossiers/new"
          className="fluent-btn px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0b5751] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Dossier</span>
        </Link>
      </div>

      {/* Barre de Filtres & Recherche */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Onglets Filtres */}
        <div className="flex items-center gap-1.5 text-xs">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              filter === 'all' 
                ? 'bg-[#0F766E] text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tous ({allCount})
          </button>
          <button 
            onClick={() => setFilter('active')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              filter === 'active' 
                ? 'bg-[#0F766E] text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            En cours ({activeCount})
          </button>
          <button 
            onClick={() => setFilter('urgent')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              filter === 'urgent' 
                ? 'bg-rose-600 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Urgences ({urgentCount})
          </button>
        </div>

        {/* Input Recherche */}
        <div className="relative sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher réf, client, vol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
          />
        </div>

      </div>

      {/* Tableau des Dossiers */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FolderOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 mb-1">
              Aucun dossier trouvé
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              {searchTerm 
                ? `Aucun résultat ne correspond à "${searchTerm}".`
                : "Vous n'avez aucun dossier dans cette catégorie pour le moment."}
            </p>
            <Link
              to="/app/dossiers/new"
              className="fluent-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F766E] text-white text-xs font-bold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Créer un dossier maintenant</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-semibold uppercase border-b border-slate-100">
                  <th className="py-3 px-4">Réf</th>
                  <th className="py-3 px-4">Client & Intitulé</th>
                  <th className="py-3 px-4">Trajet & Dates</th>
                  <th className="py-3 px-4">Passagers</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Montant & Solde</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <Link to={`/app/dossiers/${f.id}`} className="hover:text-[#0F766E]">
                        {f.id}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{f.client}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{f.title || f.tripType}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-700">{f.route}</div>
                      <div className="text-[11px] text-slate-400">{f.dates}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {f.pax} {f.pax > 1 ? 'voyageurs' : 'voyageur'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${f.badge || 'bg-slate-100 text-slate-700'}`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-bold text-slate-800">{f.amount}</div>
                      <div className="text-[10px] text-emerald-600 font-semibold">
                        Payé : {f.paid || '0%'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/app/dossiers/${f.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#0F766E] hover:underline"
                      >
                        <span>Ouvrir</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
