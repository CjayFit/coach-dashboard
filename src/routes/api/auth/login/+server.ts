import * as bcrypt from 'bcryptjs';
import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

export async function POST({ request }) {
	const { email, password } = await request.json();

	if (!email || !password) {
		return json({ client: null, error: 'Email et mot de passe requis.' }, { status: 400 });
	}

	console.log('Login attempt with email:', email);

	// Recherche de l'utilisateur dans Supabase
	const { data: clients, error } = await supabase
		.from('clients')
		.select('*')
		.eq('email', email.trim().toLowerCase());

	if (error || !clients || clients.length === 0) {
		console.log('Client not found or error:', error);
		return json({ client: null, error: 'Aucun compte client trouvé pour cette adresse email.' }, { status: 401 });
	}

	const client = clients[0];
	console.log('Client found in Supabase:', client.email);

	try {
		// Validation du mot de passe
		const isPasswordValid = await bcrypt.compare(password, client.password_hash);
		console.log('Password validation result:', isPasswordValid, 'for client:', email);
		
		if (!isPasswordValid) {
			return json({ client: null, error: 'Mot de passe incorrect.' }, { status: 401 });
		}
	} catch (err) {
		console.error('Error verifying password:', err);
		return json({ client: null, error: 'Erreur interne de vérification. Réessayez.' }, { status: 500 });
	}

	// Préparation sécurisée du client et formatage pour l'application
	const { password_hash, ...safeClient } = client;
	
	const formattedClient = {
		id: safeClient.id,
		name: safeClient.name,
		email: safeClient.email,
		goal: safeClient.goal,
		targetCalories: safeClient.target_calories,
		targetProtein: safeClient.target_protein,
		trainingTargetPerWeek: safeClient.training_target_per_week,
	};

	console.log(`Login successful in Supabase for ${email}`);
	return json({ client: formattedClient, error: null });
}
