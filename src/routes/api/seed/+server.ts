import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';
import * as bcrypt from 'bcryptjs';

export async function POST({ request }) {
	try {
		console.log('🔧 Seeding demo data to Supabase...');

		// Hash for password123
		const passwordHash = '$2b$10$hoZiZN01tp1JWFVF0Nukme4hS1ne0uCv/x.ETXUC7rzS6wdTwIEuS';

		// Coach data
		const coaches = [
			{
				id: '550e8400-e29b-41d4-a716-446655440000',
				name: 'Admin Coach',
				email: 'coach@lecerclediscipline.com',
				password_hash: passwordHash
			}
		];

		// Insert coaches
		const { error: coachError } = await supabase
			.from('coaches')
			.upsert(coaches, { onConflict: 'email' });

		if (coachError) throw coachError;
		console.log('✅ Coaches seeded');

		// Clients data
		const clients = [
			{
				id: 'client-jean',
				name: 'Jean Dupont',
				email: 'jean.dupont@demo.local',
				goal: 'Prise de masse',
				target_calories: 2800,
				target_protein: 180,
				training_target_per_week: 4,
				password_hash: passwordHash,
				coach_id: '550e8400-e29b-41d4-a716-446655440000'
			},
			{
				id: 'client-marie',
				name: 'Marie Martin',
				email: 'marie.martin@demo.local',
				goal: 'Recomposition corporelle',
				target_calories: 2400,
				target_protein: 140,
				training_target_per_week: 4,
				password_hash: passwordHash,
				coach_id: '550e8400-e29b-41d4-a716-446655440000'
			},
			{
				id: 'client-paul',
				name: 'Paul Durand',
				email: 'paul.durand@demo.local',
				goal: 'Perte de gras',
				target_calories: 2300,
				target_protein: 160,
				training_target_per_week: 3,
				password_hash: passwordHash,
				coach_id: '550e8400-e29b-41d4-a716-446655440000'
			}
		];

		// Insert clients
		const { error: clientError } = await supabase
			.from('clients')
			.upsert(clients, { onConflict: 'email' });

		if (clientError) throw clientError;
		console.log('✅ Clients seeded');

		return json({ success: true, message: 'Demo data seeded successfully' });
	} catch (error) {
		console.error('Error seeding data:', error);
		return json({ success: false, error: (error as Error).message }, { status: 500 });
	}
}
