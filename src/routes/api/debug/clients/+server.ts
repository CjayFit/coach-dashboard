import { json } from '@sveltejs/kit';
import { getClientsFromStorage, initializeClientsStorage } from '$lib/serverStorage';
import { getDemoClients } from '$lib/clientPortal';

export async function GET({ request }) {
	try {
		// Initialize server storage if empty
		let clients = getClientsFromStorage();
		if (clients.length === 0) {
			initializeClientsStorage(getDemoClients());
			clients = getClientsFromStorage();
		}

		// Return only safe info (no password hashes)
		const safeClients = clients.map((c: any) => ({
			id: c.id,
			name: c.name,
			email: c.email,
			goal: c.goal,
			targetCalories: c.targetCalories,
			targetProtein: c.targetProtein,
			trainingTargetPerWeek: c.trainingTargetPerWeek,
			hasPasswordHash: !!c.passwordHash,
			passwordHashPreview: c.passwordHash ? c.passwordHash.substring(0, 20) + '...' : 'NONE'
		}));

		return json({ clients: safeClients, totalClients: clients.length });
	} catch (error) {
		console.error('Error fetching debug info:', error);
		return json({ clients: [], error: `Erreur serveur: ${(error as Error).message}` }, { status: 500 });
	}
}
