import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useData } from '../../contexts/DataContext.jsx';
import { 
  FolderPlus, UserPlus, UploadCloud, CreditCard, ArrowRight, 
  Clock, ShieldCheck, FileText, CheckCircle2, AlertCircle, Plus,
  Calendar, ChevronLeft, ChevronRight, CheckSquare, Square, CalendarDays
} from 'lucide-react';

export default function DashboardPage() {
  const { agency, user, canManageFinance, canIssueTickets, role } = useAuth();
  const navigate = useNavigate();
  const { 
    dossiers, 
    clients, 
    documents, 
    visas, 
    payments, 
    activeDossiersCount, 
    urgentCount, 
    totalSalesAmount, 
    totalCollectedAmount,
    totalRemainingBalance,
    studentCandidatesCount,
    studentActiveCount,
    studentAdmissionsCount,
    studentVisasInProgressCount,
    studentVisasObtainedCount,
    studentActionsRequiredCount,
    formatMoney, 
    addClient, 
    addDocument, 
    addPayment 
  } = useData();

  // Modales d'actions rapides
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  // Form states
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Passeport');
  const [docDossierId, setDocDossierId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Virement Bancaire');
  const [payDossierId, setPayDossierId] = useState('');

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ==============================================================
  // ÉTAT DU CALENDRIER DASHBOARD & CRÉNEAUX DISPONIBLES (STYLE IMAGE)
  // ==============================================================
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(1); // 1 = Février (correspond exactement à "Feb 2026" de l'image)
  const [selectedDate, setSelectedDate] = useState('2026-02-20'); // 20 Février par défaut
  const [isApptModalOpen, setIsApptModalOpen] = useState(false);
  const [apptClient, setApptClient] = useState('');
  const [apptTime, setApptTime] = useState('09:00 - 09:45');
  const [apptService, setApptService] = useState('🎓 Orientation & Visa Étudiant');
  const [apptAgent, setApptAgent] = useState('Amadou Diallo');
  const [apptStatusChoice, setApptStatusChoice] = useState('dispo');

  const [appointmentsMap, setAppointmentsMap] = useState({
    '2026-02-20': [
      { id: 'slot-20-1', time: '09:00 - 09:45', client: 'Moussa Fofana', service: '🎓 Entretien Visa Étudiant Campus France', agent: 'Fatou Sow', isAvailable: false, status: 'Réservé' },
      { id: 'slot-20-2', time: '10:30 - 11:15', client: 'Créneau Libre', service: '✈️ Accueil Billetterie & Réservation', agent: 'Amadou Diallo', isAvailable: true, status: 'Disponible' },
      { id: 'slot-20-3', time: '11:45 - 12:30', client: 'Créneau Libre', service: '🕋 Conseil Pèlerinage Omra Ramadan', agent: 'Cheikh Ndiaye', isAvailable: true, status: 'Disponible' },
      { id: 'slot-20-4', time: '14:30 - 15:15', client: 'Cabinet Sylla & Associés', service: '💼 Renouvellement Contrat Corporate', agent: 'Amadou Diallo', isAvailable: false, status: 'Réservé' },
      { id: 'slot-20-5', time: '16:00 - 16:45', client: 'Créneau Libre', service: '🛂 Dépôt Passeport & E-Visa Dubaï', agent: 'Fatou Sow', isAvailable: true, status: 'Disponible' }
    ],
    '2026-02-06': [
      { id: 'slot-06-1', time: '10:00 - 10:45', client: 'Aïssatou Ba', service: '🎓 Dépôt Attestation VFS Canada', agent: 'Fatou Sow', isAvailable: false, status: 'Réservé' },
      { id: 'slot-06-2', time: '11:30 - 12:15', client: 'Créneau Libre', service: '✈️ Réservation Vol Air France', agent: 'Amadou Diallo', isAvailable: true, status: 'Disponible' }
    ],
    '2026-02-12': [
      { id: 'slot-12-1', time: '09:30 - 10:15', client: 'Créneau Libre', service: '🎓 Consultation Université Lyon 2', agent: 'Fatou Sow', isAvailable: true, status: 'Disponible' },
      { id: 'slot-12-2', time: '15:00 - 15:45', client: 'Dr. Cheikh Anta Diop', service: '✈️ Billet Conférence Casablanca', agent: 'Amadou Diallo', isAvailable: false, status: 'Réservé' }
    ],
    '2026-02-18': [
      { id: 'slot-18-1', time: '14:00 - 14:45', client: 'Créneau Libre', service: '✈️ Émission Billets Famille Diallo', agent: 'Amadou Diallo', isAvailable: true, status: 'Disponible' }
    ],
    '2026-02-25': [
      { id: 'slot-25-1', time: '10:00 - 10:45', client: 'Ousmane Fall', service: '🎓 Préparation Entretien Consulaire', agent: 'Fatou Sow', isAvailable: false, status: 'Réservé' },
      { id: 'slot-25-2', time: '11:30 - 12:15', client: 'Créneau Libre', service: '✈️ Devis Vol Groupe Turquie', agent: 'Cheikh Ndiaye', isAvailable: true, status: 'Disponible' }
    ]
  });

  const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNamesFr = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dayNamesFr = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  const handlePrevMonth = () => {
    let newM = calMonth - 1;
    let newY = calYear;
    if (newM < 0) {
      newM = 11;
      newY -= 1;
    }
    setCalMonth(newM);
    setCalYear(newY);
    const maxD = new Date(newY, newM + 1, 0).getDate();
    const currD = parseInt(selectedDate.split('-')[2], 10) || 1;
    setSelectedDate(`${newY}-${String(newM + 1).padStart(2, '0')}-${String(Math.min(currD, maxD)).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    let newM = calMonth + 1;
    let newY = calYear;
    if (newM > 11) {
      newM = 0;
      newY += 1;
    }
    setCalMonth(newM);
    setCalYear(newY);
    const maxD = new Date(newY, newM + 1, 0).getDate();
    const currD = parseInt(selectedDate.split('-')[2], 10) || 1;
    setSelectedDate(`${newY}-${String(newM + 1).padStart(2, '0')}-${String(Math.min(currD, maxD)).padStart(2, '0')}`);
  };

  const toggleSlotAvailability = (slotId) => {
    const daySlots = appointmentsMap[selectedDate] || [];
    const updated = daySlots.map(s => {
      if (s.id === slotId) {
        const nextAvail = !s.isAvailable;
        return {
          ...s,
          isAvailable: nextAvail,
          status: nextAvail ? 'Disponible' : 'Réservé'
        };
      }
      return s;
    });
    setAppointmentsMap(prev => ({
      ...prev,
      [selectedDate]: updated
    }));
    const changed = updated.find(s => s.id === slotId);
    if (changed) {
      showToast(`Créneau ${changed.time} : statut changé en "${changed.isAvailable ? 'Disponible ✓' : 'Réservé'}"`);
    }
  };

  const markAllDaySlotsAvailable = () => {
    const daySlots = currentDaySlots.map(s => ({
      ...s,
      isAvailable: true,
      status: 'Disponible'
    }));
    setAppointmentsMap(prev => ({
      ...prev,
      [selectedDate]: daySlots
    }));
    showToast('Tous les créneaux du jour sont cochés comme disponibles !');
  };

  const handleAddAppointmentSubmit = (e) => {
    e.preventDefault();
    const isDispo = (apptStatusChoice === 'dispo');
    const newSlot = {
      id: `slot-${Date.now()}`,
      time: apptTime,
      client: apptClient.trim() || 'Créneau Libre',
      service: apptService,
      agent: apptAgent,
      isAvailable: isDispo,
      status: isDispo ? 'Disponible' : 'Réservé'
    };

    const currentSlots = appointmentsMap[selectedDate] || [];
    const updated = [...currentSlots, newSlot].sort((a, b) => a.time.localeCompare(b.time));

    setAppointmentsMap(prev => ({
      ...prev,
      [selectedDate]: updated
    }));

    setIsApptModalOpen(false);
    setApptClient('');
    showToast(`Créneau "${apptTime}" planifié pour le ${selectedDate} !`);
  };

  // Créneaux par défaut si non configuré
  const currentDaySlots = appointmentsMap[selectedDate] || [
    { id: `slot-${selectedDate}-1`, time: '09:00 - 09:45', client: 'Créneau Libre', service: '🎓 Consultation Études / Billetterie', agent: 'Amadou Diallo', isAvailable: true, status: 'Disponible' },
    { id: `slot-${selectedDate}-2`, time: '11:00 - 11:45', client: 'Créneau Libre', service: '✈️ Accueil Agence & Réservations', agent: 'Fatou Sow', isAvailable: true, status: 'Disponible' },
    { id: `slot-${selectedDate}-3`, time: '15:00 - 15:45', client: 'Créneau Libre', service: '🛂 Information & Dépôt Visa', agent: 'Cheikh Ndiaye', isAvailable: true, status: 'Disponible' }
  ];

  const availableSlotsCount = currentDaySlots.filter(s => s.isAvailable).length;

  const dateObj = new Date(selectedDate + 'T00:00:00');
  const selectedDayFormatted = !isNaN(dateObj) 
    ? `${dayNamesFr[dateObj.getDay()]} ${dateObj.getDate()} ${monthNamesFr[dateObj.getMonth()]} ${dateObj.getFullYear()}`
    : selectedDate;

  // KPI Cards avec données réelles calculées
  const kpis = [
    { 
      label: 'Dossiers actifs', 
      value: `${activeDossiersCount}`, 
      sub: `${dossiers.length} au total`, 
      color: 'text-[#0F766E]', 
      bg: 'bg-teal-50/70 border-teal-200/80',
      path: '/app/dossiers'
    },
    { 
      label: 'Clients enregistrés', 
      value: `${clients.length}`, 
      sub: `Actifs dans l'annuaire`, 
      color: 'text-slate-900', 
      bg: 'bg-white border-slate-200',
      path: '/app/clients'
    },
    { 
      label: 'Échéances sous 48h', 
      value: `${urgentCount}`, 
      sub: 'Options & Visas prioritaires', 
      color: 'text-amber-800', 
      bg: 'bg-amber-50/70 border-amber-200',
      path: '/app/dossiers'
    },
    { 
      label: 'Total Encaissé', 
      value: formatMoney(totalCollectedAmount), 
      sub: `Sur ${formatMoney(totalSalesAmount)} facturés`, 
      color: 'text-emerald-700', 
      bg: 'bg-emerald-50/70 border-emerald-200',
      path: '/app/paiements'
    },
    { 
      label: 'Visas en cours', 
      value: `${visas.filter(v => v.status !== 'Délivré').length}`, 
      sub: `${visas.length} dossiers consulaires`, 
      color: 'text-indigo-800', 
      bg: 'bg-indigo-50/70 border-indigo-200',
      path: '/app/visas'
    },
    { 
      label: 'Documents archivés', 
      value: `${documents.length}`, 
      sub: 'Passeports, billets & attestations', 
      color: 'text-slate-800', 
      bg: 'bg-white border-slate-200',
      path: '/app/documents'
    }
  ];

  // 4 derniers dossiers
  const recentDossiers = dossiers.slice(0, 5);

  // Soumission Nouveau Client Rapide
  const handleFastClient = async (e) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) return;

    try {
      const newCli = await addClient({
        name: clientName.trim(),
        phone: clientPhone.trim()
      });

      setClientName('');
      setClientPhone('');
      setIsClientModalOpen(false);
      showToast(`Client ${newCli?.name || clientName} ajouté à l'annuaire !`);
    } catch (err) {
      alert(err.message || 'Erreur lors de l’ajout du client.');
    }
  };

  // Soumission Document Rapide
  const handleFastDoc = async (e) => {
    e.preventDefault();
    if (!docName.trim()) return;

    try {
      const selDossier = dossiers.find(d => d.id === docDossierId || d.dbId === docDossierId);

      await addDocument({
        name: docName.endsWith('.pdf') ? docName : `${docName}.pdf`,
        type: docType,
        client: selDossier ? selDossier.client : 'Client général',
        dossierId: docDossierId || '',
        size: '1.2 MB'
      });

      setDocName('');
      setDocDossierId('');
      setIsDocModalOpen(false);
      showToast('Document téléversé avec succès !');
    } catch (err) {
      alert(err.message || 'Erreur lors de l’envoi du document.');
    }
  };

  // Soumission Paiement Rapide
  const handleFastPayment = async (e) => {
    e.preventDefault();
    const amt = parseInt(payAmount, 10);
    if (isNaN(amt) || amt <= 0) return;

    try {
      const selDossier = dossiers.find(d => d.id === payDossierId || d.dbId === payDossierId);

      await addPayment({
        dossierId: payDossierId,
        client: selDossier ? selDossier.client : 'Client direct',
        amount: amt,
        method: payMethod
      });

      setPayAmount('');
      setPayDossierId('');
      setIsPayModalOpen(false);
      showToast(`Encaissement de ${formatMoney(amt)} validé !`);
    } catch (err) {
      alert(err.message || 'Erreur lors de l’encaissement.');
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

      {/* En-tête de bienvenue */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold font-title text-slate-900">
            Bonjour, {user.fullName.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Voici le résumé d'activité en temps réel de votre agence <strong className="text-slate-800">{agency.name}</strong>.
          </p>
        </div>

        {/* Barre des Actions Rapides Fonctionnelles */}
        <div className="flex flex-wrap items-center gap-2">

          {canIssueTickets && (
            <button
              onClick={() => setIsClientModalOpen(true)}
              className="fluent-btn px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-slate-500" />
              <span>+ Nouveau Client</span>
            </button>
          )}

          {canIssueTickets && (
            <button
              onClick={() => setIsDocModalOpen(true)}
              className="fluent-btn px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
              <span>+ Document</span>
            </button>
          )}

          {canManageFinance && (
            <button
              onClick={() => setIsPayModalOpen(true)}
              className="fluent-btn px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-slate-500" />
              <span>+ Encaisser</span>
            </button>
          )}
        </div>
      </div>

      {/* Grille des 6 Métriques Clés (KPIs Connectés) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {kpis.map((st, idx) => (
          <Link 
            key={idx} 
            to={st.path}
            className={`p-4 rounded-2xl border shadow-xs ${st.bg} flex flex-col justify-between hover:shadow-md transition-all group`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">{st.label}</span>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="my-1.5">
              <span className={`text-xl sm:text-2xl font-extrabold font-mono ${st.color}`}>
                {st.value}
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-400 truncate">{st.sub}</span>
          </Link>
        ))}
      </div>

      {/* Bloc Alertes Échéances < 48h */}
      {urgentCount > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg shrink-0">
              ⏰
            </div>
            <div>
              <h2 className="text-xs font-bold text-amber-900">
                {urgentCount} dossier{urgentCount > 1 ? 's nécessitent' : ' nécessite'} une action sous 48h
              </h2>
              <p className="text-xs text-amber-700">
                Vérifiez les options de vols arrivant à expiration ou les documents consulaires requis.
              </p>
            </div>
          </div>
          <Link
            to="/app/dossiers"
            className="fluent-btn px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 shadow-xs"
          >
            Consulter les urgences
          </Link>
        </div>
      )}

      {/* ================= SECTION APERÇU : VISAS ÉTUDIANTS ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-tukki-teal flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[22px]">school</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Visas étudiants & Procédures internationales</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                  Pôle Études
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Suivi des candidatures, admissions obtenues et dossiers consulaires par pays
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/app/student-visas"
              className="fluent-btn px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Voir les visas étudiants</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/app/student-visas"
              className="fluent-btn px-3.5 py-2 rounded-xl bg-tukki-teal hover:bg-tukki-teal-dark text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Ajouter un candidat</span>
            </Link>
          </div>
        </div>

        {/* 6 mini KPI cards de l'aperçu */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Candidats</span>
            <span className="text-lg font-bold font-title text-slate-900">{studentCandidatesCount}</span>
            <span className="text-[10px] text-slate-400 block">étudiants inscrits</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100">
            <span className="text-[10px] uppercase font-bold text-amber-600 block">Dossiers actifs</span>
            <span className="text-lg font-bold font-title text-amber-800">{studentActiveCount}</span>
            <span className="text-[10px] text-amber-700 block">en cours</span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100">
            <span className="text-[10px] uppercase font-bold text-indigo-600 block">Admissions</span>
            <span className="text-lg font-bold font-title text-indigo-800">{studentAdmissionsCount}</span>
            <span className="text-[10px] text-indigo-700 block">obtenues</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100">
            <span className="text-[10px] uppercase font-bold text-purple-600 block">Visas en cours</span>
            <span className="text-lg font-bold font-title text-purple-800">{studentVisasInProgressCount}</span>
            <span className="text-[10px] text-purple-700 block">en instruction</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block">Visas obtenus</span>
            <span className="text-lg font-bold font-title text-emerald-800">{studentVisasObtainedCount}</span>
            <span className="text-[10px] text-emerald-700 block">approuvés</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100">
            <span className="text-[10px] uppercase font-bold text-rose-600 block">Actions requises</span>
            <span className="text-lg font-bold font-title text-rose-800">{studentActionsRequiredCount}</span>
            <span className="text-[10px] text-rose-700 block">à traiter</span>
          </div>
      </div>

      {/* ============================================================== */}
      {/* NOUVEAU MODULE : AGENDA & RENDEZ-VOUS DISPONIBLES DANS LE MOIS */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-tukki-teal flex items-center justify-center font-bold shadow-2xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Agenda & Rendez-vous en Agence</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                  Disponibilités
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Consultez n'importe quel mois, cochez les créneaux disponibles et planifiez les entretiens clients
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsApptModalOpen(true)}
              className="fluent-btn px-3.5 py-2 rounded-xl bg-tukki-teal hover:bg-tukki-teal-dark text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Planifier un RDV</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLONNE GAUCHE : WIDGET CALENDRIER SOMBRE ÉLÉGANT TUKKIPRO */}
          <div className="lg:col-span-5 bg-[#0F172A] rounded-[2rem] p-6 shadow-2xl border border-slate-800 relative overflow-hidden text-white flex flex-col justify-between min-h-[380px]">
            {/* Ligne Subtile TukkiPro Teal / Gold */}
            <div className="w-20 h-1 mx-auto bg-gradient-to-r from-transparent via-tukki-gold to-transparent rounded-full shadow-[0_0_14px_rgba(245,158,11,0.8)] mb-3"></div>

            {/* Navigation Mois & Année */}
            <div className="flex items-center justify-between px-2 mb-4">
              <button
                onClick={handlePrevMonth}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Mois précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="text-center">
                <span className="text-base font-bold font-title tracking-wide text-white block">
                  {monthNamesEn[calMonth]} {calYear}
                </span>
                <span className="text-[10px] text-teal-300 font-mono">
                  Cliquez sur un jour
                </span>
              </div>

              <button
                onClick={handleNextMonth}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Mois suivant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* En-tête des jours de la semaine (MON TUE WED THU FRI SAT SUN) */}
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-zinc-400 tracking-wider mb-2">
              <div>MON</div>
              <div>TUE</div>
              <div>WED</div>
              <div>THU</div>
              <div>FRI</div>
              <div>SAT</div>
              <div>SUN</div>
            </div>

            {/* Grille des Jours du Mois */}
            {(() => {
              const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();
              const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
              const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
              const daysInPrevMonth = new Date(calYear, calMonth, 0).getDate();

              const cells = [];
              // Jours précédents estompés
              for (let i = startOffset - 1; i >= 0; i--) {
                const d = daysInPrevMonth - i;
                cells.push(
                  <div key={`prev-${d}`} className="h-8 flex items-center justify-center text-zinc-600 select-none text-xs">
                    {d}
                  </div>
                );
              }

              // Jours du mois courant
              const selParts = selectedDate.split('-');
              const selY = parseInt(selParts[0], 10);
              const selM = parseInt(selParts[1], 10) - 1;
              const selD = parseInt(selParts[2], 10);

              for (let d = 1; d <= daysInMonth; d++) {
                const dateKey = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const isSelected = selY === calYear && selM === calMonth && selD === d;
                const daySlots = appointmentsMap[dateKey] || [];
                const hasAvail = daySlots.some(s => s.isAvailable);
                const hasBooked = daySlots.some(s => !s.isAvailable);

                cells.push(
                  <div key={`cur-${d}`} className="h-8 flex items-center justify-center">
                    <button
                      onClick={() => setSelectedDate(dateKey)}
                      className={`w-8 h-8 rounded-full flex flex-col items-center justify-center mx-auto transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-tukki-teal text-white font-extrabold shadow-[0_0_16px_rgba(15,118,110,0.9)] ring-2 ring-teal-400 scale-105'
                          : 'hover:bg-white/10 text-zinc-300 hover:text-white'
                      }`}
                    >
                      <span className="leading-none text-xs">{d}</span>
                      {!isSelected && (
                        hasAvail ? (
                          <span className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5"></span>
                        ) : hasBooked ? (
                          <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5"></span>
                        ) : null
                      )}
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-7 gap-y-1.5 text-center text-xs font-medium">
                  {cells}
                </div>
              );
            })()}

            {/* Légende Discrète Bas de Carte */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-400 px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-tukki-teal shadow-[0_0_8px_#0F766E]"></span>
                <span>Jour sélectionné</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Créneaux disponibles</span>
              </span>
            </div>
          </div>

          {/* COLONNE DROITE : CRÉNEAUX & RDV DISPONIBLES DU JOUR SÉLECTIONNÉ */}
          <div className="lg:col-span-7 bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/70">
              <div>
                <span className="text-[10px] uppercase font-bold text-tukki-teal tracking-wider block">Détail des créneaux</span>
                <h3 className="text-sm font-bold text-slate-900">
                  Rendez-vous du {selectedDayFormatted}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  availableSlotsCount > 0
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-rose-100 text-rose-800 border-rose-200'
                }`}>
                  {availableSlotsCount > 0 
                    ? `${availableSlotsCount} créneau${availableSlotsCount > 1 ? 'x' : ''} disponible${availableSlotsCount > 1 ? 's' : ''}`
                    : 'Tous les créneaux sont réservés'}
                </span>
              </div>
            </div>

            {/* Consigne d'usage : cocher pour marquer dispo */}
            <div className="p-2.5 rounded-xl bg-teal-50/80 border border-teal-100 text-[11px] text-teal-900 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-tukki-teal shrink-0" />
                <span><strong>Consigne :</strong> Cochez ou décochez les cases pour ouvrir ou bloquer les créneaux de rendez-vous.</span>
              </span>
              <button
                onClick={markAllDaySlotsAvailable}
                className="text-tukki-teal hover:underline font-bold text-[10px] shrink-0 cursor-pointer"
              >
                Tout cocher dispo
              </button>
            </div>

            {/* Liste des Créneaux du Jour avec Cases à Cocher */}
            <div className="space-y-2.5 text-xs max-h-[300px] overflow-y-auto pr-1">
              {currentDaySlots.map((slot) => {
                const isDispo = slot.isAvailable;
                return (
                  <div
                    key={slot.id}
                    className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isDispo 
                        ? 'bg-white border-slate-200/80 hover:border-teal-300 shadow-2xs' 
                        : 'bg-slate-100/70 border-slate-200/50 opacity-90'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <label className="relative flex items-center cursor-pointer p-1" title="Cocher pour marquer ce créneau comme disponible">
                        <input
                          type="checkbox"
                          checked={isDispo}
                          onChange={() => toggleSlotAvailability(slot.id)}
                          className="w-5 h-5 rounded-lg text-tukki-teal border-slate-300 focus:ring-teal-500 cursor-pointer accent-tukki-teal"
                        />
                      </label>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold text-xs ${isDispo ? 'text-tukki-teal' : 'text-slate-700'}`}>
                            {slot.time}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                            isDispo 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {isDispo ? '✓ Disponible (Coché)' : '● Réservé'}
                          </span>
                        </div>
                        <div className="font-semibold text-slate-800 text-xs mt-0.5">{slot.service}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="font-medium text-slate-600">{slot.client}</span>
                          <span>•</span>
                          <span>Conseiller : {slot.agent}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => toggleSlotAvailability(slot.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                          isDispo 
                            ? 'text-slate-600 hover:bg-slate-100 border-slate-200' 
                            : 'text-tukki-teal hover:bg-teal-50 border-teal-200 font-bold'
                        }`}
                      >
                        {isDispo ? 'Bloquer / Réserver' : 'Ouvrir en Dispo'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions Bas de Créneaux */}
            <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-medium">
                {currentDaySlots.length} créneaux configurés pour ce jour
              </span>
              <button
                onClick={() => setIsApptModalOpen(true)}
                className="text-tukki-teal hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>+ Ajouter un créneau à cette date</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL PLANIFIER UN RENDEZ-VOUS ================= */}
      {isApptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 relative">
            <button 
              onClick={() => setIsApptModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-8 rounded-xl bg-teal-50 text-tukki-teal flex items-center justify-center font-bold">
                <Calendar className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-base text-slate-900">Planifier un Rendez-vous</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Créneau d'accueil passager ou entretien visa en agence.
            </p>

            <form onSubmit={handleAddAppointmentSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom du client ou de l'étudiant *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Moussa Fofana ou Laisser vide si créneau libre"
                  value={apptClient}
                  onChange={(e) => setApptClient(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Heure / Créneau *</label>
                  <select
                    value={apptTime}
                    onChange={(e) => setApptTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs bg-white font-mono"
                  >
                    <option value="09:00 - 09:45">09:00 - 09:45</option>
                    <option value="10:00 - 10:45">10:00 - 10:45</option>
                    <option value="11:00 - 11:45">11:00 - 11:45</option>
                    <option value="14:00 - 14:45">14:00 - 14:45</option>
                    <option value="15:00 - 15:45">15:00 - 15:45</option>
                    <option value="16:00 - 16:45">16:00 - 16:45</option>
                    <option value="17:00 - 17:45">17:00 - 17:45</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Disponibilité *</label>
                  <select
                    value={apptStatusChoice}
                    onChange={(e) => setApptStatusChoice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs bg-white"
                  >
                    <option value="dispo">🟢 Disponible (À réserver)</option>
                    <option value="booked">🔵 Confirmé & Réservé</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Motif de la rencontre *</label>
                <select
                  value={apptService}
                  onChange={(e) => setApptService(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs bg-white"
                >
                  <option value="🎓 Orientation & Visa Étudiant">🎓 Orientation & Visa Étudiant</option>
                  <option value="✈️ Réservation Billetterie & GDS">✈️ Réservation Billetterie</option>
                  <option value="🕋 Procédure Omra / Hadj">🕋 Procédure Omra / Hadj</option>
                  <option value="🛂 Dépôt Dossier Visa Tourisme">🛂 Dossier Visa Tourisme</option>
                  <option value="💼 Corporate & Déplacement Pro">💼 Déplacement Entreprise</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Conseiller assigné</label>
                <select
                  value={apptAgent}
                  onChange={(e) => setApptAgent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs bg-white"
                >
                  <option value="Amadou Diallo">Amadou Diallo (Billetterie)</option>
                  <option value="Fatou Sow">Fatou Sow (Visas Étudiants)</option>
                  <option value="Cheikh Ndiaye">Cheikh Ndiaye (Conseiller Voyages)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsApptModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="fluent-btn px-4 py-2 rounded-xl bg-tukki-teal hover:bg-tukki-teal-dark text-white font-bold cursor-pointer"
                >
                  Créer le Créneau
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tableau des Dossiers Récents (Connecté en direct) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Dossiers récents en cours</h2>
            <p className="text-xs text-slate-400">Dernières réservations et dossiers créés</p>
          </div>
          <Link to="/app/dossiers" className="text-xs font-bold text-[#0F766E] hover:underline flex items-center gap-1">
            <span>Voir tous les dossiers ({dossiers.length})</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 uppercase font-semibold border-b border-slate-100 pb-2">
                <th className="py-2.5 px-3">Réf</th>
                <th className="py-2.5 px-3">Client</th>
                <th className="py-2.5 px-3">Itinéraire</th>
                <th className="py-2.5 px-3">Statut</th>
                <th className="py-2.5 px-3 text-right">Montant</th>
                <th className="py-2.5 px-3 text-right">Solde Payé</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentDossiers.map((file) => (
                <tr key={file.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    <Link to={`/app/dossiers/${file.id}`} className="hover:text-[#0F766E]">
                      {file.id}
                    </Link>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{file.client}</td>
                  <td className="py-3 px-3 text-slate-600">{file.route}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${file.badge || 'bg-slate-100 text-slate-700'}`}>
                      {file.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{file.amount}</td>
                  <td className="py-3 px-3 text-right text-emerald-600 font-semibold font-mono">{file.paid || '0%'}</td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      to={`/app/dossiers/${file.id}`}
                      className="text-[#0F766E] font-bold hover:underline"
                    >
                      Ouvrir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL NOUVEAU CLIENT RAPIDE ================= */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 relative">
            <button 
              onClick={() => setIsClientModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
            <h3 className="font-bold text-base text-slate-900 mb-1">Nouveau Client</h3>
            <p className="text-xs text-slate-500 mb-4">
              Ajout direct d'un contact dans l'annuaire de l'agence.
            </p>

            <form onSubmit={handleFastClient} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom complet ou Titre *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ibrahima Ndiaye"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Numéro WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="+221 77 000 00 00"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="fluent-btn px-4 py-2 rounded-xl bg-[#0F766E] text-white font-bold"
                >
                  Créer le Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL AJOUT DOCUMENT RAPIDE ================= */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 relative">
            <button 
              onClick={() => setIsDocModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
            <h3 className="font-bold text-base text-slate-900 mb-1">Téléverser un Document</h3>
            <p className="text-xs text-slate-500 mb-4">
              Numérisation de passeport, visa, billet ou assurance.
            </p>

            <form onSubmit={handleFastDoc} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom du fichier *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Passeport_Client.pdf"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rattacher à un dossier</label>
                <select
                  value={docDossierId}
                  onChange={(e) => setDocDossierId(e.target.value)}
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
                <label className="block font-semibold text-slate-700 mb-1">Type de document</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option>Passeport</option>
                  <option>Billet électronique</option>
                  <option>E-Visa / Visa</option>
                  <option>Assurance</option>
                  <option>Autre pièce</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="fluent-btn px-4 py-2 rounded-xl bg-[#0F766E] text-white font-bold"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL ENCAISSER PAIEMENT RAPIDE ================= */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 relative">
            <button 
              onClick={() => setIsPayModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
            <h3 className="font-bold text-base text-slate-900 mb-1">Encaisser un Paiement</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enregistrement d'un règlement d'acompte ou solde client.
            </p>

            <form onSubmit={handleFastPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dossier concerné *</label>
                <select
                  required
                  value={payDossierId}
                  onChange={(e) => setPayDossierId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="">-- Choisir le dossier --</option>
                  {dossiers.map(d => (
                    <option key={d.id} value={d.id}>
                      #{d.id} • {d.client} (Total: {d.amount} • Reste: {formatMoney(Math.max(0, (d.totalAmount || 0) - (d.paidAmount || 0)))})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Montant reçu (FCFA) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Ex: 750000"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Moyen de règlement</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option>Virement Bancaire</option>
                  <option>Orange Money</option>
                  <option>Wave Sénégal</option>
                  <option>Chèque certifié</option>
                  <option>Espèces en agence</option>
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
                  Valider le Paiement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
