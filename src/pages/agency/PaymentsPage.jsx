import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { 
  CreditCard, Plus, Search, CheckCircle2, AlertCircle, ArrowRight, 
  Shield, BarChart3, TrendingUp, Calendar, ChevronLeft, ChevronRight,
  PieChart, ArrowUpRight, DollarSign, Wallet, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PaymentsPage() {
  const { canManageFinance, role } = useAuth();
  const { payments, dossiers, totalCollectedAmount, totalRemainingBalance, totalSalesAmount, formatMoney, addPayment } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('payments'); // 'payments' | 'stats'
  const [selectedMonth, setSelectedMonth] = useState('2026-09'); // ou 'all'

  const monthOptions = [
    { value: 'all', label: '📅 Tous les mois (Consolidé)' },
    { value: '2026-01', label: 'Janvier 2026' },
    { value: '2026-02', label: 'Février 2026' },
    { value: '2026-03', label: 'Mars 2026' },
    { value: '2026-04', label: 'Avril 2026' },
    { value: '2026-05', label: 'Mai 2026' },
    { value: '2026-06', label: 'Juin 2026' },
    { value: '2026-07', label: 'Juillet 2026' },
    { value: '2026-08', label: 'Août 2026' },
    { value: '2026-09', label: 'Septembre 2026 (En cours)' },
    { value: '2026-10', label: 'Octobre 2026' },
    { value: '2026-11', label: 'Novembre 2026' },
    { value: '2026-12', label: 'Décembre 2026' },
    { value: '2027-01', label: 'Janvier 2027' },
    { value: '2027-02', label: 'Février 2027' }
  ];

  const handleNavigateMonth = (direction) => {
    if (selectedMonth === 'all') {
      setSelectedMonth('2026-09');
      return;
    }
    const idx = monthOptions.findIndex(m => m.value === selectedMonth);
    if (idx === -1) return;
    const newIdx = idx + direction;
    if (newIdx >= 1 && newIdx < monthOptions.length) {
      setSelectedMonth(monthOptions[newIdx].value);
    }
  };

  // Formulaire d'encaissement
  const [dossierId, setDossierId] = useState('');
  const [client, setClient] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Virement Bancaire (CBAO)');
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
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const num = parseInt(amount, 10);
    if (isNaN(num) || num <= 0) return;

    try {
      await addPayment({
        dossierId: dossierId || '',
        client: client.trim() || 'Client',
        amount: num,
        method,
        status: 'Encaissé'
      });

      setDossierId('');
      setClient('');
      setAmount('');
      setIsPayModalOpen(false);
      showToast(`Règlement de ${formatMoney(num)} validé !`);
    } catch (err) {
      alert(err.message || 'Erreur lors de l’encaissement.');
    }
  };

  const filtered = payments.filter(p => {
    const matchesSearch = p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.dossier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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

      {/* En-tête Renommé : Comptabilité & Paiements */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-title text-slate-900">Comptabilité & Paiements</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-[#0F766E]">
              Devise : FCFA (XOF)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi mensuel des encaissements clients, dépenses d'agence, bilans et statistiques financières.
          </p>
        </div>

        {canManageFinance ? (
          <button 
            onClick={() => setIsPayModalOpen(true)}
            className="fluent-btn px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0b5751] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Encaisser un Acompte</span>
          </button>
        ) : (
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>Encaissement réservé Finance/Admin ({role})</span>
          </div>
        )}
      </div>

      {/* Barre d'Onglets & Sélecteur Mensuel Optimisé */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        {/* Onglets */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1 xl:pb-0">
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'payments'
                ? 'bg-[#0F766E] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Encaissements</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'payments' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 font-bold'
            }`}>
              {filtered.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'stats'
                ? 'bg-[#0F766E] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Statistiques & Analyses</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              35.6% Marge
            </span>
          </button>
        </div>

        {/* Sélecteur Mensuel Dynamique & Optimisé (Navigation vers n'importe quel mois) */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 p-1.5 rounded-2xl text-xs shrink-0 self-start xl:self-auto shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 px-1 hidden sm:inline">Mois :</span>
          <button
            onClick={() => handleNavigateMonth(-1)}
            disabled={selectedMonth === '2026-01'}
            className="w-8 h-8 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center border border-slate-200/80 shadow-2xs transition-all cursor-pointer disabled:opacity-40"
            title="Mois précédent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 rounded-xl font-bold bg-white text-slate-900 border border-slate-200/80 shadow-2xs text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            {monthOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => handleNavigateMonth(1)}
            disabled={selectedMonth === '2027-02'}
            className="w-8 h-8 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center border border-slate-200/80 shadow-2xs transition-all cursor-pointer disabled:opacity-40"
            title="Mois suivant"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VUE 1 : ENCAISSEMENTS & TRANSACTIONS                           */}
      {/* ============================================================== */}
      {activeTab === 'payments' && (
        <>
          {/* Cartes Métriques Financières Réelles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">Total Encaissé en Agence</span>
              <span className="text-2xl font-extrabold text-emerald-600 block mt-1 font-mono">
                {formatMoney(totalCollectedAmount)}
              </span>
              <span className="text-[10px] text-slate-400">Sur un volume d'affaires de {formatMoney(totalSalesAmount)}</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 shadow-xs">
              <span className="text-xs font-semibold text-amber-800">Soldes Restants à Recouvrer</span>
              <span className="text-2xl font-extrabold text-amber-900 block mt-1 font-mono">
                {formatMoney(totalRemainingBalance)}
              </span>
              <span className="text-[10px] text-amber-700">Acomptes en attente de solde avant émission</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">Transactions Répertoriées</span>
              <span className="text-2xl font-extrabold text-[#0F766E] block mt-1 font-mono">
                {payments.length} reçus
              </span>
              <span className="text-[10px] text-slate-400">Rapprochement bancaire et mobile money</span>
            </div>
          </div>

          {/* Barre de Recherche */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher par référence, client, moyen de paiement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
            </div>
            <div className="text-xs font-mono font-semibold text-slate-500">
              Total : <strong className="text-slate-900">{filtered.length}</strong> transaction{filtered.length > 1 ? 's' : ''}
            </div>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* VUE 2 : STATISTIQUES FINANCIÈRES & ANALYSES (NOUVELLE PARTIE)   */}
      {/* ============================================================== */}
      {activeTab === 'stats' && (
        <div className="space-y-6 animate-fade-in">
          {/* 4 KPIs Analytiques Principaux */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Chiffre d'Affaires Encaissé</span>
              <div className="my-2">
                <span className="text-2xl font-extrabold text-emerald-600 font-mono">14 850 000 FCFA</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+18.4% vs mois précédent</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Total Charges & Déaissements</span>
              <div className="my-2">
                <span className="text-2xl font-extrabold text-rose-600 font-mono">4 250 000 FCFA</span>
              </div>
              <span className="text-[11px] text-slate-400">Salaires, Loyer, Amadeus GDS</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Marge Brute Opérationnelle</span>
              <div className="my-2">
                <span className="text-2xl font-extrabold text-[#0F766E] font-mono">5 285 000 FCFA</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Taux net : 35.6%</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-600">Canal N°1 d'Encaissement</span>
              <div className="my-2">
                <span className="text-2xl font-extrabold text-[#0F766E]">Wave Sénégal</span>
              </div>
              <span className="text-[11px] text-teal-800 font-medium">48% des volumes agence</span>
            </div>
          </div>

          {/* Grille Graphiques & Répartition */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Répartition par Moyen de Paiement */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Répartition par Moyen de Paiement</h3>
                  <p className="text-[11px] text-slate-400">Volume total encaissé : 14 850 000 FCFA</p>
                </div>
                <PieChart className="w-5 h-5 text-slate-400" />
              </div>

              <div className="space-y-3 pt-1 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-700">● Wave Mobile Money</span>
                    <span className="font-mono font-bold text-slate-900">7 128 000 FCFA (48%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-sky-500 h-2 rounded-full" style={{ width: '48%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-700">● Virement Bancaire (CBAO / BICIS)</span>
                    <span className="font-mono font-bold text-slate-900">3 564 000 FCFA (24%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '24%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-700">● Orange Money</span>
                    <span className="font-mono font-bold text-slate-900">2 376 000 FCFA (16%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '16%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-700">● Espèces Caisse Agence</span>
                    <span className="font-mono font-bold text-slate-900">1 188 000 FCFA (8%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '8%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-700">● Chèque Certifié</span>
                    <span className="font-mono font-bold text-slate-900">594 000 FCFA (4%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-slate-700 h-2 rounded-full" style={{ width: '4%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Marges par Ligne de Produits & Services */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Marges Brutes par Ligne Métier</h3>
                  <p className="text-[11px] text-slate-400">Contribution relative à la rentabilité nette</p>
                </div>
                <TrendingUp className="w-5 h-5 text-[#0F766E]" />
              </div>

              <div className="space-y-3 pt-1 text-xs">
                <div className="p-3 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">✈️ Billetterie GDS & Vols Réguliers</span>
                    <span className="text-[11px] text-slate-500">Commissions IATA & frais d'émission PNR</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-extrabold text-[#0F766E] text-sm block">2 450 000 FCFA</span>
                    <span className="text-[10px] text-emerald-700 font-bold">46.4% de la marge</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">🕋 Pèlerinage Omra & Forfaits Hadj</span>
                    <span className="text-[11px] text-slate-500">Packages vols, hôtels et visas Nusuk</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-extrabold text-emerald-700 text-sm block">1 680 000 FCFA</span>
                    <span className="text-[10px] text-emerald-700 font-bold">31.8% de la marge</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">🎓 Visas Étudiants & Accompagnement</span>
                    <span className="text-[11px] text-slate-500">Honoraires dossiers, admissions et consultations</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-extrabold text-tukki-teal text-sm block">780 000 FCFA</span>
                    <span className="text-[10px] text-teal-700 font-bold">14.7% de la marge</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">🛂 Frais Dossiers Visas Tourisme & Affaires</span>
                    <span className="text-[11px] text-slate-500">VFS, Capago, E-visas Dubaï</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-extrabold text-amber-800 text-sm block">375 000 FCFA</span>
                    <span className="text-[10px] text-amber-700 font-bold">7.1% de la marge</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Tableau Top 5 Clients & Entreprises les plus rentables */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Top 5 des Clients & Entreprises les Plus Rentables</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                    <th className="py-2.5 px-3">Client / Société</th>
                    <th className="py-2.5 px-3">Secteur</th>
                    <th className="py-2.5 px-3 text-right">Volume Achat</th>
                    <th className="py-2.5 px-3 text-right">Marge Nette Agence</th>
                    <th className="py-2.5 px-3 text-right">Taux de Rentabilité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">Groupe Al-Hikma (Omra Ramadan)</td>
                    <td className="py-3 px-3 text-slate-500">Pèlerinage & Groupes</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">5 400 000 FCFA</td>
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-600">1 420 000 FCFA</td>
                    <td className="py-3 px-3 text-right text-emerald-700 font-bold">26.3%</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">Cabinet Sylla & Associés</td>
                    <td className="py-3 px-3 text-slate-500">Corporate & Affaires</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">3 200 000 FCFA</td>
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-600">980 000 FCFA</td>
                    <td className="py-3 px-3 text-right text-emerald-700 font-bold">30.6%</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">Société Agro-Sahel</td>
                    <td className="py-3 px-3 text-slate-500">Missions Afrique & Europe</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">1 500 000 FCFA</td>
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-600">460 000 FCFA</td>
                    <td className="py-3 px-3 text-right text-emerald-700 font-bold">30.7%</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">M. Oumar Ndiaye (Famille)</td>
                    <td className="py-3 px-3 text-slate-500">Tourisme Familial Paris</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">750 000 FCFA</td>
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-600">220 000 FCFA</td>
                    <td className="py-3 px-3 text-right text-emerald-700 font-bold">29.3%</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">Pôle Visas Étudiants (6 dossiers)</td>
                    <td className="py-3 px-3 text-slate-500">Mobilité Internationale</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">1 200 000 FCFA</td>
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-600">780 000 FCFA</td>
                    <td className="py-3 px-3 text-right text-emerald-700 font-bold">65.0%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tableau des Paiements */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 mb-1">
              Aucun paiement trouvé
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              {searchTerm 
                ? `Aucun règlement ne correspond à "${searchTerm}".`
                : "Aucune transaction enregistrée pour le moment."}
            </p>
            <button
              onClick={() => setIsPayModalOpen(true)}
              className="fluent-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F766E] text-white text-xs font-bold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Encaisser un premier acompte</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-semibold uppercase border-b border-slate-100">
                  <th className="py-3 px-4">Réf Paiement</th>
                  <th className="py-3 px-4">Client & Dossier</th>
                  <th className="py-3 px-4">Moyen de règlement</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Montant</th>
                  <th className="py-3 px-4 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{t.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{t.client}</div>
                      {t.dossierId ? (
                        <Link to={`/app/dossiers/${t.dossierId}`} className="text-[11px] text-[#0F766E] hover:underline font-mono">
                          {t.dossier}
                        </Link>
                      ) : (
                        <div className="text-[11px] text-slate-400">{t.dossier}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{t.method}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">{t.date}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-right font-mono text-xs">
                      {t.amount}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${t.badge || 'bg-emerald-100 text-emerald-800'}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MODAL NOUVEL ENCAISSEMENT ================= */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 relative">
            <button 
              onClick={() => setIsPayModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
            <h3 className="font-bold text-base text-slate-900 mb-1">Encaisser un Acompte</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enregistrement direct d'un versement avec rapprochement automatique sur le dossier.
            </p>

            <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dossier concerné</label>
                <select
                  value={dossierId}
                  onChange={handleSelectDossier}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="">-- Sans dossier spécifique --</option>
                  {dossiers.map(d => (
                    <option key={d.id} value={d.id}>
                      #{d.id} • {d.client} (Total: {d.amount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom du client *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Famille Ndiaye"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Montant du versement (FCFA) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Ex: 500000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mode de règlement</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option>Virement Bancaire (CBAO)</option>
                  <option>Orange Money</option>
                  <option>Wave Sénégal</option>
                  <option>Chèque certifié</option>
                  <option>Espèces en agence</option>
                  <option>Carte Bancaire Visa / Mastercard</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
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

    </div>
  );
}
