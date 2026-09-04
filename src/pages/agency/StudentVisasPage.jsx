import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';

const PIPELINE_STAGES = [
  'Nouveau candidat',
  'Dossier en préparation',
  'Documents incomplets',
  'Candidature envoyée',
  'En attente d\'admission',
  'Admission obtenue',
  'Préparation visa',
  'Visa déposé',
  'Visa en cours',
  'Visa obtenu',
  'Visa refusé',
  'Départ confirmé',
  'Dossier terminé',
  'Dossier abandonné'
];

const TARGET_COUNTRIES = [
  { name: 'Canada', flag: '🇨🇦', code: 'CA' },
  { name: 'France', flag: '🇫🇷', code: 'FR' },
  { name: 'États-Unis', flag: '🇺🇸', code: 'US' },
  { name: 'Royaume-Uni', flag: '🇬🇧', code: 'GB' },
  { name: 'Belgique', flag: '🇧🇪', code: 'BE' },
  { name: 'Allemagne', flag: '🇩🇪', code: 'DE' },
  { name: 'Italie', flag: '🇮🇹', code: 'IT' },
  { name: 'Espagne', flag: '🇪🇸', code: 'ES' },
  { name: 'Australie', flag: '🇦🇺', code: 'AU' },
  { name: 'Autres', flag: '🌍', code: 'OT' }
];

