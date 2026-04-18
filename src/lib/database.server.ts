// src/lib/database.server.ts
import { dev } from '$app/environment';
import { getDemoClients } from '$lib/clientPortal';
import { loadClientsFromDisk, saveClientsToDisk } from '$lib/persistence.server';

// This creates a singleton that persists across HMR updates in dev mode.
// In production, this will only run once.

// Define the shape of our database
interface AppDatabase {
	clients: any[];
}

// Augment the global object to include our custom db property
declare global {
	// eslint-disable-next-line no-var
	var db: AppDatabase | undefined;
}

// Initialize the database
function initializeDatabase(): AppDatabase {
	console.log('▶ Initializing database...');
	const diskClients = loadClientsFromDisk();

	if (diskClients.length > 0) {
		console.log(`✔ Database restored with ${diskClients.length} clients from disk.`);
		return { clients: diskClients };
	}

	// Only save if we don't have disk clients
	const demoClients = getDemoClients();
	saveClientsToDisk(demoClients);
	console.log(`✔ Database initialized with ${demoClients.length} demo clients.`);
	return { clients: demoClients };
}

// Create and export the singleton
// In dev, this leverages the global object to survive HMR.
// In prod, it's a simple constant.
export const db = dev ? (globalThis.db ??= initializeDatabase()) : initializeDatabase();
