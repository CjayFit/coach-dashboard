import * as bcrypt from 'bcryptjs';
import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

export async function POST({ request }) {
	const { name, email, goal, password, confirmPassword } = await request.json();

	// Validate inputs
	if (!name || !email || !goal || !password || !confirmPassword) {
		return json({ success: false, error: 'Tous les champs sont requis.' }, { status: 400 });
	}

	if (password.length < 8) {
		return json({ success: false, error: 'Le mot de passe doit contenir au moins 8 caractères.' }, { status: 400 });
	}

	if (password !== confirmPassword) {
		return json({ success: false, error: 'Les mots de passe ne correspondent pas.' }, { status: 400 });
	}

	// Check if email already exists
	try {
		console.log('Registering new client:', email);
		
		const { data: existingClients } = await supabase
			.from('clients')
			.select('id')
			.eq('email', email.trim().toLowerCase());

		if (existingClients && existingClients.length > 0) {
			console.log('Duplicate email attempt:', email);
			return json({ success: false, error: 'Un client avec cet email existe déjà.' }, { status: 409 });
		}

		const salt = await bcrypt.genSalt(10);
		const passwordHash = await bcrypt.hash(password, salt);
		console.log('Password hash generated:', passwordHash.substring(0, 20) + '...');

		// Add new client and save to supabase
		const targetCalories = 2000;
		const targetProtein = 150;
		const trainingTargetPerWeek = 3;

		const { data: newClients, error: insertError } = await supabase
			.from('clients')
			.insert([
				{
					name,
					email: email.trim().toLowerCase(),
					goal,
					target_calories: targetCalories,
					target_protein: targetProtein,
					training_target_per_week: trainingTargetPerWeek,
					password_hash: passwordHash
				}
			])
			.select();

		if (insertError) throw insertError;
		if (!newClients || newClients.length === 0) throw new Error('Insert failed');

		const dbClient = newClients[0];
		console.log('New client created:', dbClient.id, dbClient.email);

		const formattedClient = {
			id: dbClient.id,
			name: dbClient.name,
			email: dbClient.email,
			goal: dbClient.goal,
			targetCalories: dbClient.target_calories,
			targetProtein: dbClient.target_protein,
			trainingTargetPerWeek: dbClient.training_target_per_week
		};
		
		return json({ success: true, client: formattedClient, error: null });
	} catch (error) {
		console.error('Error during registration:', error);
		return json({ success: false, error: 'Erreur lors de la création du compte.' }, { status: 500 });
	}
}
