import { db } from './database.server';
import { saveClientsToDisk } from './persistence.server';

export function getClientsFromStorage() {
	return db.clients;
}

export function setClientsInStorage(clients: any[]) {
	db.clients = clients;
	saveClientsToDisk(db.clients);
}

// Keep the signature but make it a no-op since db handles initialization
export function initializeClientsStorage(demoClients?: any[]) {
	// The database is uniquely initialized in database.server.ts
}
