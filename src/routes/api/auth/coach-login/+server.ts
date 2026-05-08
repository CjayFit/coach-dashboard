import * as bcrypt from 'bcryptjs';
import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

export async function POST({ request }) {
	const { email, password } = await request.json();

	if (!email || !password) {
		return json({ coach: null, error: 'Email et mot de passe requis.' }, { status: 400 });
	}

	console.log('Coach login attempt with email:', email);

	try {
		// Recherche du coach dans Supabase
		const { data: coaches, error } = await supabase
			.from('coaches')
			.select('*')
			.eq('email', email.trim().toLowerCase());

		if (error || !coaches || coaches.length === 0) {
			console.log('Coach not found or error:', error);
			return json({ coach: null, error: 'Aucun compte coach trouvé pour cette adresse email.' }, { status: 401 });
		}

		const coach = coaches[0];
		console.log('Coach found in Supabase:', coach.email);

		try {
			// Validation du mot de passe
			const isPasswordValid = await bcrypt.compare(password, coach.password_hash);
			console.log('Password validation result:', isPasswordValid, 'for coach:', email);

			if (!isPasswordValid) {
				return json({ coach: null, error: 'Mot de passe incorrect.' }, { status: 401 });
			}
		} catch (err) {
			console.error('Error verifying password:', err);
			return json({ coach: null, error: 'Erreur interne de vérification. Réessayez.' }, { status: 500 });
		}

		// Préparation sécurisée du coach et formatage pour l'application
		const { password_hash, ...safeCoach } = coach;
		
		const formattedCoach = {
			id: safeCoach.id,
			name: safeCoach.name,
			email: safeCoach.email
		};

		console.log(`Coach login successful in Supabase for ${email}`);
		return json({ coach: formattedCoach, error: null });
	} catch (error) {
		console.error('Error during coach login:', error);
		return json({ coach: null, error: 'Erreur lors de la connexion.' }, { status: 500 });
	}
}
