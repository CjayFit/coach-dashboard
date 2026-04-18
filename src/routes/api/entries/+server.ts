import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

export async function GET({ url }) {
	const clientId = url.searchParams.get('clientId');
	if (!clientId) return json({ entries: [], error: 'clientId requis.' }, { status: 400 });

	try {
		const { data: dbEntries, error } = await supabase
			.from('daily_entries')
			.select('*')
			.eq('client_id', clientId)
			.order('date', { ascending: true });

		if (error) throw error;

		const entries = (dbEntries || []).map(entry => ({
			id: entry.id,
			clientId: entry.client_id,
			date: entry.date,
			calories: entry.calories,
			protein: entry.protein,
			trainingCompleted: entry.training_completed,
			weight: entry.weight,
			notes: entry.notes || '',
			createdAt: entry.created_at
		}));

		return json({ entries });
	} catch (error) {
		console.error('Error fetching entries:', error);
		return json({ entries: [], error: `Erreur serveur: ${(error as Error).message}` }, { status: 500 });
	}
}

export async function POST({ request }) {
	const body = await request.json();

	try {
		// Insert or update (upsert) based on client_id and date unique constraint
		const { data: savedEntry, error } = await supabase
			.from('daily_entries')
			.upsert({
				client_id: body.clientId,
				date: body.date,
				calories: body.calories,
				protein: body.protein,
				training_completed: body.trainingCompleted,
				weight: body.weight ?? null,
				notes: body.notes || ''
			}, {
				onConflict: 'client_id,date'
			})
			.select()
			.single();

		if (error) throw error;

		return json({
			success: true,
			entry: {
				id: savedEntry.id,
				clientId: savedEntry.client_id,
				date: savedEntry.date,
				calories: savedEntry.calories,
				protein: savedEntry.protein,
				trainingCompleted: savedEntry.training_completed,
				weight: savedEntry.weight,
				notes: savedEntry.notes || '',
				createdAt: savedEntry.created_at
			}
		});
	} catch (error) {
		console.error('Error saving entry:', error);
		return json({ success: false, error: `Erreur serveur: ${(error as Error).message}` }, { status: 500 });
	}
}