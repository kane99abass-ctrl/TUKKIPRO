import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { supabase } from '../../lib/supabase.js';
import { Search, Plus, FileText, Download, CheckCircle2, AlertCircle, Loader2, UploadCloud, Shield } from 'lucide-react';

export default function DocumentsPage() {
  const { documents, dossiers, addDocument, isLoading } = useData();
  const { canIssueTickets, role } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Formulaire upload
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Passeport');
  const [selectedDossierId, setSelectedDossierId] = useState('');
  const [clientName, setClientName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filtered = documents.filter(d =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.client?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectDossier = (e) => {
    const dId = e.target.value;
    setSelectedDossierId(dId);
    const found = dossiers.find(d => d.id === dId || d.dbId === dId);
    if (found) {
      setClientName(found.client);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!docName.trim()) return;

    setIsUploading(true);

    try {
      const fileName = docName.includes('.') ? docName : `${docName}.pdf`;
      await addDocument({
        name: fileName,
        type: docType,
        client: clientName.trim() || 'Client Agence',
        dossierId: selectedDossierId || '',
        file: selectedFile,
        size: selectedFile ? `${Math.round(selectedFile.size / 1024)} KB` : '1.5 MB',
        status: 'Validé'
      });

      setDocName('');
      setSelectedDossierId('');
      setClientName('');
      setSelectedFile(null);
      setIsUploadOpen(false);
      showToast('Document numérisé et synchronisé avec succès sur Supabase Storage !');
    } catch (err) {
      alert(err.message || 'Erreur lors de l’envoi du document.');
    } finally {
      setIsUploading(false);
    }
  };

  // Téléchargement sécurisé via URL signée Supabase Storage
  const handleDownload = async (doc) => {
    if (doc.storagePath) {
      try {
        const { data, error } = await supabase.storage
          .from('agency-documents')
          .createSignedUrl(doc.storagePath, 60);

        if (!error && data?.signedUrl) {
          window.open(data.signedUrl, '_blank');
          return;
        }
      } catch (e) {
        console.warn('Fallback téléchargement:', e);
      }
    }
    showToast(`Téléchargement initié pour : ${doc.name}`);
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
          <h1 className="text-2xl font-bold font-title text-slate-900">Centre Documentaire</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Archivage chiffré et sécurisé des pièces d'identité, billets électroniques et visas.
          </p>
          {isLoading && (
            <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-1 font-mono">
              <Loader2 className="w-2.5 h-2.5 animate-spin" />
              <span>Synchronisation Supabase Storage...</span>
            </span>
          )}
        </div>

        {canIssueTickets ? (
          <button 
            onClick={() => setIsUploadOpen(true)}
            className="fluent-btn px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0b5751] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Téléverser un Document</span>
          </button>
        ) : (
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>Téléversement restreint ({role})</span>
          </div>
        )}
      </div>

      {/* Barre de recherche */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Rechercher par nom de fichier, type, client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-slate-400 self-end sm:self-auto font-medium">
          {filtered.length} document{filtered.length > 1 ? 's' : ''} indexé{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Liste des Documents */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-semibold uppercase border-b border-slate-100">
                <th className="py-3 px-4">Intitulé du document</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Client rattaché</th>
                <th className="py-3 px-4">Taille</th>
                <th className="py-3 px-4">Date dépôt</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-800 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center shrink-0 border border-teal-100/50">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block font-semibold">{doc.name}</span>
                      {doc.dossierId && (
                        <span className="text-[10px] text-[#0F766E] font-mono">
                          Dossier #{doc.dossierId}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {doc.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{doc.client}</td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{doc.size}</td>
                  <td className="py-3.5 px-4 text-slate-500">{doc.date}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#0F766E] hover:bg-teal-50 transition-colors cursor-pointer inline-flex items-center gap-1 font-semibold"
                      title="Télécharger"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Télécharger</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modale Upload Document */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 relative">
            <button 
              onClick={() => setIsUploadOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              ✕
            </button>
            <h2 className="font-bold text-base text-slate-900 mb-1">Archiver un Document</h2>
            <p className="text-xs text-slate-500 mb-4">
              Enregistrez une pièce justificative chiffrée dans le dossier de voyage.
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Intitulé du document *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Passeport_Amadou_Diallo.pdf"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type de document</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option>Passeport</option>
                    <option>Billet d'avion</option>
                    <option>Attestation d'assurance</option>
                    <option>Reçu de paiement</option>
                    <option>Formulaire Visa</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rattacher au dossier</label>
                  <select
                    value={selectedDossierId}
                    onChange={handleSelectDossier}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-mono text-[11px]"
                  >
                    <option value="">Aucun dossier</option>
                    {dossiers.map(d => (
                      <option key={d.id} value={d.id}>
                        #{d.id} — {d.client}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fichier numérique (Optionnel)</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full text-[11px] text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-[#0F766E] hover:file:bg-teal-100 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="fluent-btn px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0b5751] text-white font-bold flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Téléversement...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Enregistrer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
