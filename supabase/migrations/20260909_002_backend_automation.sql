-- ==============================================================================
-- TUKKIPRO - MIGRATION PHASE 2 : AUTOMATISATION BACKEND & TRIGGERS
-- Fichier : 20260909_002_backend_automation.sql
-- Description : 
--   1. Alignement additif des colonnes d'audit (ALTER TABLE ... ADD COLUMN IF NOT EXISTS)
--   2. Séquences et triggers de numérotation automatique (TK-XXXX, CL-XXX, REC-XXXX, TK-ST-XXXX)
--   3. Trigger automatique de création Agence & Profil utilisateur (on_auth_user_created)
--   4. Trigger de synchronisation financière automatique entre paiements et dossiers
--   5. Fonctions RPC sécurisées pour la gestion d'équipe et invitations
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ALIGNEMENT ADDITIF NON-DESTRUCTIF DES COLONNES
-- ------------------------------------------------------------------------------
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.visas ADD COLUMN IF NOT EXISTS appointment_date TIMESTAMPTZ;
ALTER TABLE public.visas ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ------------------------------------------------------------------------------
-- 2. SÉQUENCES DE NUMÉROTATION UNIQUE
-- ------------------------------------------------------------------------------

-- Séquence pour les codes clients (ex: CL-001, CL-002...)
CREATE SEQUENCE IF NOT EXISTS public.client_code_seq START WITH 1;

-- Séquence pour les références dossiers de voyage (ex: TK-4081, TK-4082...)
CREATE SEQUENCE IF NOT EXISTS public.dossier_ref_seq START WITH 4081;

-- Séquence pour les reçus de paiement (ex: REC-9421, REC-9422...)
CREATE SEQUENCE IF NOT EXISTS public.payment_receipt_seq START WITH 9421;

-- Séquence pour les dossiers étudiants (ex: TK-ST-0001, TK-ST-0002...)
CREATE SEQUENCE IF NOT EXISTS public.student_file_ref_seq START WITH 1;

-- Synchronisation des séquences si des données existent déjà avec des numéros plus élevés
DO $$
BEGIN
    -- Synchronisation client_code_seq
    PERFORM setval(
        'public.client_code_seq',
        GREATEST(
            COALESCE((SELECT MAX(NULLIF(regexp_replace(code, '\D', '', 'g'), '')::BIGINT) FROM public.clients), 0) + 1,
            1
        ),
        false
    );
    -- Synchronisation dossier_ref_seq
    PERFORM setval(
        'public.dossier_ref_seq',
        GREATEST(
            COALESCE((SELECT MAX(NULLIF(regexp_replace(ref_code, '\D', '', 'g'), '')::BIGINT) FROM public.dossiers), 0) + 1,
            4081
        ),
        false
    );
    -- Synchronisation payment_receipt_seq
    PERFORM setval(
        'public.payment_receipt_seq',
        GREATEST(
            COALESCE((SELECT MAX(NULLIF(regexp_replace(receipt_ref, '\D', '', 'g'), '')::BIGINT) FROM public.payments), 0) + 1,
            9421
        ),
        false
    );
    -- Synchronisation student_file_ref_seq
    PERFORM setval(
        'public.student_file_ref_seq',
        GREATEST(
            COALESCE((SELECT MAX(NULLIF(regexp_replace(ref_code, '\D', '', 'g'), '')::BIGINT) FROM public.student_files), 0) + 1,
            1
        ),
        false
    );
END $$;

-- ------------------------------------------------------------------------------
-- 3. TRIGGERS DE GÉNÉRATION AUTOMATIQUE DES RÉFÉRENCES
-- ------------------------------------------------------------------------------

