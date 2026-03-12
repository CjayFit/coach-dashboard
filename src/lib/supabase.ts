import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from './types';
import { mockSupabaseClient } from './mockData';

// Vérifier si les clés Supabase sont configurées
const isSupabaseConfigured = 
	PUBLIC_SUPABASE_URL && 
	PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co' &&
	PUBLIC_SUPABASE_ANON_KEY && 
	PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

// Créer le client Supabase ou utiliser le mock
export const supabase = isSupabaseConfigured
	? createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)
	: (mockSupabaseClient as any);

// Message de debug dans la console
if (typeof window !== 'undefined') {
	if (isSupabaseConfigured) {
		console.log('✅ Supabase connecté:', PUBLIC_SUPABASE_URL);
	} else {
		console.warn('⚠️ MODE DEMO: Données mockées utilisées. Configure Supabase dans .env pour la production.');
	}
}