export default function StudentVisasPage() {
  const {
    studentFiles,
    studentInstitutions,
    clients,
    studentCandidatesCount,
    studentActiveCount,
    studentAdmissionsCount,
    studentVisasInProgressCount,
    studentVisasObtainedCount,
    studentActionsRequiredCount,
    addStudentFile,
    updateStudentFile,
    deleteStudentFile,
    addStudentDocument,
    formatMoney,
    isLoading
  } = useData();

  const { user } = useAuth();

  // Filtres et recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('Tous');
  const [selectedStage, setSelectedStage] = useState('Tous');
  const [selectedIntake, setSelectedIntake] = useState('Tous');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' ou 'table'

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // État formulaire nouveau candidat
  const [clientMode, setClientMode] = useState('new'); // 'new' ou 'existing'
  const [selectedClientId, setSelectedClientId] = useState('');
  const [formData, setFormData] = useState({
    candidateName: '',
    candidatePhone: '',
    candidateEmail: '',
    candidatePassport: '',
    candidateCity: 'Dakar',
    candidateCountry: 'Sénégal',
    targetCountry: 'Canada',
    targetInstitution: 'Université de Montréal',
    targetProgram: '',
    targetDegreeLevel: 'Licence / Bachelor',
    intakeSession: 'Automne 2026',
    expectedDepartureDate: '',
    educationLevel: 'Baccalauréat',
    fieldOfStudy: '',
    previousInstitution: '',
    diplomaObtained: '',
    academicYear: '2025-2026',
    gradesSummary: '',
    status: 'Nouveau candidat',
    admissionStatus: 'Brouillon',
    visaType: 'Permis d\'études / Visa D',
    visaCenter: 'Campus France / VFS / Ambassade',
    actionRequired: 'Collecte initiale des diplômes et relevés de notes',
    actionDueDate: '',
    totalFee: 500000,
    paidFee: 0,
    notes: ''
  });

  // Nouveau document à attacher dans le modal détail
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState('Diplômes');

  // Filtrage combiné réactif
  const filteredFiles = useMemo(() => {
    return studentFiles.filter(sf => {
      // 1. Recherche textuelle
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || (
        (sf.candidateName && sf.candidateName.toLowerCase().includes(q)) ||
        (sf.id && sf.id.toLowerCase().includes(q)) ||
        (sf.candidatePhone && sf.candidatePhone.toLowerCase().includes(q)) ||
        (sf.candidateEmail && sf.candidateEmail.toLowerCase().includes(q)) ||
        (sf.targetInstitution && sf.targetInstitution.toLowerCase().includes(q)) ||
        (sf.targetProgram && sf.targetProgram.toLowerCase().includes(q))
      );

      // 2. Filtre pays
      const matchCountry = selectedCountry === 'Tous' || sf.targetCountry === selectedCountry;

      // 3. Filtre étape du pipeline
      const matchStage = selectedStage === 'Tous' || sf.status === selectedStage;

      // 4. Filtre rentrée
      const matchIntake = selectedIntake === 'Tous' || (sf.intakeSession && sf.intakeSession.includes(selectedIntake));

      return matchQuery && matchCountry && matchStage && matchIntake;
    });
  }, [studentFiles, searchQuery, selectedCountry, selectedStage, selectedIntake]);

  // Récupérer le drapeau d'un pays
  const getCountryFlag = (countryName) => {
    const c = TARGET_COUNTRIES.find(tc => tc.name.toLowerCase() === (countryName || '').toLowerCase());
    return c ? c.flag : '🌍';
  };

  // Soumission nouveau candidat
  const handleSubmitNewCandidate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        clientId: clientMode === 'existing' ? selectedClientId : null
      };
      await addStudentFile(payload);
      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      alert('Erreur lors de l\'enregistrement du candidat: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      candidateName: '',
      candidatePhone: '',
      candidateEmail: '',
      candidatePassport: '',
      candidateCity: 'Dakar',
      candidateCountry: 'Sénégal',
      targetCountry: 'Canada',
      targetInstitution: 'Université de Montréal',
      targetProgram: '',
      targetDegreeLevel: 'Licence / Bachelor',
      intakeSession: 'Automne 2026',
      expectedDepartureDate: '',
      educationLevel: 'Baccalauréat',
      fieldOfStudy: '',
      previousInstitution: '',
      diplomaObtained: '',
      academicYear: '2025-2026',
      gradesSummary: '',
      status: 'Nouveau candidat',
      admissionStatus: 'Brouillon',
      visaType: 'Permis d\'études / Visa D',
      visaCenter: 'Campus France / VFS / Ambassade',
      actionRequired: 'Collecte initiale des diplômes et relevés de notes',
      actionDueDate: '',
      totalFee: 500000,
      paidFee: 0,
      notes: ''
    });
    setSelectedClientId('');
    setClientMode('new');
  };

  // Changement de statut dans le modal détail
  const handleStatusChange = async (newStatus) => {
    if (!selectedFile) return;
    try {
      await updateStudentFile(selectedFile.id, { status: newStatus });
      setSelectedFile(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      alert('Erreur mise à jour statut: ' + err.message);
    }
  };

  // Ajout de document dans le modal détail
  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!selectedFile || !newDocName.trim()) return;
    try {
      const doc = await addStudentDocument({
        studentFileId: selectedFile.dbId || selectedFile.id,
        name: newDocName.trim(),
        type: newDocType
      });
      setSelectedFile(prev => ({
        ...prev,
        documents: [doc, ...(prev.documents || [])]
      }));
      setNewDocName('');
    } catch (err) {
      alert('Erreur ajout document: ' + err.message);
    }
  };

  // Suppression d'un dossier
  const handleDeleteFile = async (file) => {
    if (window.confirm(`Confirmez-vous la suppression du dossier étudiant ${file.id} de ${file.candidateName} ?`)) {
      try {
        await deleteStudentFile(file.id);
        if (selectedFile?.id === file.id) {
          setIsDetailModalOpen(false);
          setSelectedFile(null);
        }
      } catch (err) {
        alert('Erreur suppression: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* ================= 1. EN-TÊTE PROFESSIONNEL ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-teal-50 text-tukki-teal flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">school</span>
            </span>
            <div>
              <h1 className="text-2xl font-black font-title text-slate-900 tracking-tight">
                Visas étudiants
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Suivez les candidatures, admissions et procédures de visa de vos étudiants.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/70">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              Cartes
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">table_rows</span>
              Tableau
            </button>
          </div>

          <a
            href="#/app"
            className="btn-fluent px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-teal-50 hover:text-tukki-teal text-slate-700 font-bold text-xs border border-slate-200/80 flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
            title="Consulter l'agenda et les créneaux disponibles"
          >
            <span className="material-symbols-outlined text-[18px] text-tukki-teal">calendar_month</span>
            <span>Agenda & RDV</span>
          </a>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-fluent px-5 py-2.5 rounded-2xl bg-tukki-teal hover:bg-tukki-teal-dark text-white font-bold text-xs shadow-md shadow-teal-700/10 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>+ Ajouter un candidat</span>
          </button>
        </div>
      </div>

      {/* ================= 2. 6 KPIS CALCULÉS EN TEMPS RÉEL ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1 : Candidats */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Candidats</span>
            <span className="w-7 h-7 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">groups</span>
            </span>
          </div>
          <div className="text-2xl font-black font-title text-slate-900">{studentCandidatesCount}</div>
          <p className="text-[10px] text-slate-400 mt-1">Total dossiers enregistrés</p>
        </div>

        {/* KPI 2 : Dossiers actifs */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Dossiers actifs</span>
            <span className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">pending_actions</span>
            </span>
          </div>
          <div className="text-2xl font-black font-title text-amber-700">{studentActiveCount}</div>
          <p className="text-[10px] text-slate-400 mt-1">En cours d'accompagnement</p>
        </div>

        {/* KPI 3 : Admissions */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Admissions</span>
            <span className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">verified</span>
            </span>
          </div>
          <div className="text-2xl font-black font-title text-indigo-700">{studentAdmissionsCount}</div>
          <p className="text-[10px] text-slate-400 mt-1">Offres obtenues</p>
        </div>

        {/* KPI 4 : Visas en cours */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Visas en cours</span>
            <span className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">assignment_turned_in</span>
            </span>
          </div>
          <div className="text-2xl font-black font-title text-purple-700">{studentVisasInProgressCount}</div>
          <p className="text-[10px] text-slate-400 mt-1">En instruction consulaire</p>
        </div>

        {/* KPI 5 : Visas obtenus */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Visas obtenus</span>
            <span className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">flight_takeoff</span>
            </span>
          </div>
          <div className="text-2xl font-black font-title text-emerald-700">{studentVisasObtainedCount}</div>
          <p className="text-[10px] text-slate-400 mt-1">Visas délivrés avec succès</p>
        </div>

        {/* KPI 6 : Actions requises */}
        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-rose-50/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Actions requises</span>
            <span className="w-7 h-7 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center animate-pulse">
              <span className="material-symbols-outlined text-[16px]">warning</span>
            </span>
          </div>
          <div className="text-2xl font-black font-title text-rose-700">{studentActionsRequiredCount}</div>
          <p className="text-[10px] text-rose-600 font-semibold mt-1">Interventions urgentes</p>
        </div>
      </div>

      {/* ================= 3. PIPELINE DU PARCOURS ÉTUDIANT ================= */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tukki-teal text-[20px]">conversion_path</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Pipeline des Candidats — Parcours & Statuts
            </h3>
          </div>
          {selectedStage !== 'Tous' && (
            <button
              onClick={() => setSelectedStage('Tous')}
              className="text-xs text-tukki-teal font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Réinitialiser filtre étape ({selectedStage})</span>
              <span>✕</span>
            </button>
          )}
        </div>

        {/* Grille horizontale des 14 étapes du parcours avec défilement ultra-fluide */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scroll-smooth -mx-1 px-1 overscroll-x-contain">
          {PIPELINE_STAGES.map((stage, idx) => {
            const count = studentFiles.filter(sf => sf.status === stage).length;
            const isSelected = selectedStage === stage;
            return (
              <button
                key={stage}
                onClick={() => setSelectedStage(isSelected ? 'Tous' : stage)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-2xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 select-none ${
                  isSelected
                    ? 'bg-tukki-teal text-white border-tukki-teal shadow-md shadow-teal-700/20 scale-[1.02]'
                    : 'bg-slate-50/90 hover:bg-slate-100 text-slate-700 border-slate-200/80 hover:border-teal-200'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-slate-200/90 text-slate-700'
                }`}>
                  {idx + 1}
                </span>
                <span className="whitespace-nowrap">{stage}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold font-mono ${
                  isSelected ? 'bg-white text-tukki-teal' : 'bg-slate-200 text-slate-800'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= 4. RECHERCHE & FILTRES MULTI-CRITÈRES ================= */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Recherche textuelle */}
          <div className="md:col-span-4 relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone, email, référence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Filtre Pays */}
          <div className="md:col-span-3">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
            >
              <option value="Tous">🌍 Tous les pays cibles</option>
              {TARGET_COUNTRIES.map(tc => (
                <option key={tc.name} value={tc.name}>
                  {tc.flag} {tc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre Statut */}
          <div className="md:col-span-3">
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
            >
              <option value="Tous">📊 Tous les statuts</option>
              {PIPELINE_STAGES.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Filtre Session de Rentrée */}
          <div className="md:col-span-2">
            <select
              value={selectedIntake}
              onChange={(e) => setSelectedIntake(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
            >
              <option value="Tous">🗓 Rentrée</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="Automne">Automne</option>
              <option value="Septembre">Septembre</option>
              <option value="Hiver">Hiver / Janvier</option>
            </select>
          </div>
        </div>

        {/* Tags de pays rapides */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 scrollbar-none">
          <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 flex-shrink-0">Pays :</span>
          <button
            onClick={() => setSelectedCountry('Tous')}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex-shrink-0 transition-all cursor-pointer ${
              selectedCountry === 'Tous' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous
          </button>
          {TARGET_COUNTRIES.map(c => (
            <button
              key={c.name}
              onClick={() => setSelectedCountry(c.name)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex-shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
                selectedCountry === c.name ? 'bg-tukki-teal text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ================= 5. AFFICHAGE DES DOSSIERS CANDIDATS ================= */}
      {filteredFiles.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-tukki-teal mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">school</span>
          </div>
          <h3 className="text-base font-bold text-slate-800">Aucun candidat étudiant trouvé</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Aucun dossier ne correspond à vos filtres actuels. Réinitialisez les filtres ou enregistrez votre premier candidat.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCountry('Tous');
              setSelectedStage('Tous');
              setSelectedIntake('Tous');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer mr-2"
          >
            Réinitialiser les filtres
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-tukki-teal text-white text-xs font-bold hover:bg-tukki-teal-dark transition-colors cursor-pointer"
          >
            + Ajouter mon premier candidat
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* VUE EN CARTES INTERACTIVES */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredFiles.map(file => (
            <div
              key={file.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* En-tête de carte */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCountryFlag(file.targetCountry)}</span>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-tukki-teal uppercase tracking-wider block">
                        {file.id}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm font-title leading-snug group-hover:text-tukki-teal transition-colors">
                        {file.candidateName}
                      </h4>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border ${file.statusBadge}`}>
                    {file.status}
                  </span>
                </div>

                {/* Université & Programme visé */}
                <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 truncate">{file.targetInstitution}</span>
                    <span className="text-[10px] font-mono font-semibold text-slate-500">{file.targetCountry}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium truncate">
                    {file.targetProgram || 'Programme non spécifié'}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
                    <span>{file.targetDegreeLevel}</span>
                    <span>•</span>
                    <span>Rentrée : {file.intakeSession}</span>
                  </div>
                </div>

                {/* Statut Admission & Visa */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Admission</span>
                    <span className="font-bold text-slate-800 block truncate">{file.admissionStatus}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Procédure Visa</span>
                    <span className="font-bold text-slate-800 block truncate">{file.visaStatus}</span>
                  </div>
                </div>

                {/* Prochaine Action Requise (Si présente) */}
                {file.actionRequired && (
                  <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-100 text-rose-800 text-[11px] flex items-start gap-2">
                    <span className="material-symbols-outlined text-[15px] text-rose-600 flex-shrink-0 mt-0.5">
                      priority_high
                    </span>
                    <div>
                      <span className="font-bold block text-[10px] uppercase tracking-wider text-rose-700">Action à effectuer :</span>
                      <span className="font-medium">{file.actionRequired}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Pied de carte avec actions */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">description</span>
                  <span className="font-bold font-mono">{(file.documents || []).length}</span> doc(s)
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedFile(file);
                      setIsDetailModalOpen(true);
                    }}
                    className="btn-fluent px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-tukki-teal text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Gérer</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                  <button
                    onClick={() => handleDeleteFile(file)}
                    className="w-7 h-7 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                    title="Supprimer"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* VUE EN TABLEAU RÉCAPITULATIF */
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3.5 px-4">Réf & Candidat</th>
                  <th className="py-3.5 px-4">Destination & Université</th>
                  <th className="py-3.5 px-4">Programme & Rentrée</th>
                  <th className="py-3.5 px-4">Statut Pipeline</th>
                  <th className="py-3.5 px-4">Admission</th>
                  <th className="py-3.5 px-4">Visa</th>
                  <th className="py-3.5 px-4">Action Requise</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredFiles.map(file => (
                  <tr key={file.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-tukki-teal text-[11px]">{file.id}</div>
                      <div className="font-bold text-slate-900 text-xs">{file.candidateName}</div>
                      <div className="text-[10px] text-slate-400">{file.candidatePhone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                        <span>{getCountryFlag(file.targetCountry)}</span>
                        <span>{file.targetCountry}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 truncate max-w-[180px]">{file.targetInstitution}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 truncate max-w-[180px]">{file.targetProgram || '—'}</div>
                      <div className="text-[10px] text-slate-400">{file.intakeSession}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border inline-block ${file.statusBadge}`}>
                        {file.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {file.admissionStatus}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{file.visaStatus}</span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">{file.visaCenter}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {file.actionRequired ? (
                        <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 text-[10px] font-semibold border border-rose-100 block truncate max-w-[200px]">
                          {file.actionRequired}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Aucune</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedFile(file);
                            setIsDetailModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-tukki-teal hover:text-white text-slate-700 text-xs font-bold transition-all cursor-pointer"
                        >
                          Détails
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL 1 : AJOUTER UN CANDIDAT ÉTUDIANT ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-2xl bg-teal-50 text-tukki-teal flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">school</span>
                </span>
                <div>
                  <h3 className="text-lg font-bold font-title text-slate-900">
                    Nouveau Dossier d'Études & Visa
                  </h3>
                  <p className="text-xs text-slate-400">
                    Candidature universitaire, admission et accompagnement visa consulaire
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNewCandidate} className="space-y-4 text-xs">
              {/* Choix Client Existant / Nouveau */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                <label className="block font-bold text-slate-700 text-xs">Profil du candidat</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setClientMode('new')}
                    className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer ${
                      clientMode === 'new' ? 'bg-tukki-teal text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    + Créer un nouveau profil client
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientMode('existing')}
                    className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer ${
                      clientMode === 'existing' ? 'bg-tukki-teal text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    Sélectionner un client existant ({clients.length})
                  </button>
                </div>

                {clientMode === 'existing' && (
                  <div className="pt-2">
                    <label className="block font-semibold text-slate-600 mb-1">Sélectionner dans la base agence :</label>
                    <select
                      value={selectedClientId}
                      onChange={(e) => {
                        setSelectedClientId(e.target.value);
                        const c = clients.find(cl => cl.id === e.target.value);
                        if (c) {
                          setFormData(prev => ({
                            ...prev,
                            candidateName: c.name,
                            candidatePhone: c.phone,
                            candidateEmail: c.email,
                            candidatePassport: c.passport,
                            candidateCity: c.city,
                            candidateCountry: c.country
                          }));
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">-- Choisir un client --</option>
                      {clients.map(cl => (
                        <option key={cl.id} value={cl.id}>
                          {cl.name} ({cl.phone} - {cl.city})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* 1. Informations Personnelles */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  1. Identité du Candidat
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nom complet *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Aïssatou Ba"
                      value={formData.candidateName}
                      onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Numéro Téléphone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+221 77 000 00 00"
                      value={formData.candidatePhone}
                      onChange={(e) => setFormData({ ...formData, candidatePhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Adresse Email</label>
                    <input
                      type="email"
                      placeholder="etudiant@domaine.com"
                      value={formData.candidateEmail}
                      onChange={(e) => setFormData({ ...formData, candidateEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">N° Passeport</label>
                    <input
                      type="text"
                      placeholder="SN-1234567"
                      value={formData.candidatePassport}
                      onChange={(e) => setFormData({ ...formData, candidatePassport: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ville & Pays de résidence</label>
                    <input
                      type="text"
                      value={formData.candidateCity + ', ' + formData.candidateCountry}
                      onChange={(e) => setFormData({ ...formData, candidateCity: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Cursus Académique Actuel */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  2. Parcours Académique Antérieur
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Niveau actuel / Dernier diplôme *</label>
                    <select
                      value={formData.educationLevel}
                      onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="Baccalauréat">Baccalauréat</option>
                      <option value="Bac+1 / L1">Bac+1 / Licence 1</option>
                      <option value="Bac+2 / BTS / DUT">Bac+2 / BTS / DUT</option>
                      <option value="Licence 3 / Bachelor">Licence 3 / Bachelor</option>
                      <option value="Master 1">Master 1</option>
                      <option value="Master 2 / Ingénieur">Master 2 / Ingénieur</option>
                      <option value="Doctorat">Doctorat</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Domaine / Série</label>
                    <input
                      type="text"
                      placeholder="Ex: Sciences, Gestion, Informatique"
                      value={formData.fieldOfStudy}
                      onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Moyenne ou Mention</label>
                    <input
                      type="text"
                      placeholder="Ex: 15.4/20 ou Mention Bien"
                      value={formData.gradesSummary}
                      onChange={(e) => setFormData({ ...formData, gradesSummary: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Projet d'Études & Destination */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  3. Projet d'Études & Destination Visée
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pays cible *</label>
                    <select
                      value={formData.targetCountry}
                      onChange={(e) => setFormData({ ...formData, targetCountry: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-teal-500 font-semibold"
                    >
                      {TARGET_COUNTRIES.map(tc => (
                        <option key={tc.name} value={tc.name}>
                          {tc.flag} {tc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Université / Établissement *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Université de Montréal"
                      list="institutions-list"
                      value={formData.targetInstitution}
                      onChange={(e) => setFormData({ ...formData, targetInstitution: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 font-medium"
                    />
                    <datalist id="institutions-list">
                      {studentInstitutions.map(inst => (
                        <option key={inst.id} value={inst.name}>{inst.city} ({inst.country})</option>
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Programme / Filière visée *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Génie Logiciel, Master Finance"
                      value={formData.targetProgram}
                      onChange={(e) => setFormData({ ...formData, targetProgram: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Niveau du diplôme visé</label>
                    <select
                      value={formData.targetDegreeLevel}
                      onChange={(e) => setFormData({ ...formData, targetDegreeLevel: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="Licence / Bachelor">Licence / Bachelor</option>
                      <option value="Master / Maîtrise">Master / Maîtrise</option>
                      <option value="Doctorat">Doctorat</option>
                      <option value="Certificat / DEC">Certificat / DEC</option>
                      <option value="Cours de langue">Cours intensif de langue</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Session de Rentrée</label>
                    <input
                      type="text"
                      placeholder="Ex: Septembre 2026"
                      value={formData.intakeSession}
                      onChange={(e) => setFormData({ ...formData, intakeSession: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Date prévue de départ</label>
                    <input
                      type="date"
                      value={formData.expectedDepartureDate}
                      onChange={(e) => setFormData({ ...formData, expectedDepartureDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Statut Initial & Action Requise */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  4. Gestion du Dossier & Honoraires Agence
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Statut initial pipeline</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-teal-500 font-semibold"
                    >
                      {PIPELINE_STAGES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Frais d'accompagnement (FCFA)</label>
                    <input
                      type="number"
                      value={formData.totalFee}
                      onChange={(e) => setFormData({ ...formData, totalFee: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Acompte versé (FCFA)</label>
                    <input
                      type="number"
                      value={formData.paidFee}
                      onChange={(e) => setFormData({ ...formData, paidFee: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Action immédiate requise</label>
                    <input
                      type="text"
                      placeholder="Ex: Récupérer relevé de notes du 2nd semestre"
                      value={formData.actionRequired}
                      onChange={(e) => setFormData({ ...formData, actionRequired: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Échéance de l'action</label>
                    <input
                      type="date"
                      value={formData.actionDueDate}
                      onChange={(e) => setFormData({ ...formData, actionDueDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-fluent px-6 py-2.5 rounded-xl bg-tukki-teal hover:bg-tukki-teal-dark text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Créer et Enregistrer le Candidat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2 : FICHE DÉTAIL & ÉVOLUTION DU DOSSIER ================= */}
      {isDetailModalOpen && selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-4xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto space-y-6">
            {/* Header Fiche */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getCountryFlag(selectedFile.targetCountry)}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-extrabold text-tukki-teal bg-teal-50 px-2 py-0.5 rounded-md">
                      {selectedFile.id}
                    </span>
                    <h3 className="text-lg font-bold font-title text-slate-900">
                      {selectedFile.candidateName}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedFile.targetInstitution} — {selectedFile.targetProgram} ({selectedFile.targetCountry})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Évolution rapide du Statut Pipeline */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Faire évoluer le statut du dossier :</span>
                <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${selectedFile.statusBadge}`}>
                  Actuel : {selectedFile.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedFile.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-bold text-tukki-teal focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  {PIPELINE_STAGES.map((st, i) => (
                    <option key={st} value={st}>
                      Étape {i + 1} : {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3 Blocs d'informations clés */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Bloc 1 : Coordonnées & État Civil */}
              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Contact & Résidence
                </span>
                <div className="space-y-1 text-slate-700">
                  <div><span className="font-semibold text-slate-500">Tél :</span> {selectedFile.candidatePhone || 'Non renseigné'}</div>
                  <div><span className="font-semibold text-slate-500">Email :</span> {selectedFile.candidateEmail || 'Non renseigné'}</div>
                  <div><span className="font-semibold text-slate-500">Passeport :</span> <span className="font-mono font-bold">{selectedFile.candidatePassport || 'Non renseigné'}</span></div>
                  <div><span className="font-semibold text-slate-500">Ville :</span> {selectedFile.candidateCity}, {selectedFile.candidateCountry}</div>
                </div>
              </div>

              {/* Bloc 2 : Admission Universitaire */}
              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Candidature & Admission
                </span>
                <div className="space-y-1 text-slate-700">
                  <div><span className="font-semibold text-slate-500">N° Dossier :</span> <span className="font-mono font-bold">{selectedFile.applicationNumber || 'En attente'}</span></div>
                  <div><span className="font-semibold text-slate-500">Statut :</span> <span className="font-bold text-indigo-700">{selectedFile.admissionStatus}</span></div>
                  <div><span className="font-semibold text-slate-500">Rentrée :</span> {selectedFile.intakeSession}</div>
                  <div><span className="font-semibold text-slate-500">Départ visé :</span> {selectedFile.expectedDepartureDate || 'À fixer'}</div>
                </div>
              </div>

              {/* Bloc 3 : Procédure Consulaire */}
              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Visa & Consulat
                </span>
                <div className="space-y-1 text-slate-700">
                  <div><span className="font-semibold text-slate-500">Type de visa :</span> {selectedFile.visaType}</div>
                  <div><span className="font-semibold text-slate-500">Centre :</span> {selectedFile.visaCenter}</div>
                  <div><span className="font-semibold text-slate-500">Statut visa :</span> <span className="font-bold text-purple-700">{selectedFile.visaStatus}</span></div>
                  {selectedFile.visaNotes && (
                    <div className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-100">
                      « {selectedFile.visaNotes} »
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pièces Justificatives & Documents Attachés */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tukki-teal text-[18px]">attachment</span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Documents du dossier ({(selectedFile.documents || []).length})
                  </h4>
                </div>
              </div>

              {/* Liste des documents existants */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {(selectedFile.documents || []).length === 0 ? (
                  <p className="text-slate-400 text-xs italic py-2 sm:col-span-2">
                    Aucun document téléversé pour le moment.
                  </p>
                ) : (
                  selectedFile.documents.map(doc => (
                    <div key={doc.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <span className="material-symbols-outlined text-slate-400 text-[18px]">description</span>
                        <div className="truncate">
                          <span className="font-bold text-slate-800 truncate block">{doc.name}</span>
                          <span className="text-[10px] text-slate-400">{doc.type} • {doc.size}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {doc.status}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Formulaire ajout rapide de document */}
              <form onSubmit={handleAddDocument} className="p-3 rounded-2xl bg-slate-50/80 border border-dashed border-slate-300 flex flex-col sm:flex-row items-center gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Nom du document (ex: Relevé_Notes_L3.pdf)"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full sm:flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
                />
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value)}
                  className="w-full sm:w-auto px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                >
                  <option value="Passeport">Passeport</option>
                  <option value="Diplômes">Diplômes</option>
                  <option value="Relevés de notes">Relevés de notes</option>
                  <option value="CV">CV</option>
                  <option value="Lettre de motivation">Lettre de motivation</option>
                  <option value="Lettre de recommandation">Lettre de recommandation</option>
                  <option value="Preuve financière">Preuve financière</option>
                  <option value="Attestation de langue">Attestation de langue (IELTS/TCF)</option>
                  <option value="Lettre d'admission">Lettre d'admission</option>
                  <option value="Documents visa">Documents visa (CAQ / Formulaire)</option>
                  <option value="Autre pièce">Autre pièce</option>
                </select>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-1.5 rounded-xl bg-tukki-teal text-white font-bold text-xs hover:bg-tukki-teal-dark cursor-pointer flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">upload</span>
                  <span>Attacher</span>
                </button>
              </form>
            </div>

            {/* Historique chronologique d'audit */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Journal d'Audit & Historique des Évolutions
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {(selectedFile.history || []).map((h, i) => (
                  <div key={h.id || i} className="p-2 rounded-xl bg-slate-50 text-xs flex items-center justify-between text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-tukki-teal"></span>
                      <span>{h.text}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {h.author} • {h.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pied de modal */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleDeleteFile(selectedFile)}
                className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Supprimer ce dossier</span>
              </button>

              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="btn-fluent px-6 py-2.5 rounded-xl bg-tukki-teal hover:bg-tukki-teal-dark text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Fermer la Fiche
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
