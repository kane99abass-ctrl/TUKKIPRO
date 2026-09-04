import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Charger profil et agence depuis Supabase
  const fetchProfileAndAgency = async (authUser) => {
    if (!authUser) {
      setUser(null);
      setAgency(null);
      setLoading(false);
      return;
    }

    try {
      // 1. Récupération du profil lié
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileErr || !profile) {
        console.warn('Profil introuvable pour cet utilisateur:', profileErr);
        // Fallback temporaire avec les métadonnées auth
        setUser({
          id: authUser.id,
          email: authUser.email,
          fullName: authUser.user_metadata?.full_name || 'Agent',
          role: authUser.user_metadata?.role || 'Agent de comptoir',
          status: 'Actif',
          agencyId: null
        });
        setLoading(false);
        return;
      }

      setUser({
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role,
        status: profile.status,
        agencyId: profile.agency_id
      });

      // 2. Récupération de l'agence
      if (profile.agency_id) {
        const { data: agcy, error: agencyErr } = await supabase
          .from('agencies')
          .select('*')
          .eq('id', profile.agency_id)
          .single();

        if (!agencyErr && agcy) {
          setAgency({
            id: agcy.id,
            name: agcy.name,
            slug: agcy.slug,
            country: agcy.country,
            city: agcy.city,
            currency: agcy.currency,
            plan: agcy.plan,
            phoneWhatsApp: agcy.phone_whatsapp
          });
        }
      }
    } catch (err) {
      console.error('Erreur chargement profil/agence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      if (currentSession?.user) {
        await fetchProfileAndAgency(currentSession.user);
      } else {
        setUser(null);
        setAgency(null);
        setLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Connexion
  const login = async (email, password) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    }
    await fetchProfileAndAgency(data.user);
    return { success: true };
  };

  // Inscription nouvelle agence (Créateur = Administrateur)
  const registerAgency = async ({ email, password, fullName, agencyName, phone, country = 'Sénégal' }) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          agency_name: agencyName,
          phone_whatsapp: phone,
          country
        }
      }
    });

    if (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    }

    if (data.session) {
      await fetchProfileAndAgency(data.user);
    }
    return { success: true };
  };

  // Inscription via invitation collaborateur
  const acceptInvitation = async ({ email, password, fullName, invitationToken }) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          invitation_token: invitationToken
        }
      }
    });

    if (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    }

    if (data.session) {
      await fetchProfileAndAgency(data.user);
    }
    return { success: true };
  };

  // Déconnexion
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAgency(null);
    setSession(null);
  };

  // Helpers RBAC pour l'interface
  const role = user?.role || 'Agent de comptoir';
  const isAdmin = role === 'Administrateur';
  const isManager = role === 'Responsable d\'agence' || isAdmin;
  const isComptable = role === 'Comptable';
  const isBilletterie = role === 'Agent billetterie';
  const isComptoir = role === 'Agent de comptoir';

  const canManageTeam = isAdmin || role === 'Responsable d\'agence';
  const canManageSettings = isAdmin;
  const canManageFinance = isAdmin || role === 'Responsable d\'agence' || isComptable;
  const canIssueTickets = isAdmin || role === 'Responsable d\'agence' || isComptoir || isBilletterie;
  const canDeleteDossier = isAdmin;
  const canDeleteClient = isAdmin;

  const value = {
    session,
    user: user || {
      id: 'demo',
      fullName: 'Agent Tukkipro',
      email: 'contact@tukkipro.com',
      role: 'Administrateur',
      agencyId: 'demo'
    },
    agency: agency || {
      name: 'Téranga Voyages Dakar',
      currency: 'FCFA',
      plan: 'Pro',
      country: 'Sénégal',
      city: 'Dakar'
    },
    isAuthenticated: !!session || !!user,
    loading,
    authError,
    login,
    registerAgency,
    acceptInvitation,
    logout,
    // Permissions RBAC
    role,
    isAdmin,
    isManager,
    isComptable,
    isBilletterie,
    isComptoir,
    canManageTeam,
    canManageSettings,
    canManageFinance,
    canIssueTickets,
    canDeleteDossier,
    canDeleteClient,
    // Refresh
    refreshUser: () => fetchProfileAndAgency(session?.user)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l’intérieur d’un AuthProvider');
  }
  return context;
}
export default useAuth;
