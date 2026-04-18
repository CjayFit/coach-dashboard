import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';
import type { Database } from './types';
import { mockSupabaseClient } from './mockData';

const url = (env.PUBLIC_SUPABASE_URL || '').replace(/"/g, '').trim();
const key = (env.PUBLIC_SUPABASE_ANON_KEY || '').replace(/"/g, '').trim();

// Vérifier si les clés Supabase sont configurées
const isSupabaseConfigured = 
	url.startsWith('http') && 
	url !== 'https://your-project.supabase.co' &&
	key.length > 5 && 
	key !== 'your-anon-key-here';

// Créer le client Supabase ou utiliser le mock
export const supabase = isSupabaseConfigured
	? createClient<Database>(url, key)
	: (mockSupabaseClient as any);

// Message de debug dans la console
if (typeof window !== 'undefined') {
	if (isSupabaseConfigured) {
		console.log('✅ Supabase connecté:', url);
	} else {
		console.warn('⚠️ MODE DEMO: Données mockées utilisées. Configure Supabase dans .env pour la production.');
	}
}
