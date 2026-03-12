-- =============================================
-- COACH DASHBOARD - SUPABASE DATABASE SETUP
-- =============================================

-- 1. Créer la table clients
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    goal TEXT NOT NULL,
    start_weight NUMERIC(5,2) NOT NULL,
    current_weight NUMERIC(5,2) NOT NULL,
    training_adherence NUMERIC(3,2) DEFAULT 0.5 CHECK (training_adherence >= 0 AND training_adherence <= 1),
    protein_adherence NUMERIC(3,2) DEFAULT 0.5 CHECK (protein_adherence >= 0 AND protein_adherence <= 1),
    last_checkin DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Créer la table weekly_logs
CREATE TABLE IF NOT EXISTS public.weekly_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    sessions_completed INTEGER NOT NULL DEFAULT 0,
    sessions_planned INTEGER NOT NULL DEFAULT 0,
    protein_respected BOOLEAN NOT NULL DEFAULT false,
    weight NUMERIC(5,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(client_id, week_number)
);

-- 3. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_clients_name ON public.clients(name);
CREATE INDEX IF NOT EXISTS idx_weekly_logs_client_id ON public.weekly_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_weekly_logs_week ON public.weekly_logs(week_number);

-- 4. Activer Row Level Security (RLS)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_logs ENABLE ROW LEVEL SECURITY;

-- 5. Créer des politiques RLS pour l'authentification admin
-- IMPORTANT: Remplacer 'authenticated' par votre logique d'authentification

-- Autoriser toutes les opérations pour les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users all access on clients" 
    ON public.clients
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users all access on weekly_logs" 
    ON public.weekly_logs
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Alternative: Autoriser tous les accès (pour développement uniquement)
-- DÉCOMMENTER UNIQUEMENT SI VOUS N'UTILISEZ PAS D'AUTHENTIFICATION POUR LE MOMENT
-- CREATE POLICY "Allow public all access on clients" 
--     ON public.clients
--     FOR ALL 
--     TO public
--     USING (true)
--     WITH CHECK (true);

-- CREATE POLICY "Allow public all access on weekly_logs" 
--     ON public.weekly_logs
--     FOR ALL 
--     TO public
--     USING (true)
--     WITH CHECK (true);

-- 6. Créer des données de test (optionnel)
INSERT INTO public.clients (name, start_date, goal, start_weight, current_weight, training_adherence, protein_adherence, last_checkin)
VALUES 
    ('Jean Dupont', '2026-01-01', 'Prise de masse', 70.0, 73.5, 0.9, 0.85, '2026-02-10'),
    ('Marie Martin', '2026-01-15', 'Force et hypertrophie', 65.0, 66.2, 0.75, 0.70, '2026-02-12'),
    ('Paul Durand', '2026-02-01', 'Prise de masse', 80.0, 78.5, 0.50, 0.45, '2026-02-13')
ON CONFLICT DO NOTHING;

-- 7. Créer une fonction pour calculer automatiquement les métriques (optionnel - pour plus tard)
-- Cette fonction sera appelée quand on ajoute un weekly_log pour mettre à jour le client

CREATE OR REPLACE FUNCTION update_client_metrics()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.clients
    SET 
        current_weight = NEW.weight,
        training_adherence = (
            SELECT AVG(sessions_completed::NUMERIC / NULLIF(sessions_planned, 0))
            FROM public.weekly_logs
            WHERE client_id = NEW.client_id
            AND sessions_planned > 0
        ),
        protein_adherence = (
            SELECT AVG(CASE WHEN protein_respected THEN 1.0 ELSE 0.0 END)
            FROM public.weekly_logs
            WHERE client_id = NEW.client_id
        ),
        last_checkin = NEW.created_at::DATE
    WHERE id = NEW.client_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Créer un trigger pour mettre à jour automatiquement les métriques
CREATE TRIGGER trigger_update_client_metrics
    AFTER INSERT OR UPDATE ON public.weekly_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_client_metrics();

-- =============================================
-- FIN DU SCRIPT
-- =============================================
