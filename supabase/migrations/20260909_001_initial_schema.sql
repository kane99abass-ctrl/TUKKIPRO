-- ==============================================================================
-- TUKKIPRO - MIGRATION INITIALE : SCHÉMA POSTGRESQL (PHASE 1)
-- Version : 20260909_001_initial_schema.sql
-- Description : Création non-destructive des tables, relations, contraintes,
--               types numériques et index de performance pour TukkiPro.
-- ATTENTION : Ce script ne configure PAS de RLS, triggers ou bucket Storage
--             (réservés aux phases suivantes).
-- ==============================================================================

-- Activation de l'extension pgcrypto pour les UUID si non déjà présente
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TABLE : agencies (Multi-Tenant Master)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    country TEXT NOT NULL DEFAULT 'Sénégal',
    city TEXT NOT NULL DEFAULT 'Dakar',
    currency TEXT NOT NULL DEFAULT 'FCFA',
    plan TEXT NOT NULL DEFAULT 'Pro' CHECK (plan IN ('Essentiel', 'Pro', 'Entreprise')),
    phone_whatsapp TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index de recherche
CREATE INDEX IF NOT EXISTS idx_agencies_slug ON public.agencies(slug);

-- ==============================================================================
-- 2. TABLE : profiles (Membres d'équipe rattachés à auth.users et agencies)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Agent de comptoir' CHECK (
        role IN (
            'Administrateur',
            'Responsable d''agence',
            'Agent de comptoir',
            'Agent billetterie',
            'Comptable'
        )
    ),
    status TEXT NOT NULL DEFAULT 'Actif' CHECK (
        status IN ('Actif', 'Inactif', 'Suspendu')
    ),
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index multi-tenant & recherche
CREATE INDEX IF NOT EXISTS idx_profiles_agency_id ON public.profiles(agency_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ==============================================================================
-- 3. TABLE : agency_invitations (Invitations de collaborateurs par token)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.agency_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Agent de comptoir' CHECK (
        role IN (
            'Administrateur',
            'Responsable d''agence',
            'Agent de comptoir',
            'Agent billetterie',
            'Comptable'
        )
    ),
    token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'accepted', 'expired', 'cancelled')
    ),
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invitations_agency_id ON public.agency_invitations(agency_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.agency_invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.agency_invitations(agency_id, status);

-- ==============================================================================
-- 4. TABLE : clients (Répertoire de clients et voyageurs)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    code TEXT, -- Code format court attendu par l'UI (ex: CL-001)
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    passport TEXT,
    city TEXT DEFAULT 'Dakar',
    country TEXT DEFAULT 'Sénégal',
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_agency_id ON public.clients(agency_id);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(agency_id, phone);
CREATE INDEX IF NOT EXISTS idx_clients_name ON public.clients(agency_id, name);
CREATE INDEX IF NOT EXISTS idx_clients_code ON public.clients(agency_id, code);

-- ==============================================================================
-- 5. TABLE : dossiers (Dossiers de voyage & billetterie)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.dossiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    ref_code TEXT, -- Référence format lisible attendue par l'UI (ex: TK-4081)
    title TEXT,
    destination TEXT NOT NULL,
    trip_type TEXT NOT NULL DEFAULT 'Vol sec' CHECK (
        trip_type IN (
            'Vol sec',
            'Séjour Vacances',
            'Omra / Pèlerinage',
            'Voyage d''affaires',
            'Séjour médical',
            'Groupe scolaire / Conférence',
            'Vol sec Aller-Retour',
            'Package Touristique',
            'Autre'
        )
    ),
    route TEXT,
    departure_date DATE NOT NULL,
    return_date DATE,
    pax INTEGER NOT NULL DEFAULT 1 CHECK (pax >= 1),
    airline TEXT DEFAULT 'Air Sénégal',
    flight_number TEXT,
    pnr TEXT,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    paid_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0),
    status TEXT NOT NULL DEFAULT 'Brouillon' CHECK (
        status IN (
            'Brouillon',
            'Option vol',
            'Acompte reçu',
            'Visa déposé',
            'Billet émis',
            'Soldé',
            'Terminé',
            'Annulé'
        )
    ),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dossiers_agency_id ON public.dossiers(agency_id);
