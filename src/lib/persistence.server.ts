import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), '.data');
const CLIENTS_FILE = join(DATA_DIR, 'clients.json');

// Ensure data directory exists
function ensureDataDir() {
	if (!existsSync(DATA_DIR)) {
		mkdirSync(DATA_DIR, { recursive: true });
	}
}

// Load clients from JSON file
export function loadClientsFromDisk(): any[] {
	ensureDataDir();
	if (existsSync(CLIENTS_FILE)) {
		try {
			const data = readFileSync(CLIENTS_FILE, 'utf-8');
			const clients = JSON.parse(data);
			console.log(`✓ Loaded ${clients.length} clients from disk`);
			return clients;
		} catch (error) {
			console.error('✗ Error loading clients from disk:', error);
			return [];
		}
	}
	return [];
}

// Save clients to JSON file
export function saveClientsToDisk(clients: any[]) {
	ensureDataDir();
	try {
		writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2), 'utf-8');
		console.log(`✓ Saved ${clients.length} clients to disk`);
	} catch (error) {
		console.error('✗ Error saving clients to disk:', error);
	}
}

// Clear all data
export function clearDiskData() {
	ensureDataDir();
	if (existsSync(CLIENTS_FILE)) {
		try {
			writeFileSync(CLIENTS_FILE, JSON.stringify([], null, 2), 'utf-8');
			console.log('✓ Cleared all client data from disk');
		} catch (error) {
			console.error('✗ Error clearing disk data:', error);
		}
	}
}
