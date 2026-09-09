import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from './AuthContext.jsx';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { session, user, agency } = useAuth();

  // États principaux des données
  const [clients, setClients] = useState([]);
  const [dossiers, setDossiers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [visas, setVisas] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [studentFiles, setStudentFiles] = useState([]);
  const [studentInstitutions, setStudentInstitutions] = useState([]);

  // États de chargement et d'erreur
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Formateur FCFA
  const formatMoney = useCallback((amt) => {
    const num = Number(amt) || 0;
    return new Intl.NumberFormat('fr-FR').format(num) + ' FCFA';
  }, []);

  // Formatage des dates départ/retour en texte d'affichage
  const formatDatesDisplay = (dep, ret) => {
    if (!dep) return 'Dates à définir';
    const d1 = new Date(dep).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    if (!ret) return `Départ ${d1}`;
    const d2 = new Date(ret).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${d1} - ${d2}`;
  };

  // Chargement de l'ensemble des données Supabase
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Si pas de session Supabase active, utiliser les données locales
    if (!session?.access_token) {
      loadFallbackData();
      setIsLoading(false);
      return;
    }

    try {
      // 1. Clients
      const { data: clientsData, error: cliErr } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (cliErr) throw cliErr;

      // 2. Dossiers avec passagers, paiements, documents, visas et historique
      const { data: dossiersData, error: dosErr } = await supabase
        .from('dossiers')
        .select('*')
        .order('created_at', { ascending: false });

      if (dosErr) throw dosErr;

      // 3. Passagers
      const { data: passengersData } = await supabase
        .from('passengers')
        .select('*')
        .order('created_at', { ascending: true });

      // 4. Paiements
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .order('payment_date', { ascending: false });

      // 5. Documents
      const { data: documentsData } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      // 6. Visas
      const { data: visasData } = await supabase
        .from('visas')
        .select('*')
        .order('deposit_date', { ascending: false });

      // 7. Historique
      const { data: historyData } = await supabase
        .from('dossier_history')
        .select('*')
        .order('created_at', { ascending: false });

      // 8. Notifications
      const { data: notifsData } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      // 9. Dossiers étudiants
      const { data: studentData } = await supabase
        .from('student_files')
        .select('*')
        .order('created_at', { ascending: false });

      // 10. Universités partenaires
      const { data: institutionsData } = await supabase
        .from('student_institutions')
        .select('*')
        .order('name', { ascending: true });

      // 11. Historique étudiants
      const { data: studentHistData } = await supabase
        .from('student_file_history')
        .select('*')
        .order('created_at', { ascending: false });

      // Mappage des clients
      const mappedClients = (clientsData || []).map(c => ({
        id: c.id,
        code: c.code,
        name: c.name,
        phone: c.phone,
        email: c.email || '',
        passport: c.passport || '',
        city: c.city || 'Dakar',
        country: c.country || 'Sénégal',
        notes: c.notes || '',
        registeredDate: new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
      }));
      setClients(mappedClients);

      // Mappage des dossiers avec relations attachées
      const mappedDossiers = (dossiersData || []).map(d => {
        const clientMatch = mappedClients.find(c => c.id === d.client_id);
        const paxList = (passengersData || []).filter(p => p.dossier_id === d.id);
        const payList = (paymentsData || []).filter(p => p.dossier_id === d.id);
        const docList = (documentsData || []).filter(doc => doc.dossier_id === d.id);
        const visaList = (visasData || []).filter(v => v.dossier_id === d.id);
        const histList = (historyData || []).filter(h => h.dossier_id === d.id);

        const totalAmt = Number(d.total_amount) || 0;
        const paidAmt = Number(d.paid_amount) || 0;
        const paidPct = totalAmt > 0 ? Math.round((paidAmt / totalAmt) * 100) : 0;

        let badge = 'bg-slate-100 text-slate-700 border-slate-200';
        if (d.status === 'Option vol') badge = 'bg-amber-100 text-amber-800 border-amber-200';
        if (d.status === 'Acompte reçu') badge = 'bg-blue-100 text-blue-800 border-blue-200';
        if (d.status === 'Visa déposé') badge = 'bg-indigo-100 text-indigo-800 border-indigo-200';
        if (d.status === 'Billet émis') badge = 'bg-teal-100 text-teal-800 border-teal-200';
        if (d.status === 'Soldé' || d.status === 'Terminé') badge = 'bg-emerald-100 text-emerald-800 border-emerald-200';
        if (d.status === 'Annulé') badge = 'bg-rose-100 text-rose-800 border-rose-200';

        return {
          id: d.ref_code || d.id,
          dbId: d.id,
          clientId: d.client_id,
          client: clientMatch?.name || 'Client',
          clientPhone: clientMatch?.phone || '',
          clientEmail: clientMatch?.email || '',
          title: d.title || d.trip_type,
          destination: d.destination,
          tripType: d.trip_type,
          route: d.route,
          departureDate: d.departure_date,
          returnDate: d.return_date,
          dates: formatDatesDisplay(d.departure_date, d.return_date),
          pax: d.pax,
          airline: d.airline,
          flightNumber: d.flight_number,
          pnr: d.pnr,
          amount: formatMoney(totalAmt),
          totalAmount: totalAmt,
          paidAmount: paidAmt,
          paid: `${paidPct}%`,
          status: d.status,
          badge,
          notes: d.notes,
          passengers: paxList.map(p => ({ id: p.id, name: p.name, passport: p.passport, role: p.role })),
          payments: payList.map(p => ({
            id: p.receipt_ref || p.id,
            dbId: p.id,
            dossierId: d.ref_code,
            amount: formatMoney(Number(p.amount)),
            amountNum: Number(p.amount),
            method: p.method,
            date: p.payment_date,
            status: p.status
          })),
          documents: docList.map(doc => ({
            id: doc.id,
            name: doc.name,
            type: doc.type,
            storagePath: doc.storage_path,
            size: `${Math.round((Number(doc.file_size_bytes) || 0) / 1024)} KB`,
            status: doc.status,
            date: new Date(doc.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
          })),
          visas: visaList.map(v => ({
            id: v.id,
            traveler: v.traveler,
            destination: v.destination,
            type: v.type,
            depositDate: v.deposit_date,
            expectedDate: v.expected_date,
            status: v.status
          })),
          history: histList.map(h => ({
            id: h.id,
            author: h.author_name,
            text: h.action,
            date: new Date(h.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
          }))
        };
      });
      setDossiers(mappedDossiers);

      // Mappage des paiements globaux
      const mappedPayments = (paymentsData || []).map(p => {
        const dMatch = dossiersData?.find(d => d.id === p.dossier_id);
        const cMatch = mappedClients.find(c => c.id === p.client_id) || mappedClients.find(c => c.id === dMatch?.client_id);
        return {
          id: p.receipt_ref || p.id,
          dbId: p.id,
          dossierId: dMatch?.ref_code || '',
          dossier: dMatch ? `#${dMatch.ref_code} (${dMatch.route})` : 'Paiement direct',
          client: cMatch?.name || 'Client',
          amount: formatMoney(Number(p.amount)),
          amountNum: Number(p.amount),
          method: p.method,
          status: p.status,
          date: p.payment_date,
          badge: p.status === 'Encaissé' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800'
        };
      });
      setPayments(mappedPayments);

      // Mappage des documents globaux
      const mappedDocuments = (documentsData || []).map(doc => {
        const dMatch = dossiersData?.find(d => d.id === doc.dossier_id);
        const cMatch = mappedClients.find(c => c.id === doc.client_id) || mappedClients.find(c => c.id === dMatch?.client_id);
        return {
          id: doc.id,
          dossierId: dMatch?.ref_code || '',
          name: doc.name,
          type: doc.type,
          storagePath: doc.storage_path,
          client: cMatch?.name || 'Client agence',
          size: `${Math.round((Number(doc.file_size_bytes) || 0) / 1024)} KB`,
          status: doc.status,
          date: new Date(doc.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
        };
      });
      setDocuments(mappedDocuments);

      // Mappage des visas globaux
      const mappedVisas = (visasData || []).map(v => {
        const dMatch = dossiersData?.find(d => d.id === v.dossier_id);
        return {
          id: v.id,
          dossierId: dMatch?.ref_code || '',
          client: v.traveler,
          destination: v.destination,
          type: v.type,
          depositDate: v.deposit_date,
          expectedDate: v.expected_date || 'Sous 15 jours ouvrés',
          status: v.status
        };
      });
      setVisas(mappedVisas);

      // Mappage des notifications
      const mappedNotifications = (notifsData || []).map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        description: n.description,
        unread: n.unread,
        time: new Date(n.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      }));
      setNotifications(mappedNotifications);

      // Mappage des dossiers étudiants
      const mappedStudentFiles = (studentData || []).map(sf => {
        const clientMatch = mappedClients.find(c => c.id === sf.client_id);
        const docList = (documentsData || []).filter(doc => doc.student_file_id === sf.id || (doc.client_id === sf.client_id && doc.student_file_id === sf.id));
        const histList = (studentHistData || []).filter(h => h.student_file_id === sf.id);

        let statusBadge = 'bg-slate-100 text-slate-700 border-slate-200';
        if (sf.status === 'Nouveau candidat') statusBadge = 'bg-sky-100 text-sky-800 border-sky-200';
        else if (sf.status === 'Dossier en préparation') statusBadge = 'bg-amber-100 text-amber-800 border-amber-200';
        else if (sf.status === 'Documents incomplets') statusBadge = 'bg-rose-100 text-rose-800 border-rose-200';
        else if (sf.status === 'Candidature envoyée') statusBadge = 'bg-blue-100 text-blue-800 border-blue-200';
        else if (sf.status === 'En attente d\'admission') statusBadge = 'bg-indigo-100 text-indigo-800 border-indigo-200';
        else if (sf.status === 'Admission obtenue') statusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-200';
        else if (sf.status === 'Préparation visa') statusBadge = 'bg-purple-100 text-purple-800 border-purple-200';
        else if (sf.status === 'Visa déposé' || sf.status === 'Visa en cours') statusBadge = 'bg-amber-100 text-amber-800 border-amber-200';
        else if (sf.status === 'Visa obtenu' || sf.status === 'Départ confirmé' || sf.status === 'Dossier terminé') statusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-200';
        else if (sf.status === 'Visa refusé' || sf.status === 'Dossier abandonné') statusBadge = 'bg-rose-100 text-rose-800 border-rose-200';

        return {
          id: sf.ref_code || sf.id,
          dbId: sf.id,
          clientId: sf.client_id,
          candidateName: clientMatch?.name || 'Candidat Étudiant',
          candidatePhone: clientMatch?.phone || '',
          candidateEmail: clientMatch?.email || '',
          candidatePassport: clientMatch?.passport || '',
          candidateCity: clientMatch?.city || 'Dakar',
          candidateCountry: clientMatch?.country || 'Sénégal',
          targetCountry: sf.target_country,
          targetInstitution: sf.target_institution,
          targetProgram: sf.target_program,
          targetDegreeLevel: sf.target_degree_level || 'Licence',
          intakeSession: sf.intake_session || 'Septembre 2026',
          expectedDepartureDate: sf.expected_departure_date,
          educationLevel: sf.education_level || 'Baccalauréat',
          fieldOfStudy: sf.field_of_study || 'Général',
          previousInstitution: sf.previous_institution || '',
          diplomaObtained: sf.diploma_obtained || '',
          academicYear: sf.academic_year || '2025-2026',
          gradesSummary: sf.grades_summary || '',
          status: sf.status,
          statusBadge,
          admissionStatus: sf.admission_status || 'Brouillon',
          applicationNumber: sf.application_number || '',
          applicationDate: sf.application_date,
          admissionDate: sf.admission_date,
          admissionDeadline: sf.admission_deadline,
          visaType: sf.visa_type || 'Permis d\'études / Visa D',
          visaCenter: sf.visa_center || 'Campus France / VFS / Ambassade',
          visaDepositDate: sf.visa_deposit_date,
          visaAppointmentDate: sf.visa_appointment_date,
          visaBiometricsDate: sf.visa_biometrics_date,
          visaStatus: sf.visa_status || 'Préparation',
          visaDecisionDate: sf.visa_decision_date,
          visaNotes: sf.visa_notes || '',
          actionRequired: sf.action_required || '',
          actionDueDate: sf.action_due_date,
          assignedTo: sf.assigned_to,
          totalFee: Number(sf.total_fee) || 0,
          paidFee: Number(sf.paid_fee) || 0,
          notes: sf.notes || '',
          createdAt: sf.created_at,
          documents: docList.map(doc => ({
            id: doc.id,
            name: doc.name,
            type: doc.type,
            size: `${Math.round((Number(doc.file_size_bytes) || 0) / 1024)} KB`,
            status: doc.status,
            date: new Date(doc.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
          })),
          history: histList.map(h => ({
            id: h.id,
            author: h.author_name,
            text: h.action,
            fromStatus: h.from_status,
            toStatus: h.to_status,
            date: new Date(h.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
          }))
        };
      });
      setStudentFiles(mappedStudentFiles);
      setStudentInstitutions(institutionsData || []);

    } catch (err) {
      console.error('Erreur chargement Supabase:', err);
      setError(err.message || 'Impossible de synchroniser avec Supabase');
      loadFallbackData();
    } finally {
      setIsLoading(false);
    }
  }, [session, formatMoney]);

  // Données de secours si non connecté ou en démonstration
  const loadFallbackData = () => {
    try {
      const stored = localStorage.getItem('tukkipro_local_store');
      if (stored) {
        const parsed = JSON.parse(stored);
        setClients(parsed.clients || []);
        setDossiers(parsed.dossiers || []);
        setDocuments(parsed.documents || []);
        setPayments(parsed.payments || []);
        setVisas(parsed.visas || []);
        setNotifications(parsed.notifications || []);
        if (parsed.studentFiles?.length) {
          setStudentFiles(parsed.studentFiles);
        } else {
          setStudentFiles(getInitialDemoStudentFiles());
        }
        if (parsed.studentInstitutions?.length) {
          setStudentInstitutions(parsed.studentInstitutions);
        } else {
          setStudentInstitutions(getInitialDemoInstitutions());
        }
      } else {
        setStudentFiles(getInitialDemoStudentFiles());
        setStudentInstitutions(getInitialDemoInstitutions());
      }
    } catch (e) {
      console.error('Erreur lecture fallback:', e);
      setStudentFiles(getInitialDemoStudentFiles());
      setStudentInstitutions(getInitialDemoInstitutions());
    }
  };

  const getInitialDemoInstitutions = () => [
    { id: 'inst-1', name: 'Université de Montréal', country: 'Canada', city: 'Montréal', programs: ['Informatique', 'Gestion des Affaires', 'Génie Logiciel', 'Sciences Économiques'] },
    { id: 'inst-2', name: 'Université Laval', country: 'Canada', city: 'Québec', programs: ['Administration', 'Ingénierie', 'Sciences Sociales'] },
    { id: 'inst-3', name: 'Université Paris-Saclay', country: 'France', city: 'Paris / Orsay', programs: ['Sciences & Ingénierie', 'Informatique & IA', 'Économie'] },
    { id: 'inst-4', name: 'Sorbonne Université', country: 'France', city: 'Paris', programs: ['Lettres & Langues', 'Droit', 'Gestion'] },
    { id: 'inst-5', name: 'KU Leuven', country: 'Belgique', city: 'Louvain / Bruxelles', programs: ['Business Administration', 'Computer Science'] },
    { id: 'inst-6', name: 'Université Libre de Bruxelles (ULB)', country: 'Belgique', city: 'Bruxelles', programs: ['Sciences Économiques', 'Droit International'] },
    { id: 'inst-7', name: 'University of Manchester', country: 'Royaume-Uni', city: 'Manchester', programs: ['Data Science', 'Civil Engineering', 'Finance'] },
    { id: 'inst-8', name: 'King\'s College London', country: 'Royaume-Uni', city: 'Londres', programs: ['Management', 'Law', 'Computer Science'] },
    { id: 'inst-9', name: 'Technical University of Munich (TUM)', country: 'Allemagne', city: 'Munich', programs: ['Informatics', 'Mechanical Engineering'] },
    { id: 'inst-10', name: 'Politecnico di Milano', country: 'Italie', city: 'Milan', programs: ['Computer Engineering', 'Architecture'] },
    { id: 'inst-11', name: 'Universidad de Barcelona', country: 'Espagne', city: 'Barcelone', programs: ['Business Administration', 'Economics'] },
    { id: 'inst-12', name: 'University of Melbourne', country: 'Australie', city: 'Melbourne', programs: ['Information Technology', 'Commerce'] },
    { id: 'inst-13', name: 'Boston University', country: 'États-Unis', city: 'Boston', programs: ['Computer Science', 'Business Administration'] }
  ];

  const getInitialDemoStudentFiles = () => [
    {
      id: 'TK-ST-0001',
      dbId: 'demo-st-1',
      clientId: 'cli_1',
      candidateName: 'Aïssatou Ba',
      candidatePhone: '+221 77 450 12 34',
      candidateEmail: 'aissatou.ba@gmail.com',
      candidatePassport: 'SN-8492014',
      candidateCity: 'Dakar',
      candidateCountry: 'Sénégal',
      targetCountry: 'Canada',
      targetInstitution: 'Université de Montréal',
      targetProgram: 'Baccalauréat en Informatique & IA',
      targetDegreeLevel: 'Licence / Baccalauréat',
      intakeSession: 'Automne 2026',
      expectedDepartureDate: '2026-08-20',
      educationLevel: 'Baccalauréat S2',
      fieldOfStudy: 'Sciences Exactes',
      previousInstitution: 'Lycée d\'Excellence Birago Diop',
      diplomaObtained: 'Bac S2 Mention Très Bien',
      academicYear: '2025-2026',
      gradesSummary: 'Moyenne générale 16.4/20',
      status: 'Admission obtenue',
      statusBadge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      admissionStatus: 'Admission obtenue',
      applicationNumber: 'UdeM-2026-8841',
      applicationDate: '2026-01-15',
      admissionDate: '2026-04-10',
      admissionDeadline: '2026-05-15',
      visaType: 'Permis d\'études Canada + CAQ Québec',
      visaCenter: 'IRCC / VFS Global Dakar',
      visaDepositDate: '2026-05-02',
      visaAppointmentDate: '2026-05-14T09:30:00Z',
      visaBiometricsDate: '2026-05-14T09:30:00Z',
      visaStatus: 'En cours de traitement',
      visaDecisionDate: null,
      visaNotes: 'CAQ délivré avec succès. Données biométriques enregistrées chez VFS Dakar.',
      actionRequired: 'Suivre la décision IRCC et récupérer le certificat d\'assurance',
      actionDueDate: '2026-06-15',
      assignedTo: null,
      totalFee: 650000,
      paidFee: 450000,
      notes: 'Excellente candidate, dossier financé par garant parental à la CBAO.',
      createdAt: '2026-01-10T10:00:00Z',
      documents: [
        { id: 'doc-s1', name: 'Lettre_Admission_UdeM.pdf', type: 'Lettre d\'admission', size: '850 KB', status: 'Validé', date: '10 Avr' },
        { id: 'doc-s2', name: 'Attestation_CAQ_Quebec.pdf', type: 'Documents visa', size: '1.2 MB', status: 'Validé', date: '28 Avr' },
        { id: 'doc-s3', name: 'Releves_Notes_Terminale.pdf', type: 'Relevés de notes', size: '2.1 MB', status: 'Validé', date: '12 Jan' },
        { id: 'doc-s4', name: 'Preuve_Financiere_CBAO.pdf', type: 'Preuve financière', size: '1.5 MB', status: 'Validé', date: '30 Avr' }
      ],
      history: [
        { id: 'h-1', author: 'Agent de comptoir', text: 'Changement de statut : Candidature envoyée → Admission obtenue', fromStatus: 'Candidature envoyée', toStatus: 'Admission obtenue', date: '10 Avr 14:20' },
        { id: 'h-2', author: 'Agent de comptoir', text: 'Dossier biométrique déposé au centre VFS Global Dakar', fromStatus: 'Préparation visa', toStatus: 'Visa déposé', date: '14 Mai 10:15' }
      ]
    },
    {
      id: 'TK-ST-0002',
      dbId: 'demo-st-2',
      clientId: 'cli_2',
      candidateName: 'Cheikh Tidiane Sy',
      candidatePhone: '+221 78 120 98 76',
      candidateEmail: 'cheikh.sy@outlook.com',
      candidatePassport: 'SN-9104823',
      candidateCity: 'Saint-Louis',
      candidateCountry: 'Sénégal',
      targetCountry: 'France',
      targetInstitution: 'Université Paris-Saclay',
      targetProgram: 'Master 1 Ingénierie & Systèmes Embarqués',
      targetDegreeLevel: 'Master',
      intakeSession: 'Rentrée Septembre 2026',
      expectedDepartureDate: '2026-08-28',
      educationLevel: 'Licence 3 Physique & TIC',
      fieldOfStudy: 'Génie Électrique',
      previousInstitution: 'Université Gaston Berger de Saint-Louis',
      diplomaObtained: 'Licence Sciences de l\'Ingénieur',
      academicYear: '2025-2026',
      gradesSummary: '14.8/20 en L3',
      status: 'En attente d\'admission',
      statusBadge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      admissionStatus: 'En attente',
      applicationNumber: 'CF-DKR-9042',
      applicationDate: '2026-02-20',
      admissionDate: null,
      admissionDeadline: '2026-05-30',
      visaType: 'Visa Long Séjour Étudiant (VLS-TS)',
      visaCenter: 'Campus France Sénégal / France-Visas',
      visaDepositDate: null,
      visaAppointmentDate: null,
      visaBiometricsDate: null,
      visaStatus: 'Préparation',
      visaDecisionDate: null,
      visaNotes: 'Entretien pédagogique Campus France validé avec avis très favorable.',
      actionRequired: 'Relancer commission d\'admission Paris-Saclay',
      actionDueDate: '2026-05-25',
      assignedTo: null,
      totalFee: 500000,
      paidFee: 250000,
      notes: 'Bourse d\'excellence sollicitée en parallèle.',
      createdAt: '2026-02-15T11:00:00Z',
      documents: [
        { id: 'doc-s5', name: 'Dossier_Campus_France_Valide.pdf', type: 'Documents visa', size: '1.8 MB', status: 'Validé', date: '22 Fév' },
        { id: 'doc-s6', name: 'Diplome_Licence_UGB.pdf', type: 'Diplômes', size: '1.1 MB', status: 'Validé', date: '18 Fév' }
      ],
      history: [
        { id: 'h-3', author: 'Responsable d\'agence', text: 'Entretien Campus France effectué et validé', date: '25 Fév 16:40' }
      ]
    },
    {
      id: 'TK-ST-0003',
      dbId: 'demo-st-3',
      clientId: 'cli_3',
      candidateName: 'Fatou Kiné Ndiaye',
      candidatePhone: '+221 76 345 88 12',
      candidateEmail: 'fatou.kine@gmail.com',
      candidatePassport: 'SN-7841029',
      candidateCity: 'Dakar',
      candidateCountry: 'Sénégal',
      targetCountry: 'Belgique',
      targetInstitution: 'KU Leuven',
      targetProgram: 'Bachelor in Business Administration (BBA)',
      targetDegreeLevel: 'Licence / Bachelor',
      intakeSession: 'Septembre 2026',
      expectedDepartureDate: '2026-09-01',
      educationLevel: 'Baccalauréat G',
      fieldOfStudy: 'Gestion & Commerce',
      previousInstitution: 'Institution Sainte Jeanne d\'Arc',
      diplomaObtained: 'Baccalauréat Mention Bien',
      academicYear: '2025-2026',
      gradesSummary: '15.2/20',
      status: 'Visa en cours',
      statusBadge: 'bg-amber-100 text-amber-800 border-amber-200',
      admissionStatus: 'Admission obtenue',
      applicationNumber: 'KUL-BBA-4921',
      applicationDate: '2026-01-20',
      admissionDate: '2026-03-18',
      admissionDeadline: '2026-04-30',
      visaType: 'Visa D Études Supérieures Belgique',
      visaCenter: 'Ambassade de Belgique à Dakar (TLScontact)',
      visaDepositDate: '2026-04-20',
      visaAppointmentDate: '2026-04-25T11:00:00Z',
      visaBiometricsDate: '2026-04-25T11:00:00Z',
      visaStatus: 'En cours de traitement',
      visaDecisionDate: null,
      visaNotes: 'Preuve de solvabilité Annexe 32 légalisée et transmise à l\'Office des Étrangers à Bruxelles.',
      actionRequired: 'Suivi dossier Office des Étrangers (Belgique)',
      actionDueDate: '2026-06-05',
      assignedTo: null,
      totalFee: 550000,
      paidFee: 550000,
      notes: 'Dossier soldé à 100%. Hébergement étudiant réservé sur le campus de Louvain.',
      createdAt: '2026-01-12T09:30:00Z',
      documents: [
        { id: 'doc-s7', name: 'Admission_Offer_KULeuven.pdf', type: 'Lettre d\'admission', size: '920 KB', status: 'Validé', date: '19 Mar' },
        { id: 'doc-s8', name: 'Prise_En_Charge_Annexe32.pdf', type: 'Preuve financière', size: '2.4 MB', status: 'Validé', date: '15 Avr' }
      ],
      history: [
        { id: 'h-4', author: 'Agent de comptoir', text: 'Changement de statut : Préparation visa → Visa en cours', date: '25 Avr 12:00' }
      ]
    },
    {
      id: 'TK-ST-0004',
      dbId: 'demo-st-4',
      clientId: 'cli_4',
      candidateName: 'Mamadou Lamine Diallo',
      candidatePhone: '+221 77 908 11 22',
      candidateEmail: 'ml.diallo@teranga-travel.sn',
      candidatePassport: 'SN-9821746',
      candidateCity: 'Dakar',
      candidateCountry: 'Sénégal',
      targetCountry: 'Royaume-Uni',
      targetInstitution: 'University of Manchester',
      targetProgram: 'MSc Data Science & Artificial Intelligence',
      targetDegreeLevel: 'Master / MSc',
      intakeSession: 'Septembre 2026',
      expectedDepartureDate: '2026-09-10',
      educationLevel: 'Master 1 Informatique',
      fieldOfStudy: 'Mathématiques & Informatique',
      previousInstitution: 'École Supérieure Polytechnique (ESP) Dakar',
      diplomaObtained: 'Diplôme Ingénieur de Conception (en cours)',
      academicYear: '2025-2026',
      gradesSummary: '16.0/20',
      status: 'Dossier en préparation',
      statusBadge: 'bg-amber-100 text-amber-800 border-amber-200',
      admissionStatus: 'Préparation',
      applicationNumber: 'MAN-DS-1092',
      applicationDate: null,
      admissionDate: null,
      admissionDeadline: '2026-06-30',
      visaType: 'Student Visa (Tier 4 / Student Route UK)',
      visaCenter: 'TLScontact Dakar / UK Visas and Immigration',
      visaDepositDate: null,
      visaAppointmentDate: null,
      visaBiometricsDate: null,
      visaStatus: 'Préparation',
      visaDecisionDate: null,
      visaNotes: 'En attente des résultats officiels du test IELTS Academic.',
      actionRequired: 'Passer le test IELTS Academic (Score 6.5 minimum requis)',
      actionDueDate: '2026-05-30',
      assignedTo: null,
      totalFee: 700000,
      paidFee: 350000,
      notes: 'CV et lettres de recommandation académiques déjà finalisés.',
      createdAt: '2026-03-01T15:00:00Z',
      documents: [
        { id: 'doc-s9', name: 'CV_Academique_Diallo.pdf', type: 'CV', size: '420 KB', status: 'Validé', date: '05 Mar' },
        { id: 'doc-s10', name: 'Lettre_Motivation_Manchester.pdf', type: 'Lettre de motivation', size: '510 KB', status: 'Validé', date: '08 Mar' }
      ],
      history: [
        { id: 'h-5', author: 'Agent de comptoir', text: 'Création du dossier étudiant TK-ST-0004', date: '01 Mar 15:00' }
      ]
    },
    {
      id: 'TK-ST-0005',
      dbId: 'demo-st-5',
      clientId: 'cli_5',
      candidateName: 'Aminata Touré',
      candidatePhone: '+221 70 888 44 33',
      candidateEmail: 'aminata.toure@gmail.com',
      candidatePassport: 'SN-6721094',
      candidateCity: 'Thiès',
      candidateCountry: 'Sénégal',
      targetCountry: 'États-Unis',
      targetInstitution: 'Boston University',
      targetProgram: 'Bachelor in Computer Science',
      targetDegreeLevel: 'Licence / Bachelor',
      intakeSession: 'Fall 2026',
      expectedDepartureDate: '2026-08-15',
      educationLevel: 'Baccalauréat S1',
      fieldOfStudy: 'Mathématiques & Sciences Physiques',
      previousInstitution: 'Lycée Malick Sy de Thiès',
      diplomaObtained: 'Bac S1 Mention Très Bien',
      academicYear: '2025-2026',
      gradesSummary: '17.1/20',
      status: 'Visa obtenu',
      statusBadge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      admissionStatus: 'Admission obtenue',
      applicationNumber: 'BU-I20-7712',
      applicationDate: '2025-11-10',
      admissionDate: '2026-02-14',
      admissionDeadline: '2026-03-31',
      visaType: 'Visa F-1 Étudiant USA',
      visaCenter: 'Ambassade des États-Unis à Dakar',
      visaDepositDate: '2026-03-15',
      visaAppointmentDate: '2026-04-05T08:00:00Z',
      visaBiometricsDate: '2026-04-05T08:00:00Z',
      visaStatus: 'Approuvé',
      visaDecisionDate: '2026-04-05',
      visaNotes: 'Formulaire I-20 émis par BU. Frais SEVIS I-901 acquittés. Entretien consulaire validé avec émission du visa F-1.',
      actionRequired: 'Réservation billet d\'avion et préparation accueil aéroport Boston',
      actionDueDate: '2026-06-20',
      assignedTo: null,
      totalFee: 850000,
      paidFee: 850000,
      notes: 'Dossier exemplaire. Logement sur le campus de Commonwealth Avenue confirmé.',
      createdAt: '2025-10-20T14:00:00Z',
      documents: [
        { id: 'doc-s11', name: 'Formulaire_I20_Boston_Univ.pdf', type: 'Lettre d\'admission', size: '1.4 MB', status: 'Validé', date: '15 Fév' },
        { id: 'doc-s12', name: 'Visa_F1_Approuve.pdf', type: 'Documents visa', size: '980 KB', status: 'Validé', date: '06 Avr' },
        { id: 'doc-s13', name: 'Recu_Frais_SEVIS_I901.pdf', type: 'Documents visa', size: '650 KB', status: 'Validé', date: '20 Mar' }
      ],
      history: [
        { id: 'h-6', author: 'Responsable d\'agence', text: 'Visa F-1 officiellement approuvé par le consulat américain', date: '05 Avr 11:30' }
      ]
    },
    {
      id: 'TK-ST-0006',
      dbId: 'demo-st-6',
      clientId: 'cli_6',
      candidateName: 'Ibrahima Sarr',
      candidatePhone: '+221 77 665 43 21',
      candidateEmail: 'ibrahima.sarr@gmail.com',
      candidatePassport: 'SN-5421098',
      candidateCity: 'Dakar',
      candidateCountry: 'Sénégal',
      targetCountry: 'Allemagne',
      targetInstitution: 'Technical University of Munich (TUM)',
      targetProgram: 'MSc Informatics & Software Engineering',
      targetDegreeLevel: 'Master / MSc',
      intakeSession: 'Winter Semester 2026',
      expectedDepartureDate: '2026-09-25',
      educationLevel: 'Master 1 Génie Logiciel',
      fieldOfStudy: 'Informatique',
      previousInstitution: 'Université Amadou Mahtar Mbow (UAM)',
      diplomaObtained: 'Licence Informatique',
      academicYear: '2025-2026',
      gradesSummary: '15.6/20',
      status: 'Documents incomplets',
      statusBadge: 'bg-rose-100 text-rose-800 border-rose-200',
      admissionStatus: 'Préparation',
      applicationNumber: 'TUM-APP-9921',
      applicationDate: null,
      admissionDate: null,
      admissionDeadline: '2026-05-31',
      visaType: 'Visa National D Études Allemagne',
      visaCenter: 'Ambassade d\'Allemagne à Dakar',
      visaDepositDate: null,
      visaAppointmentDate: null,
      visaBiometricsDate: null,
      visaStatus: 'Documents en attente',
      visaDecisionDate: null,
      visaNotes: 'Attestation de compte bloqué (Sperrkonto) en attente d\'ouverture chez Fintiba ou Coracle.',
      actionRequired: 'Passeport biométrique expiré à renouveler + Ouverture compte bloqué 11 208 €',
      actionDueDate: '2026-05-15',
      assignedTo: null,
      totalFee: 600000,
      paidFee: 200000,
      notes: 'Rendez-vous renouvellement passeport prévu au bureau des passeports de Dieuppeul.',
      createdAt: '2026-02-28T16:20:00Z',
      documents: [
        { id: 'doc-s14', name: 'Curriculum_Vitae_Europass.pdf', type: 'CV', size: '390 KB', status: 'Validé', date: '01 Mar' }
      ],
      history: [
        { id: 'h-7', author: 'Agent de comptoir', text: 'Signalement : Passeport expiré et compte bloqué manquant', date: '03 Mar 14:00' }
      ]
    }
  ];

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ---------------------------------------------------------------------------
  // ACTIONS MÉTIER CONNECTÉES À SUPABASE
  // ---------------------------------------------------------------------------

  // A. CRÉER UN CLIENT
  const addClient = async (clientData) => {
    if (!session?.access_token) {
      // Mode local
      const newCli = {
        id: `cli_${Date.now()}`,
        code: `CL-${String(clients.length + 1).padStart(3, '0')}`,
        name: clientData.name,
        phone: clientData.phone,
        email: clientData.email || '',
        passport: clientData.passport || '',
        city: clientData.city || 'Dakar',
        country: clientData.country || 'Sénégal',
        notes: clientData.notes || '',
        registeredDate: 'Aujourd’hui'
      };
      setClients(prev => [newCli, ...prev]);
      return newCli;
    }

    const { data, error } = await supabase
      .from('clients')
      .insert({
        agency_id: user?.agencyId,
        name: clientData.name,
        phone: clientData.phone,
        email: clientData.email || null,
        passport: clientData.passport || null,
        city: clientData.city || 'Dakar',
        country: clientData.country || 'Sénégal',
        notes: clientData.notes || null
      })
      .select('*')
      .single();

    if (error) throw error;

    await loadAllData();
    return data;
  };

  // B. MODIFIER UN CLIENT
  const updateClient = async (clientId, updateFields) => {
    if (!session?.access_token) {
      setClients(prev => prev.map(c => c.id === clientId ? { ...c, ...updateFields } : c));
      return;
    }

    const { error } = await supabase
      .from('clients')
      .update({
        name: updateFields.name,
        phone: updateFields.phone,
        email: updateFields.email,
        passport: updateFields.passport,
        notes: updateFields.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId);

    if (error) throw error;
    await loadAllData();
  };

  // C. CRÉER UN DOSSIER DE VOYAGE
  const createDossier = async (dossierData) => {
    if (!session?.access_token) {
      const newDossier = {
        id: `TK-${4080 + dossiers.length + 1}`,
        client: dossierData.client,
        clientId: dossierData.clientId,
        destination: dossierData.destination,
        route: dossierData.route || `DSS - ${dossierData.destination}`,
        departureDate: dossierData.departureDate,
        returnDate: dossierData.returnDate,
        dates: formatDatesDisplay(dossierData.departureDate, dossierData.returnDate),
        pax: dossierData.pax || 1,
        amount: formatMoney(dossierData.totalAmount || 0),
        totalAmount: dossierData.totalAmount || 0,
        paidAmount: 0,
        paid: '0%',
        status: 'Brouillon',
        badge: 'bg-slate-100 text-slate-700 border-slate-200',
        airline: dossierData.airline || 'Air Sénégal',
        pnr: dossierData.pnr || 'GDS EN ATTENTE',
        passengers: dossierData.passengers || [],
        payments: [],
        documents: [],
        visas: [],
        history: [{ date: 'À l’instant', author: user?.fullName || 'Agent', text: 'Création du dossier en statut Brouillon' }]
      };
      setDossiers(prev => [newDossier, ...prev]);
      return newDossier;
    }

    // Recherche de l'UUID du client
    let realClientId = dossierData.clientId;
    if (!realClientId) {
      const match = clients.find(c => c.name === dossierData.client);
      realClientId = match?.id;
    }

    const { data, error } = await supabase
      .from('dossiers')
      .insert({
        agency_id: user?.agencyId,
        client_id: realClientId,
        title: dossierData.title || `Voyage ${dossierData.destination}`,
        destination: dossierData.destination,
        trip_type: dossierData.tripType || 'Vol sec Aller-Retour',
        route: dossierData.route || `DSS - ${dossierData.destination}`,
        departure_date: dossierData.departureDate,
        return_date: dossierData.returnDate || null,
        pax: dossierData.pax || 1,
        airline: dossierData.airline || 'Air Sénégal',
        flight_number: dossierData.flightNumber || null,
        pnr: dossierData.pnr || null,
        total_amount: Number(dossierData.totalAmount) || 0,
        paid_amount: 0,
        status: 'Brouillon',
        notes: dossierData.notes || null,
        created_by: user?.id
      })
      .select('*')
      .single();

    if (error) throw error;

    await loadAllData();
    return { id: data.ref_code, ...data };
  };

  // D. CHANGER LE STATUT D'UN DOSSIER (L'audit est journalisé automatiquement par trigger)
  const updateDossierStatus = async (dossierIdOrRef, newStatus) => {
    if (!session?.access_token) {
      setDossiers(prev => prev.map(d => {
        if (d.id === dossierIdOrRef || d.dbId === dossierIdOrRef) {
          const newHistory = [...(d.history || []), { date: 'À l’instant', author: user?.fullName || 'Agent', text: `Statut modifié : ${newStatus}` }];
          return { ...d, status: newStatus, history: newHistory };
        }
        return d;
      }));
      return;
    }

    const target = dossiers.find(d => d.id === dossierIdOrRef || d.dbId === dossierIdOrRef);
    if (!target) return;

    const { error } = await supabase
      .from('dossiers')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', target.dbId);

    if (error) throw error;
    await loadAllData();
  };

  // E. ENCAISSER UN PAIEMENT (Le trigger sync_dossier_paid_amount met à jour le montant du dossier)
  const addPayment = async ({ dossierId, client, amount, method, status = 'Encaissé' }) => {
    const target = dossiers.find(d => d.id === dossierId || d.dbId === dossierId);

    if (!session?.access_token) {
      const amtNum = Number(amount) || 0;
      const newPay = {
        id: `REC-${9420 + payments.length + 1}`,
        dossierId: target?.id || dossierId,
        dossier: target ? `#${target.id} (${target.route})` : 'Paiement direct',
        client: client || target?.client || 'Client',
        amount: formatMoney(amtNum),
        amountNum: amtNum,
        method: method || 'Virement Bancaire',
        status: status,
        date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
      };
      setPayments(prev => [newPay, ...prev]);

      if (target) {
        setDossiers(prev => prev.map(d => {
          if (d.id === target.id) {
            const newPaid = d.paidAmount + amtNum;
            const pct = d.totalAmount > 0 ? Math.round((newPaid / d.totalAmount) * 100) : 0;
            return {
              ...d,
              paidAmount: newPaid,
              paid: `${pct}%`,
              status: newPaid >= d.totalAmount && d.totalAmount > 0 ? 'Soldé' : d.status,
              payments: [newPay, ...(d.payments || [])]
            };
          }
          return d;
        }));
      }
      return newPay;
    }

    const { data, error } = await supabase
      .from('payments')
      .insert({
        agency_id: user?.agencyId,
        dossier_id: target?.dbId,
        client_id: target?.clientId || null,
        amount: Number(amount),
        method: method || 'Virement Bancaire',
        status: status,
        created_by: user?.id
      })
      .select('*')
      .single();

    if (error) throw error;
    await loadAllData();
    return data;
  };

  // F. ATTACHER UN DOCUMENT
  const addDocument = async ({ name, type, client, dossierId, file, size = '1.2 MB' }) => {
    const target = dossiers.find(d => d.id === dossierId || d.dbId === dossierId);

    if (!session?.access_token) {
      const newDoc = {
        id: `doc_${Date.now()}`,
        name,
        type: type || 'Passeport',
        client: client || target?.client || 'Client agence',
        dossierId: target?.id || '',
        size,
        status: 'Validé',
        date: 'Aujourd’hui'
      };
      setDocuments(prev => [newDoc, ...prev]);
      if (target) {
        setDossiers(prev => prev.map(d => d.id === target.id ? { ...d, documents: [newDoc, ...(d.documents || [])] } : d));
      }
      return newDoc;
    }

    let storagePath = `${user?.agencyId}/general/${Date.now()}_${name}`;
    let fileSizeBytes = 1200000;

    // Si un vrai fichier binaire est fourni pour Supabase Storage
    if (file && user?.agencyId) {
      storagePath = `${user.agencyId}/dossiers/${target?.dbId || 'general'}/${Date.now()}_${name}`;
      fileSizeBytes = file.size || fileSizeBytes;
      await supabase.storage.from('agency-documents').upload(storagePath, file);
    }

    const { data, error } = await supabase
      .from('documents')
      .insert({
        agency_id: user?.agencyId,
        dossier_id: target?.dbId || null,
        client_id: target?.clientId || null,
        name,
        type: type || 'Passeport',
        storage_path: storagePath,
        file_size_bytes: fileSizeBytes,
        status: 'Validé',
        uploaded_by: user?.id
      })
      .select('*')
      .single();

    if (error) throw error;
    await loadAllData();
    return data;
  };

  // G. AJOUTER UN PASSAGER À UN DOSSIER
  const addPassengerToDossier = async (dossierIdOrRef, passenger) => {
    const target = dossiers.find(d => d.id === dossierIdOrRef || d.dbId === dossierIdOrRef);

    if (!session?.access_token) {
      const newPax = { id: `pax_${Date.now()}`, ...passenger };
      setDossiers(prev => prev.map(d => d.id === target?.id ? { ...d, passengers: [...(d.passengers || []), newPax] } : d));
      return newPax;
    }

    const { data, error } = await supabase
      .from('passengers')
      .insert({
        agency_id: user?.agencyId,
        dossier_id: target?.dbId,
        name: passenger.name,
        passport: passenger.passport || null,
        role: passenger.role || 'Adulte'
      })
      .select('*')
      .single();

    if (error) throw error;
    await loadAllData();
    return data;
  };

  // H. ENREGISTRER UNE DÉMARCHE DE VISA
  const addVisa = async (visaData) => {
    const target = dossiers.find(d => d.id === visaData.dossierId || d.dbId === visaData.dossierId);

    if (!session?.access_token) {
      const newVisa = {
        id: `visa_${Date.now()}`,
        client: visaData.client || target?.client || 'Voyageur',
        dossierId: target?.id || '',
        destination: visaData.destination || 'France / Schengen',
        type: visaData.type || 'Court séjour',
        depositDate: visaData.depositDate || new Date().toISOString().split('T')[0],
        expectedDate: visaData.expectedDate || 'Sous 15 jours',
        status: visaData.status || 'En cours'
      };
      setVisas(prev => [newVisa, ...prev]);
      return newVisa;
    }

    const { data, error } = await supabase
      .from('visas')
      .insert({
        agency_id: user?.agencyId,
        dossier_id: target?.dbId || null,
        client_id: target?.clientId || null,
        traveler: visaData.client || target?.client || 'Voyageur',
        destination: visaData.destination,
        type: visaData.type || 'Court séjour touristique',
        deposit_date: visaData.depositDate || new Date().toISOString().split('T')[0],
        expected_date: visaData.expectedDate || null,
        status: visaData.status || 'En cours'
      })
      .select('*')
      .single();

    if (error) throw error;
    await loadAllData();
    return data;
  };

  // I. MARQUER TOUTES LES NOTIFICATIONS COMME LUES
  const markAllNotificationsAsRead = async () => {
    if (!session?.access_token) {
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
      return;
    }

    const { error } = await supabase
      .from('notifications')
      .update({ unread: false })
      .eq('agency_id', user?.agencyId)
      .eq('unread', true);

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    }
  };

  // J. CRÉER UN DOSSIER ÉTUDIANT
  const addStudentFile = async (studentData) => {
    let clientDbId = studentData.clientId;

    // Si nouveau client spécifié
    if (!clientDbId && studentData.candidateName) {
      const createdClient = await addClient({
        name: studentData.candidateName,
        phone: studentData.candidatePhone || '+221 77 000 00 00',
        email: studentData.candidateEmail || '',
        passport: studentData.candidatePassport || '',
        city: studentData.candidateCity || 'Dakar',
        country: studentData.candidateCountry || 'Sénégal',
        notes: `Candidat études - ${studentData.targetCountry || 'International'}`
      });
      clientDbId = createdClient?.id || createdClient?.dbId;
    }

    const targetClient = clients.find(c => c.id === clientDbId || c.dbId === clientDbId);

    if (!session?.access_token) {
      const nextNum = studentFiles.length + 1;
      const refCode = `TK-ST-${String(nextNum).padStart(4, '0')}`;
      const newFile = {
        id: refCode,
        dbId: `st_${Date.now()}`,
        clientId: clientDbId || 'cli_new',
        candidateName: studentData.candidateName || targetClient?.name || 'Candidat Étudiant',
        candidatePhone: studentData.candidatePhone || targetClient?.phone || '',
        candidateEmail: studentData.candidateEmail || targetClient?.email || '',
        candidatePassport: studentData.candidatePassport || targetClient?.passport || '',
        candidateCity: studentData.candidateCity || targetClient?.city || 'Dakar',
        candidateCountry: studentData.candidateCountry || targetClient?.country || 'Sénégal',
        targetCountry: studentData.targetCountry || 'Canada',
        targetInstitution: studentData.targetInstitution || 'Université Partenaire',
        targetProgram: studentData.targetProgram || 'Programme d\'études',
        targetDegreeLevel: studentData.targetDegreeLevel || 'Licence',
        intakeSession: studentData.intakeSession || 'Septembre 2026',
        expectedDepartureDate: studentData.expectedDepartureDate || null,
        educationLevel: studentData.educationLevel || 'Baccalauréat',
        fieldOfStudy: studentData.fieldOfStudy || 'Général',
        previousInstitution: studentData.previousInstitution || '',
        diplomaObtained: studentData.diplomaObtained || '',
        academicYear: studentData.academicYear || '2025-2026',
        gradesSummary: studentData.gradesSummary || '',
        status: studentData.status || 'Nouveau candidat',
        statusBadge: 'bg-sky-100 text-sky-800 border-sky-200',
        admissionStatus: studentData.admissionStatus || 'Brouillon',
        applicationNumber: studentData.applicationNumber || '',
        applicationDate: studentData.applicationDate || null,
        admissionDate: studentData.admissionDate || null,
        admissionDeadline: studentData.admissionDeadline || null,
        visaType: studentData.visaType || 'Permis d\'études / Visa D',
        visaCenter: studentData.visaCenter || 'Ambassade / Consulat',
        visaDepositDate: studentData.visaDepositDate || null,
        visaAppointmentDate: studentData.visaAppointmentDate || null,
        visaBiometricsDate: studentData.visaBiometricsDate || null,
        visaStatus: studentData.visaStatus || 'Préparation',
        visaDecisionDate: null,
        visaNotes: studentData.visaNotes || '',
        actionRequired: studentData.actionRequired || 'Constitution initiale du dossier',
        actionDueDate: studentData.actionDueDate || null,
        assignedTo: null,
        totalFee: Number(studentData.totalFee) || 500000,
        paidFee: Number(studentData.paidFee) || 0,
        notes: studentData.notes || '',
        createdAt: new Date().toISOString(),
        documents: [],
        history: [
          { id: `h_${Date.now()}`, author: user?.fullName || 'Agent de comptoir', text: `Création du dossier ${refCode}`, date: 'Aujourd\'hui' }
        ]
      };
      setStudentFiles(prev => [newFile, ...prev]);
      return newFile;
    }

    const { data, error } = await supabase
      .from('student_files')
      .insert({
        agency_id: user?.agencyId,
        client_id: clientDbId,
        target_country: studentData.targetCountry,
        target_institution: studentData.targetInstitution,
        target_program: studentData.targetProgram,
        target_degree_level: studentData.targetDegreeLevel || 'Licence',
        intake_session: studentData.intakeSession || 'Septembre 2026',
        expected_departure_date: studentData.expectedDepartureDate || null,
        education_level: studentData.educationLevel || 'Baccalauréat',
        field_of_study: studentData.fieldOfStudy || 'Général',
        previous_institution: studentData.previousInstitution || null,
        diploma_obtained: studentData.diplomaObtained || null,
        academic_year: studentData.academicYear || '2025-2026',
        grades_summary: studentData.gradesSummary || null,
        status: studentData.status || 'Nouveau candidat',
        admission_status: studentData.admissionStatus || 'Brouillon',
        application_number: studentData.applicationNumber || null,
        application_date: studentData.applicationDate || null,
        admission_date: studentData.admissionDate || null,
        admission_deadline: studentData.admissionDeadline || null,
        visa_type: studentData.visaType || 'Permis d\'études / Visa D',
        visa_center: studentData.visaCenter || null,
        visa_deposit_date: studentData.visaDepositDate || null,
        visa_status: studentData.visaStatus || 'Préparation',
        action_required: studentData.actionRequired || null,
        action_due_date: studentData.actionDueDate || null,
        total_fee: Number(studentData.totalFee) || 0,
        paid_fee: Number(studentData.paidFee) || 0,
        notes: studentData.notes || null,
        created_by: user?.id
      })
      .select('*')
      .single();

    if (error) throw error;
    await loadAllData();
    return data;
  };

  // K. METTRE À JOUR UN DOSSIER ÉTUDIANT (AVEC HISTORIQUE)
  const updateStudentFile = async (idOrDbId, updates) => {
    const target = studentFiles.find(sf => sf.id === idOrDbId || sf.dbId === idOrDbId);

    if (!session?.access_token) {
      setStudentFiles(prev => prev.map(sf => {
        if (sf.id === idOrDbId || sf.dbId === idOrDbId) {
          const updated = { ...sf, ...updates };
          if (updates.status && updates.status !== sf.status) {
            updated.history = [
              {
                id: `h_${Date.now()}`,
                author: user?.fullName || 'Agent de comptoir',
                text: `Changement de statut : ${sf.status} → ${updates.status}`,
                fromStatus: sf.status,
                toStatus: updates.status,
                date: 'Aujourd\'hui'
              },
              ...(sf.history || [])
            ];
          }
          return updated;
        }
        return sf;
      }));
      return;
    }

    const { error } = await supabase
      .from('student_files')
      .update({
        ...(updates.status && { status: updates.status }),
        ...(updates.admissionStatus && { admission_status: updates.admissionStatus }),
        ...(updates.applicationNumber !== undefined && { application_number: updates.applicationNumber }),
        ...(updates.applicationDate !== undefined && { application_date: updates.applicationDate }),
        ...(updates.admissionDate !== undefined && { admission_date: updates.admissionDate }),
        ...(updates.admissionDeadline !== undefined && { admission_deadline: updates.admissionDeadline }),
        ...(updates.visaType && { visa_type: updates.visaType }),
        ...(updates.visaCenter !== undefined && { visa_center: updates.visaCenter }),
        ...(updates.visaDepositDate !== undefined && { visa_deposit_date: updates.visaDepositDate }),
        ...(updates.visaAppointmentDate !== undefined && { visa_appointment_date: updates.visaAppointmentDate }),
        ...(updates.visaBiometricsDate !== undefined && { visa_biometrics_date: updates.visaBiometricsDate }),
        ...(updates.visaStatus && { visa_status: updates.visaStatus }),
        ...(updates.visaDecisionDate !== undefined && { visa_decision_date: updates.visaDecisionDate }),
        ...(updates.visaNotes !== undefined && { visa_notes: updates.visaNotes }),
        ...(updates.actionRequired !== undefined && { action_required: updates.actionRequired }),
        ...(updates.actionDueDate !== undefined && { action_due_date: updates.actionDueDate }),
        ...(updates.targetCountry && { target_country: updates.targetCountry }),
        ...(updates.targetInstitution && { target_institution: updates.targetInstitution }),
        ...(updates.targetProgram && { target_program: updates.targetProgram }),
        ...(updates.targetDegreeLevel && { target_degree_level: updates.targetDegreeLevel }),
        ...(updates.intakeSession && { intake_session: updates.intakeSession }),
        ...(updates.expectedDepartureDate !== undefined && { expected_departure_date: updates.expectedDepartureDate }),
        ...(updates.totalFee !== undefined && { total_fee: Number(updates.totalFee) }),
        ...(updates.paidFee !== undefined && { paid_fee: Number(updates.paidFee) }),
        ...(updates.notes !== undefined && { notes: updates.notes }),
        updated_at: new Date().toISOString()
      })
      .eq('id', target?.dbId || idOrDbId);

    if (error) throw error;
    await loadAllData();
  };

  // L. SUPPRIMER UN DOSSIER ÉTUDIANT
  const deleteStudentFile = async (idOrDbId) => {
    const target = studentFiles.find(sf => sf.id === idOrDbId || sf.dbId === idOrDbId);

    if (!session?.access_token) {
      setStudentFiles(prev => prev.filter(sf => sf.id !== idOrDbId && sf.dbId !== idOrDbId));
      return;
    }

    const { error } = await supabase
      .from('student_files')
      .delete()
      .eq('id', target?.dbId || idOrDbId);

    if (error) throw error;
    await loadAllData();
  };

  // M. ATTACHER UN DOCUMENT AU DOSSIER ÉTUDIANT
  const addStudentDocument = async ({ studentFileId, name, type, file, size = '1.4 MB' }) => {
    const target = studentFiles.find(sf => sf.id === studentFileId || sf.dbId === studentFileId);

    if (!session?.access_token) {
      const newDoc = {
        id: `doc_${Date.now()}`,
        name,
        type: type || 'Diplômes',
        size,
        status: 'Validé',
        date: 'Aujourd’hui'
      };
      setStudentFiles(prev => prev.map(sf => {
        if (sf.id === target?.id || sf.dbId === target?.dbId) {
          return { ...sf, documents: [newDoc, ...(sf.documents || [])] };
        }
        return sf;
      }));
      return newDoc;
    }

    let storagePath = `${user?.agencyId}/students/${target?.dbId || 'general'}/${Date.now()}_${name}`;
    let fileSizeBytes = 1400000;

    if (file && user?.agencyId) {
      fileSizeBytes = file.size || fileSizeBytes;
      await supabase.storage.from('agency-documents').upload(storagePath, file);
    }

    const { data, error } = await supabase
      .from('documents')
      .insert({
        agency_id: user?.agencyId,
        student_file_id: target?.dbId,
        client_id: target?.clientId || null,
        name,
        type: type || 'Diplômes',
        storage_path: storagePath,
        file_size_bytes: fileSizeBytes,
        status: 'Validé',
        uploaded_by: user?.id
      })
      .select('*')
      .single();

    if (error) throw error;
    await loadAllData();
    return data;
  };

  // ---------------------------------------------------------------------------
  // KPIS CALCULÉS
  // ---------------------------------------------------------------------------
  const activeDossiersCount = dossiers.filter(d => d.status !== 'Terminé' && d.status !== 'Annulé').length;
  const urgentCount = dossiers.filter(d => d.status?.toLowerCase().includes('option') || d.status?.toLowerCase().includes('urgence')).length;
  const totalSalesAmount = dossiers.reduce((acc, d) => acc + (d.totalAmount || 0), 0);
  const totalCollectedAmount = payments.reduce((acc, p) => acc + (p.amountNum || 0), 0);
  const totalRemainingBalance = Math.max(0, totalSalesAmount - totalCollectedAmount);

  // KPIs Pôle Visas Étudiants
  const studentCandidatesCount = studentFiles.length;
  const studentActiveCount = studentFiles.filter(s => s.status !== 'Dossier terminé' && s.status !== 'Dossier abandonné').length;
  const studentAdmissionsCount = studentFiles.filter(s => s.status === 'Admission obtenue' || s.admissionStatus === 'Admission obtenue' || s.admissionStatus === 'Admission conditionnelle').length;
  const studentVisasInProgressCount = studentFiles.filter(s => ['Préparation visa', 'Visa déposé', 'Visa en cours'].includes(s.status) || ['Dossier déposé', 'En cours de traitement', 'Biométrie', 'Rendez-vous à prendre'].includes(s.visaStatus)).length;
  const studentVisasObtainedCount = studentFiles.filter(s => s.status === 'Visa obtenu' || s.visaStatus === 'Approuvé' || s.status === 'Départ confirmé' || s.status === 'Dossier terminé').length;
  const studentActionsRequiredCount = studentFiles.filter(s => (s.actionRequired && s.actionRequired.trim() !== '') || s.status === 'Documents incomplets').length;

  return (
    <DataContext.Provider value={{
      clients,
      dossiers,
      documents,
      payments,
      visas,
      notifications,
      studentFiles,
      studentInstitutions,
      isLoading,
      error,
      refreshData: loadAllData,
      formatMoney,
      // Méthodes CRUD
      addClient,
      updateClient,
      createDossier,
      updateDossierStatus,
      addPassengerToDossier,
      addPayment,
      addDocument,
      addVisa,
      markAllNotificationsAsRead,
      // Méthodes CRUD Visas Étudiants
      addStudentFile,
      updateStudentFile,
      deleteStudentFile,
      addStudentDocument,
      // KPIs Voyages & Billetterie
      activeDossiersCount,
      urgentCount,
      totalSalesAmount,
      totalCollectedAmount,
      totalRemainingBalance,
      // KPIs Visas Étudiants
      studentCandidatesCount,
      studentActiveCount,
      studentAdmissionsCount,
      studentVisasInProgressCount,
      studentVisasObtainedCount,
      studentActionsRequiredCount
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData doit être utilisé au sein d’un DataProvider');
  }
  return context;
}
export default useData;
