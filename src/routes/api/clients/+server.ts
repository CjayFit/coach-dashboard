import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

export async function GET({ request }) {
	try {
		const { data: dbClients, error } = await supabase
			.from('clients')
			.select('*');

		if (error) throw error;

		// Map to the format the frontend expects
		const clients = (dbClients || []).map(dbClient => ({
			id: dbClient.id,
			name: dbClient.name,
			email: dbClient.email,
			goal: dbClient.goal,
			targetCalories: dbClient.target_calories,
			targetProtein: dbClient.target_protein,
			trainingTargetPerWeek: dbClient.training_target_per_week
		}));

		return json({ clients });
	} catch (error) {
		console.error('Error fetching clients:', error);
		return json({ clients: [], error: `Erreur serveur: ${(error as Error).message}` }, { status: 500 });
	}
}

export async function PUT({ request }) {
	const { clientId, updates } = await request.json();

	if (!clientId || !updates) {
		return json({ success: false, error: 'clientId et updates requis.' }, { status: 400 });
	}

	try {
		const updateData: any = {};
		if ('targetCalories' in updates) updateData.target_calories = updates.targetCalories;
		if ('targetProtein' in updates) updateData.target_protein = updates.targetProtein;
		if ('trainingTargetPerWeek' in updates) updateData.training_target_per_week = updates.trainingTargetPerWeek;
		if ('goal' in updates) updateData.goal = updates.goal;

		const { data: dbClient, error } = await supabase
			.from('clients')
			.update(updateData)
			.eq('id', clientId)
			.select()
			.single();

		if (error) throw error;
		if (!dbClient) return json({ success: false, error: `Client ${clientId} non trouvé.` }, { status: 404 });

		const updatedClient = {
			id: dbClient.id,
			name: dbClient.name,
			email: dbClient.email,
			goal: dbClient.goal,
			targetCalories: dbClient.target_calories,
			targetProtein: dbClient.target_protein,
			trainingTargetPerWeek: dbClient.training_target_per_week
		};

		return json({ success: true, client: updatedClient });
	} catch (error) {
		console.error('Error updating client:', error);
		return json({ success: false, error: `Erreur serveur: ${(error as Error).message}` }, { status: 500 });
	}
}