-- A. Trigger Numérotation Clients (CL-XXX)
CREATE OR REPLACE FUNCTION public.fn_generate_client_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.code IS NULL OR TRIM(NEW.code) = '' THEN
        NEW.code := 'CL-' || LPAD(nextval('public.client_code_seq')::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_client_code ON public.clients;
DROP TRIGGER IF EXISTS trg_client_code ON public.clients;
DROP TRIGGER IF EXISTS trg_clients_auto_ref ON public.clients;
DROP TRIGGER IF EXISTS trg_agency_counters_clients ON public.clients;
CREATE TRIGGER trg_generate_client_code
    BEFORE INSERT ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_generate_client_code();

-- B. Trigger Numérotation Dossiers de voyage (TK-XXXX)
CREATE OR REPLACE FUNCTION public.fn_generate_dossier_ref()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ref_code IS NULL OR TRIM(NEW.ref_code) = '' THEN
        NEW.ref_code := 'TK-' || nextval('public.dossier_ref_seq')::TEXT;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_dossier_ref ON public.dossiers;
DROP TRIGGER IF EXISTS trg_dossier_code ON public.dossiers;
DROP TRIGGER IF EXISTS trg_dossiers_auto_ref ON public.dossiers;
DROP TRIGGER IF EXISTS trg_agency_counters_dossiers ON public.dossiers;
CREATE TRIGGER trg_generate_dossier_ref
    BEFORE INSERT ON public.dossiers
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_generate_dossier_ref();

-- C. Trigger Numérotation Reçus de Paiement (REC-XXXX)
CREATE OR REPLACE FUNCTION public.fn_generate_payment_receipt()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.receipt_ref IS NULL OR TRIM(NEW.receipt_ref) = '' THEN
        NEW.receipt_ref := 'REC-' || nextval('public.payment_receipt_seq')::TEXT;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_payment_receipt ON public.payments;
DROP TRIGGER IF EXISTS trg_payment_receipt ON public.payments;
DROP TRIGGER IF EXISTS trg_payments_auto_ref ON public.payments;
DROP TRIGGER IF EXISTS trg_agency_counters_payments ON public.payments;
CREATE TRIGGER trg_generate_payment_receipt
    BEFORE INSERT ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_generate_payment_receipt();

-- D. Trigger Numérotation Dossiers Étudiants (TK-ST-XXXX)
CREATE OR REPLACE FUNCTION public.fn_generate_student_file_ref()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ref_code IS NULL OR TRIM(NEW.ref_code) = '' THEN
        NEW.ref_code := 'TK-ST-' || LPAD(nextval('public.student_file_ref_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_student_file_ref ON public.student_files;
CREATE TRIGGER trg_generate_student_file_ref
    BEFORE INSERT ON public.student_files
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_generate_student_file_ref();

-- ------------------------------------------------------------------------------
-- 4. TRIGGER DE SYNCHRONISATION FINANCIÈRE ENTRE PAIEMENTS ET DOSSIERS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_sync_dossier_financials()
RETURNS TRIGGER AS $$
DECLARE
    target_dossier_id UUID;
    total_paid NUMERIC(15, 2);
    current_total NUMERIC(15, 2);
    current_status TEXT;
BEGIN
    -- Identifier le dossier concerné
    IF TG_OP = 'DELETE' THEN
        target_dossier_id := OLD.dossier_id;
    ELSE
        target_dossier_id := NEW.dossier_id;
    END IF;

    -- Ne rien faire si le paiement n'est rattaché à aucun dossier
    IF target_dossier_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Calculer la somme réelle des paiements encaissés
    SELECT COALESCE(SUM(amount), 0.00)
    INTO total_paid
    FROM public.payments
    WHERE dossier_id = target_dossier_id
      AND status = 'Encaissé';

    -- Récupérer le montant total et le statut actuel du dossier
    SELECT total_amount, status
    INTO current_total, current_status
    FROM public.dossiers
    WHERE id = target_dossier_id;

    -- Mettre à jour le dossier
    UPDATE public.dossiers
    SET 
        paid_amount = total_paid,
        status = CASE 
            -- Si totalement payé et non encore soldé/terminé
            WHEN total_paid >= current_total AND current_total > 0 AND current_status NOT IN ('Terminé', 'Annulé') 
                THEN 'Soldé'
            -- Si acompte partiel reçu et dossier en statut initial
            WHEN total_paid > 0 AND total_paid < current_total AND current_status = 'Brouillon' 
                THEN 'Acompte reçu'
            ELSE current_status
        END,
        updated_at = now()
    WHERE id = target_dossier_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_dossier_financials ON public.payments;
CREATE TRIGGER trg_sync_dossier_financials
    AFTER INSERT OR UPDATE OR DELETE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_sync_dossier_financials();

-- ------------------------------------------------------------------------------
-- 5. TRIGGER ON_AUTH_USER_CREATED (CRÉATION AGENCE & PROFIL AUTOMATIQUE)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    meta JSONB;
    inv_token TEXT;
    inv_record RECORD;
    target_agency_id UUID;
    user_full_name TEXT;
    agency_name_val TEXT;
    phone_val TEXT;
    country_val TEXT;
    user_role TEXT;
BEGIN
    meta := NEW.raw_user_meta_data;
    inv_token := TRIM(COALESCE(meta->>'invitation_token', ''));
    user_full_name := TRIM(COALESCE(meta->>'full_name', split_part(NEW.email, '@', 1)));
    phone_val := NULLIF(TRIM(COALESCE(meta->>'phone_whatsapp', '')), '');
    country_val := TRIM(COALESCE(meta->>'country', 'Sénégal'));
    agency_name_val := TRIM(COALESCE(meta->>'agency_name', 'Agence ' || user_full_name));

    -- CAS A : L'utilisateur a utilisé un token d'invitation collaborateur
    IF inv_token <> '' THEN
        SELECT * INTO inv_record
        FROM public.agency_invitations
        WHERE token = inv_token
          AND status = 'pending'
          AND expires_at > now()
        LIMIT 1;

        IF FOUND THEN
            target_agency_id := inv_record.agency_id;
            user_role := inv_record.role;

            -- Marquer l'invitation comme acceptée
            UPDATE public.agency_invitations
            SET status = 'accepted', updated_at = now()
            WHERE id = inv_record.id;
        ELSE
            -- Fallback si le token est invalide ou expiré
            user_role := 'Agent de comptoir';
            target_agency_id := NULL;
        END IF;

    -- CAS B : Inscription normale (Créateur de l'agence = Administrateur)
    ELSE
        -- Création automatique de la nouvelle agence
        INSERT INTO public.agencies (name, country, city, currency, plan, phone_whatsapp)
        VALUES (agency_name_val, country_val, 'Dakar', 'FCFA', 'Pro', phone_val)
        RETURNING id INTO target_agency_id;

        user_role := 'Administrateur';
    END IF;

    -- Création atomique du profil collaborateur
    INSERT INTO public.profiles (id, agency_id, email, full_name, role, status, phone)
    VALUES (
        NEW.id,
        target_agency_id,
        NEW.email,
        user_full_name,
        user_role,
        'Actif',
        phone_val
    )
    ON CONFLICT (id) DO UPDATE SET
        agency_id = EXCLUDED.agency_id,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        status = 'Actif',
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        updated_at = now();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Rattachement du trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_auth_user();

-- ------------------------------------------------------------------------------
-- 6. FONCTIONS RPC POUR L'ÉQUIPE (TEAM PAGE & PARAMÈTRES)
-- ------------------------------------------------------------------------------

-- A. Création sécurisée d'une invitation collaborateur
CREATE OR REPLACE FUNCTION public.create_agency_invitation(
    p_email TEXT,
    p_role TEXT
)
RETURNS JSONB AS $$
DECLARE
    current_uid UUID;
    user_agency_id UUID;
    user_role TEXT;
    new_token TEXT;
    inv_id UUID;
BEGIN
    current_uid := auth.uid();
    IF current_uid IS NULL THEN
        RAISE EXCEPTION 'Authentification requise.';
    END IF;

    -- Récupérer l'agence et le rôle de l'émetteur
    SELECT agency_id, role INTO user_agency_id, user_role
    FROM public.profiles
    WHERE id = current_uid;

    IF user_role NOT IN ('Administrateur', 'Responsable d''agence') THEN
        RAISE EXCEPTION 'Action réservée aux Administrateurs et Responsables d''agence.';
    END IF;

    IF user_agency_id IS NULL THEN
        RAISE EXCEPTION 'Profil utilisateur non rattaché à une agence.';
    END IF;

    -- Générer le token unique
    new_token := encode(gen_random_bytes(24), 'hex');

    -- Insérer l'invitation
    INSERT INTO public.agency_invitations (
        agency_id,
        email,
        role,
        token,
        status,
        invited_by,
        expires_at
    )
    VALUES (
        user_agency_id,
        LOWER(TRIM(p_email)),
        p_role,
        new_token,
        'pending',
        current_uid,
        now() + INTERVAL '7 days'
    )
    RETURNING id INTO inv_id;

    RETURN jsonb_build_object(
        'success', true,
        'id', inv_id,
        'token', new_token,
        'email', LOWER(TRIM(p_email)),
        'role', p_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- B. Modification du rôle ou statut d'un collaborateur
CREATE OR REPLACE FUNCTION public.update_profile_role_or_status(
    p_target_user_id UUID,
    p_new_role TEXT,
    p_new_status TEXT DEFAULT 'Actif'
)
RETURNS JSONB AS $$
DECLARE
    current_uid UUID;
    caller_agency_id UUID;
    caller_role TEXT;
    target_agency_id UUID;
BEGIN
    current_uid := auth.uid();
    IF current_uid IS NULL THEN
        RAISE EXCEPTION 'Authentification requise.';
    END IF;

    -- Vérifier les droits de l'appelant
    SELECT agency_id, role INTO caller_agency_id, caller_role
    FROM public.profiles
    WHERE id = current_uid;

    IF caller_role <> 'Administrateur' THEN
        RAISE EXCEPTION 'Seul un Administrateur peut modifier les rôles de l''équipe.';
    END IF;

    -- Vérifier que la cible appartient à la même agence
    SELECT agency_id INTO target_agency_id
    FROM public.profiles
    WHERE id = p_target_user_id;

    IF target_agency_id IS NULL OR target_agency_id <> caller_agency_id THEN
        RAISE EXCEPTION 'Utilisateur cible introuvable dans votre agence.';
    END IF;

    -- Mettre à jour
    UPDATE public.profiles
    SET 
        role = COALESCE(p_new_role, role),
        status = COALESCE(p_new_status, status),
        updated_at = now()
    WHERE id = p_target_user_id;

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
