import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { supabase } from '../../lib/supabase.js';
import { Users, Plus, CheckCircle2, Mail, Shield, AlertCircle, Copy, Clock, Loader2, Trash2 } from 'lucide-react';

export default function TeamPage() {
  const { user, canManageTeam, isAdmin, role } = useAuth();

  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Agent de comptoir');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedInviteLink, setGeneratedInviteLink] = useState(null);

  const [toastMessage, setToastMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadTeam = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Charger les profils
      const { data: profs, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (!pErr && profs) {
        setMembers(profs);
      } else {
        // Fallback local
        setMembers([
          { id: user?.id, full_name: user?.fullName || 'Agent', email: user?.email, role: user?.role || 'Administrateur', status: 'Actif' }
        ]);
      }

      // 2. Charger les invitations en attente si manager ou admin
      if (canManageTeam) {
        const { data: invs, error: iErr } = await supabase
          .from('agency_invitations')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (!iErr && invs) {
          setInvitations(invs);
        }
      }
    } catch (err) {
      console.error('Erreur chargement équipe:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, canManageTeam]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  // Inviter un collaborateur via la RPC sécurisée
  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    setGeneratedInviteLink(null);

    try {
      const { data, error } = await supabase.rpc('create_agency_invitation', {
        p_email: inviteEmail.trim(),
        p_role: inviteRole
      });

      if (error) throw error;

      const link = `${window.location.origin}/register?token=${data.token}`;
      setGeneratedInviteLink(link);
      showToast(`Lien d'invitation généré pour ${inviteEmail} !`);
      await loadTeam();
    } catch (err) {
      setErrorMsg(err.message || 'Impossible de générer l’invitation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modification du rôle d'un membre par un Administrateur via RPC
  const handleUpdateRole = async (targetUserId, newRole) => {
    if (!isAdmin) return;
    try {
      const { data, error } = await supabase.rpc('update_profile_role_or_status', {
        p_target_user_id: targetUserId,
        p_new_role: newRole,
        p_new_status: 'Actif'
      });

      if (error) throw error;
      showToast('Rôle du collaborateur mis à jour !');
      await loadTeam();
    } catch (err) {
      alert(err.message || 'Erreur lors de la modification du rôle.');
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

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-title text-slate-900">Équipe de l'Agence</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0F766E] font-mono font-bold border border-teal-100">
              Votre rôle : {role}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestion sécurisée des agents, des rôles RBAC et des invitations d'accès.
          </p>
        </div>

        {canManageTeam && (
          <button 
            onClick={() => {
              setGeneratedInviteLink(null);
              setErrorMsg(null);
              setIsInviteOpen(true);
            }}
            className="fluent-btn px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0b5751] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Inviter un Collaborateur</span>
          </button>
        )}
      </div>

      {/* Tableau Collaborateurs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-700 flex items-center justify-between">
          <span>Membres actifs ({members.length})</span>
          {isLoading && <span className="text-slate-400 font-normal">Synchronisation Supabase...</span>}
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-400 font-semibold uppercase border-b border-slate-100">
              <th className="py-3 px-4">Collaborateur</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Rôle RBAC</th>
              <th className="py-3 px-4">Statut</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-800 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-teal-100 text-[#0F766E] font-bold text-xs flex items-center justify-center shrink-0">
                    {(m.full_name || 'Agent').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span>{m.full_name}</span>
                    {m.id === user?.id && (
                      <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-normal">
                        Vous
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">{m.email}</td>
                <td className="py-3.5 px-4">
                  {isAdmin && m.id !== user?.id ? (
                    <select
                      value={m.role}
                      onChange={(e) => handleUpdateRole(m.id, e.target.value)}
                      className="px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white text-[#0F766E] font-bold focus:ring-2 focus:ring-teal-500"
                    >
                      <option>Administrateur</option>
                      <option>Responsable d'agence</option>
                      <option>Agent de comptoir</option>
                      <option>Agent billetterie</option>
                      <option>Comptable</option>
                    </select>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#0F766E] border border-teal-100">
                      {m.role}
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    m.status === 'Actif' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {m.status || 'Actif'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  {isAdmin && m.id !== user?.id ? (
                    <span className="text-[11px] text-slate-400">Modifiable par Admin</span>
                  ) : (
                    <span className="text-[11px] text-slate-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invitations en attente */}
      {canManageTeam && invitations.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-700 flex items-center justify-between">
            <span>Invitations en attente d'activation ({invitations.length})</span>
            <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              Validité 7 jours
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-semibold uppercase border-b border-slate-100">
                <th className="py-3 px-4">Email invité</th>
                <th className="py-3 px-4">Rôle attribué</th>
                <th className="py-3 px-4">Date d'envoi</th>
                <th className="py-3 px-4 text-right">Lien d'accès</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invitations.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-bold text-slate-800 font-mono">{inv.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                      {inv.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(inv.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        const link = `${window.location.origin}/register?token=${inv.token}`;
                        navigator.clipboard?.writeText(link);
                        showToast('Lien d’activation copié dans le presse-papier !');
                      }}
                      className="text-[#0F766E] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copier lien</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Inviter Collaborateur */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 relative">
            <button 
              onClick={() => setIsInviteOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              ✕
            </button>
            <h2 className="font-bold text-base text-slate-900 mb-1">Inviter un Collaborateur</h2>
            <p className="text-xs text-slate-500 mb-4">
              Générez un lien d'activation cryptographique sécurisé pour un membre de votre équipe.
            </p>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {generatedInviteLink ? (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                  <p className="font-bold mb-1">✓ Invitation créée avec succès !</p>
                  Transmettez ce lien sécurisé au collaborateur :
                  <div className="mt-2 p-2 rounded bg-white border border-emerald-200 font-mono text-[10px] break-all select-all">
                    {generatedInviteLink}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(generatedInviteLink);
                      showToast('Lien copié dans le presse-papier !');
                    }}
                    className="fluent-btn px-4 py-2 rounded-xl bg-[#0F766E] text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier le lien</span>
                  </button>
                  <button
                    onClick={() => setIsInviteOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email professionnel du collaborateur *</label>
                  <input
                    type="email"
                    required
                    placeholder="mariama.sy@votre-agence.sn"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rôle métier attribué</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option>Agent de comptoir</option>
                    <option>Agent billetterie</option>
                    <option>Comptable</option>
                    <option>Responsable d'agence</option>
                    {isAdmin && <option>Administrateur</option>}
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="fluent-btn px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0b5751] text-white font-bold flex items-center gap-1.5 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Génération...</span>
                      </>
                    ) : (
                      <span>Générer l'invitation</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
