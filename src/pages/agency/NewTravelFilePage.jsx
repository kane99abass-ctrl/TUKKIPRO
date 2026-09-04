import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext.jsx';
import { Plane, Calendar, Users, ArrowLeft, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function NewTravelFilePage() {
  const navigate = useNavigate();
  const { clients, createDossier, addClient } = useData();

  // Mode sélection client existant ou nouveau client
  const [clientMode, setClientMode] = useState('existing'); // 'existing' | 'new'
  const [selectedClientId, setSelectedClientId] = useState('');

  // Champs nouveau client
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPassport, setClientPassport] = useState('');

  // Informations voyage
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [tripType, setTripType] = useState('Séjour Vacances');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [pax, setPax] = useState('1');
  const [totalAmount, setTotalAmount] = useState('');
  const [notes, setNotes] = useState('');

  // États de soumission et d'erreurs
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successDossierId, setSuccessDossierId] = useState(null);

  // Synchronisation si sélection d'un client existant
  const handleSelectClient = (e) => {
    const cid = e.target.value;
    setSelectedClientId(cid);
    const cli = clients.find(c => c.id === cid);
    if (cli) {
      setClientName(cli.name);
      setClientPhone(cli.phone || '');
      setClientEmail(cli.email || '');
      setClientPassport(cli.passport || '');
    }
  };

  // Validation
  const validateForm = () => {
    const errs = {};
    if (clientMode === 'existing' && !selectedClientId) {
      errs.client = 'Veuillez sélectionner un client existant ou choisir "Nouveau client".';
    }
    if (clientMode === 'new') {
      if (!clientName.trim()) errs.clientName = 'Le nom du client est obligatoire.';
      if (!clientPhone.trim()) errs.clientPhone = 'Le numéro de téléphone est obligatoire.';
    }
    if (!destination.trim()) {
      errs.destination = 'La destination principale est obligatoire (ex: Paris, Dubaï...).';
    }
    if (!departureDate) {
      errs.departureDate = 'La date de départ est requise.';
    }
    if (departureDate && returnDate && new Date(returnDate) < new Date(departureDate)) {
      errs.returnDate = 'La date de retour ne peut pas être antérieure à la date de départ.';
    }
    const paxNum = parseInt(pax, 10);
    if (isNaN(paxNum) || paxNum < 1) {
      errs.pax = 'Le nombre de voyageurs doit être au minimum de 1.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      let targetClientId = selectedClientId;

      // Si mode nouveau client, création préalable dans Supabase
      if (clientMode === 'new') {
        const newClient = await addClient({
          name: clientName.trim(),
          phone: clientPhone.trim(),
          email: clientEmail.trim(),
          passport: clientPassport.trim(),
          city: 'Dakar'
        });
        targetClientId = newClient?.id;
      }

      const clientDisplayName = clientMode === 'existing'
        ? (clients.find(c => c.id === selectedClientId)?.name || clientName)
        : clientName;

      const created = await createDossier({
        clientId: targetClientId,
        client: clientDisplayName,
        clientName: clientDisplayName,
        clientPhone,
        clientEmail,
        clientPassport,
        title: title.trim() || `${tripType} — ${destination}`,
        destination: destination.trim(),
        route: `DSS - ${destination.trim()}`,
        tripType,
        departureDate,
        returnDate,
        pax: parseInt(pax, 10) || 1,
        totalAmount: parseInt(totalAmount, 10) || 0,
        notes
      });

      setIsSubmitting(false);
      setSuccessDossierId(created.id);

      // Redirection vers la fiche détaillée du dossier créé
      setTimeout(() => {
        navigate(`/app/dossiers/${created.id}`);
      }, 1000);

    } catch (err) {
      setIsSubmitting(false);
      setErrors({ submit: err.message || "Une erreur est survenue lors de la création du dossier." });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      
      {/* Fil d'ariane & Bouton retour */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/app/dossiers" className="hover:text-[#0F766E] flex items-center gap-1 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour aux dossiers</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-700">Nouveau Dossier</span>
      </div>

      {/* Confirmation de succès avec animation */}
      {successDossierId && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Dossier #{successDossierId} créé avec succès !</h3>
              <p className="text-xs text-emerald-700">Statut initial configuré sur <strong>Brouillon</strong>. Redirection vers la fiche détaillée en cours...</p>
            </div>
          </div>
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
        </div>
      )}

      {/* Formulaire Principal */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        
        <div className="pb-5 mb-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold font-title text-slate-900">
              Créer un Nouveau Dossier de Voyage
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Le dossier sera créé avec le statut initial <strong className="text-slate-800 font-semibold">Brouillon</strong>.
            </p>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-mono font-bold">
            STATUT : BROUILLON
          </span>
        </div>

        {errors.submit && (
          <div className="p-3.5 mb-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errors.submit}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ================= SECTION 1 : CLIENT ================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                1. Voyageur & Client Référent
              </span>
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => { setClientMode('existing'); setErrors({}); }}
                  className={`px-3 py-1 rounded-md transition-all ${
                    clientMode === 'existing' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Client existant ({clients.length})
                </button>
                <button
                  type="button"
                  onClick={() => { setClientMode('new'); setSelectedClientId(''); setErrors({}); }}
                  className={`px-3 py-1 rounded-md transition-all ${
                    clientMode === 'new' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  + Nouveau client
                </button>
              </div>
            </div>

            {/* Mode Client Existant */}
            {clientMode === 'existing' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sélectionner dans l'annuaire de l'agence *
                </label>
                <select
                  value={selectedClientId}
                  onChange={handleSelectClient}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white ${
                    errors.client ? 'border-rose-300 ring-rose-200' : 'border-slate-200'
                  }`}
                >
                  <option value="">-- Choisir un client enregistré --</option>
                  {clients.map(cli => (
                    <option key={cli.id} value={cli.id}>
                      {cli.name} • {cli.phone} {cli.passport ? `(${cli.passport})` : ''}
                    </option>
                  ))}
                </select>
                {errors.client && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.client}
                  </p>
                )}
              </div>
            )}

            {/* Mode Nouveau Client */}
            {clientMode === 'new' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50/80 border border-slate-200/70">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom complet ou Entreprise *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Famille Ba, Mamadou Diop..."
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.clientName ? 'border-rose-300' : 'border-slate-200'
                    }`}
                  />
                  {errors.clientName && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.clientName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Téléphone WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+221 77 000 00 00"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.clientPhone ? 'border-rose-300' : 'border-slate-200'
                    }`}
                  />
                  {errors.clientPhone && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.clientPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="client@email.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Passeport principal (optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: SN-0984210"
                    value={clientPassport}
                    onChange={(e) => setClientPassport(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
              </div>
            )}

          </div>

          {/* ================= SECTION 2 : INFORMATIONS VOYAGE ================= */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              2. Détails du Voyage & Réservation
            </span>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Intitulé descriptif du dossier (optionnel)
              </label>
              <input
                type="text"
                placeholder="Ex: Séjour Médical Paris, Omra Famille Cissé, Mission Export..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destination principale *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Paris (CDG), Djeddah (JED), Dubaï (DXB)..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.destination ? 'border-rose-300' : 'border-slate-200'
                  }`}
                />
                {errors.destination && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.destination}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Type de voyage
                </label>
                <select
                  value={tripType}
                  onChange={(e) => setTripType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option>Séjour Vacances</option>
                  <option>Vol sec</option>
                  <option>Omra / Pèlerinage</option>
                  <option>Voyage d'affaires</option>
                  <option>Séjour médical</option>
                  <option>Groupe scolaire / Conférence</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date de départ *
                </label>
                <input
                  type="date"
                  required
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.departureDate ? 'border-rose-300' : 'border-slate-200'
                  }`}
                />
                {errors.departureDate && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.departureDate}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date de retour (optionnel)
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.returnDate ? 'border-rose-300' : 'border-slate-200'
                  }`}
                />
                {errors.returnDate && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.returnDate}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre de voyageurs *
                </label>
                <input
                  type="number"
                  min="1"
                  max="150"
                  required
                  value={pax}
                  onChange={(e) => setPax(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.pax ? 'border-rose-300' : 'border-slate-200'
                  }`}
                />
                {errors.pax && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.pax}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Montant total estimé du dossier (FCFA)
              </label>
              <input
                type="number"
                placeholder="Ex: 2850000"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Vous pourrez ajouter des paiements partiels (acomptes) dans l'onglet Facturation du dossier.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notes ou instructions spécifiques
              </label>
              <textarea
                rows="3"
                placeholder="Contraintes de vol, préférences compagnies, assistance visa, hôtel..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* ================= ACTIONS FINALES ================= */}
          <div className="pt-5 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/app/dossiers"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              Annuler
            </Link>

            <button
              type="submit"
              disabled={isSubmitting || !!successDossierId}
              className="fluent-btn px-6 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0b5751] disabled:opacity-50 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enregistrement du dossier...</span>
                </>
              ) : successDossierId ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Dossier #{successDossierId} créé !</span>
                </>
              ) : (
                <span>Créer le Dossier (Brouillon) →</span>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