CREATE INDEX IF NOT EXISTS idx_dossiers_client_id ON public.dossiers(client_id);
CREATE INDEX IF NOT EXISTS idx_dossiers_status ON public.dossiers(agency_id, status);
CREATE INDEX IF NOT EXISTS idx_dossiers_ref_code ON public.dossiers(agency_id, ref_code);
CREATE INDEX IF NOT EXISTS idx_dossiers_departure_date ON public.dossiers(agency_id, departure_date);

-- ==============================================================================
-- 6. TABLE : passengers (Passagers rattachés à un dossier de voyage)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.passengers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    dossier_id UUID NOT NULL REFERENCES public.dossiers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    passport TEXT,
    role TEXT NOT NULL DEFAULT 'Passager' CHECK (
        role IN ('Passager', 'Adulte', 'Enfant', 'Bébé', 'Responsable')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_passengers_dossier_id ON public.passengers(dossier_id);
CREATE INDEX IF NOT EXISTS idx_passengers_agency_id ON public.passengers(agency_id);

-- ==============================================================================
-- 7. TABLE : payments (Règlements financiers & acomptes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    dossier_id UUID REFERENCES public.dossiers(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    receipt_ref TEXT, -- Référence reçu (ex: REC-9421)
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    method TEXT NOT NULL DEFAULT 'Virement Bancaire' CHECK (
        method IN (
            'Virement Bancaire',
            'Virement Bancaire (CBAO)',
            'Orange Money',
            'Wave Sénégal',
            'Wave',
            'Chèque certifié',
            'Chèque',
            'Espèces en agence',
            'Espèces',
            'Carte Bancaire Visa / Mastercard',
            'Carte',
            'Autre'
        )
    ),
    status TEXT NOT NULL DEFAULT 'Encaissé' CHECK (
        status IN ('Encaissé', 'En attente', 'Remboursé')
    ),
    payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_agency_id ON public.payments(agency_id);
CREATE INDEX IF NOT EXISTS idx_payments_dossier_id ON public.payments(dossier_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON public.payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(agency_id, payment_date);

-- ==============================================================================
-- 8. TABLE : visas (Suivi des démarches consulaires)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.visas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    dossier_id UUID REFERENCES public.dossiers(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    traveler TEXT NOT NULL,
    destination TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Court séjour touristique' CHECK (
        type IN (
            'Court séjour touristique',
            'E-Visa d''affaires',
            'Visa Omra / Pèlerinage',
            'Visa Étudiant',
            'Visa Visite familiale',
            'Court séjour',
            'Autre'
        )
    ),
    deposit_date DATE,
    expected_date TEXT,
    appointment_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'En cours' CHECK (
        status IN ('En cours', 'Entretien fixé', 'Délivré', 'Refusé', 'Préparation')
    ),
    tracking_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visas_agency_id ON public.visas(agency_id);
CREATE INDEX IF NOT EXISTS idx_visas_dossier_id ON public.visas(dossier_id);
CREATE INDEX IF NOT EXISTS idx_visas_status ON public.visas(agency_id, status);

-- ==============================================================================
-- 9. TABLE : student_files (Pôle Visas Étudiants & Campus France)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.student_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    ref_code TEXT, -- Référence (ex: TK-ST-0001)
    target_country TEXT NOT NULL,
    target_institution TEXT NOT NULL,
    target_program TEXT NOT NULL,
    target_degree_level TEXT DEFAULT 'Licence',
    intake_session TEXT DEFAULT 'Septembre 2026',
    expected_departure_date DATE,
    education_level TEXT,
    field_of_study TEXT,
    previous_institution TEXT,
    diploma_obtained TEXT,
    academic_year TEXT,
    grades_summary TEXT,
    status TEXT NOT NULL DEFAULT 'Nouveau candidat' CHECK (
        status IN (
            'Nouveau candidat',
            'Dossier en préparation',
            'Documents incomplets',
            'Candidature envoyée',
            'En attente d''admission',
            'Admission obtenue',
            'Préparation visa',
            'Visa déposé',
            'Visa en cours',
            'Visa obtenu',
            'Visa refusé',
            'Départ confirmé',
            'Dossier terminé',
            'Dossier abandonné'
        )
    ),
    admission_status TEXT DEFAULT 'Brouillon' CHECK (
        admission_status IN (
            'Brouillon',
            'En attente',
            'Admission obtenue',
            'Admission conditionnelle',
            'Refusée',
            'Préparation'
        )
    ),
    application_number TEXT,
    application_date DATE,
    admission_date DATE,
    admission_deadline DATE,
    visa_type TEXT DEFAULT 'Permis d''études / Visa D',
    visa_center TEXT,
    visa_deposit_date DATE,
    visa_appointment_date TIMESTAMPTZ,
    visa_biometrics_date TIMESTAMPTZ,
    visa_status TEXT DEFAULT 'Préparation' CHECK (
        visa_status IN (
            'Préparation',
            'En cours de traitement',
            'Dossier déposé',
            'Biométrie',
            'Rendez-vous à prendre',
            'Approuvé',
            'Refusé',
            'Documents en attente'
        )
    ),
    visa_decision_date DATE,
    visa_notes TEXT,
    action_required TEXT,
    action_due_date DATE,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    total_fee NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (total_fee >= 0),
    paid_fee NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (paid_fee >= 0),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_files_agency_id ON public.student_files(agency_id);
CREATE INDEX IF NOT EXISTS idx_student_files_client_id ON public.student_files(client_id);
CREATE INDEX IF NOT EXISTS idx_student_files_status ON public.student_files(agency_id, status);
CREATE INDEX IF NOT EXISTS idx_student_files_ref_code ON public.student_files(agency_id, ref_code);

-- ==============================================================================
-- 10. TABLE : student_institutions (Universités et écoles partenaires)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.student_institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE, -- Nullable : si NULL, disponible comme ressource globale partagée
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    programs TEXT[] DEFAULT '{}',
    website TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_institutions_agency ON public.student_institutions(agency_id);
CREATE INDEX IF NOT EXISTS idx_institutions_country ON public.student_institutions(country);

-- ==============================================================================
-- 11. TABLE : documents (Métadonnées des fichiers stockés)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    dossier_id UUID REFERENCES public.dossiers(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    student_file_id UUID REFERENCES public.student_files(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Passeport' CHECK (
        type IN (
            'Passeport',
            'Billet',
            'Attestation',
            'Facture / Reçu',
            'Visa',
            'Diplômes',
            'Lettre d''admission',
            'Relevés de notes',
            'Preuve financière',
            'Documents visa',
            'CV',
            'Lettre de motivation',
            'Autre'
        )
    ),
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Validé' CHECK (
        status IN ('Validé', 'En attente', 'Rejeté', 'Archivé')
    ),
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_agency_id ON public.documents(agency_id);
CREATE INDEX IF NOT EXISTS idx_documents_dossier_id ON public.documents(dossier_id);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON public.documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_student_file_id ON public.documents(student_file_id);

-- ==============================================================================
-- 12. TABLE : notifications (Alertes & rappels agence)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'info',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    unread BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_agency_unread ON public.notifications(agency_id, unread);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- ==============================================================================
-- 13. TABLE : dossier_history (Journal d'audit des dossiers de voyage)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.dossier_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dossier_id UUID NOT NULL REFERENCES public.dossiers(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dossier_history_dossier_id ON public.dossier_history(dossier_id);

-- ==============================================================================
-- 14. TABLE : student_file_history (Journal d'audit des dossiers étudiants)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.student_file_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_file_id UUID NOT NULL REFERENCES public.student_files(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    action TEXT NOT NULL,
    from_status TEXT,
    to_status TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_file_history_file_id ON public.student_file_history(student_file_id);
