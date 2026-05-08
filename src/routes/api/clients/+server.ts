import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

export async function GET({ request }) {
	try {
		console.log('📊 Fetching clients from database...');
		
		const { data: dbClients, error } = await supabase
			.from('clients')
			.select('*')
			.order('name', { ascending: true });

		if (error) {
			console.error('Database error:', error);
			throw error;
		}

		console.log('✅ Found', dbClients?.length || 0, 'clients in database');

		// Map to the format the frontend expects
		const clients = (dbClients || []).map(dbClient => {
			console.log('📝 Mapping client:', dbClient.name, dbClient.email);
			return {
				id: dbClient.id,
				name: dbClient.name,
				email: dbClient.email,
				goal: dbClient.goal,
				targetCalories: dbClient.target_calories,
				targetProtein: dbClient.target_protein,
				trainingTargetPerWeek: dbClient.training_target_per_week
			};
		});

		console.log('✅ Returning', clients.length, 'formatted clients');
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
		const hasClientUpdates = Object.keys(updateData).length > 0;

		if ('weight' in updates) {
			const { data: latestEntries, error: latestError } = await supabase
				.from('daily_entries')
				.select('*')
				.eq('client_id', clientId)
				.order('date', { ascending: false })
				.limit(1);

			if (latestError) throw latestError;
			const latestEntry = latestEntries?.[0];

			if (!latestEntry) {
				return json({ success: false, error: 'Aucune saisie pour mettre a jour le poids.' }, { status: 404 });
			}

			const { error: weightError } = await supabase
				.from('daily_entries')
				.update({ weight: updates.weight })
				.eq('id', latestEntry.id)
				.select()
				.single();

			if (weightError) throw weightError;
		}

		const clientQuery = hasClientUpdates
			? supabase
					.from('clients')
					.update(updateData)
					.eq('id', clientId)
					.select()
					.single()
			: supabase
					.from('clients')
					.select('*')
					.eq('id', clientId)
					.single();

		const { data: dbClient, error } = await clientQuery;

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