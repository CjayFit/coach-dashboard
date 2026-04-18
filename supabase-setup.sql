-- =============================================
-- COACH DASHBOARD - SUPABASE DATABASE SETUP
-- =============================================

-- 1. Créer la table clients
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    goal TEXT,
    target_calories INTEGER NOT NULL DEFAULT 2000,
    target_protein INTEGER NOT NULL DEFAULT 150,
    training_target_per_week INTEGER NOT NULL DEFAULT 3,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Créer la table daily_entries
CREATE TABLE IF NOT EXISTS public.daily_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    calories INTEGER NOT NULL,
    protein INTEGER NOT NULL,
    training_completed BOOLEAN NOT NULL DEFAULT false,
    weight NUMERIC(5,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(client_id, date)
);

-- 3. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_daily_entries_client_id ON public.daily_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_daily_entries_date ON public.daily_entries(date);

-- 4. Activer Row Level Security (RLS)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_entries ENABLE ROW LEVEL SECURITY;

-- 5. Créer des politiques RLS pour l'authentification admin
-- Dans un premier temps, on autorise tout le monde (accès public)
-- pour faciliter la transition depuis le mode local.
-- (À sécuriser plus tard avec l'authentification Supabase si besoin)

CREATE POLICY "Allow public all access on clients" 
    ON public.clients
    FOR ALL 
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public all access on daily_entries" 
    ON public.daily_entries
    FOR ALL 
    TO public
    USING (true)
    WITH CHECK (true);

-- 6. Créer des données de test (Démonstration)
INSERT INTO public.clients (id, name, email, goal, target_calories, target_protein, training_target_per_week, password_hash)
VALUES 
    ('87a419eb-948f-4ffb-88a4-37c2847fb600', 'Jean Dupont', 'jean.dupont@demo.local', 'Prise de masse', 2800, 180, 4, '$2b$10$hoZiZN01tp1JWFVF0Nukme4hS1ne0uCv/x.ETXUC7rzS6wdTwIEuS'),
    ('e2f60a92-fced-4b72-87ad-d2c67b9de8b7', 'Marie Martin', 'marie.martin@demo.local', 'Recomposition corporelle', 2400, 140, 4, '$2b$10$hoZiZN01tp1JWFVF0Nukme4hS1ne0uCv/x.ETXUC7rzS6wdTwIEuS'),
    ('b3ab2d0e-2693-4e89-994c-8519e4df6e8e', 'Paul Durand', 'paul.durand@demo.local', 'Perte de gras', 2300, 160, 3, '$2b$10$hoZiZN01tp1JWFVF0Nukme4hS1ne0uCv/x.ETXUC7rzS6wdTwIEuS')
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- FIN DU SCRIPT
-- =============================================
