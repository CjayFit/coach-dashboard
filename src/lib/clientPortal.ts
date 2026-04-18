export interface ClientProfile {
	id: string;
	name: string;
	email: string;
	goal: string;
	targetCalories: number;
	targetProtein: number;
	trainingTargetPerWeek: number;
	passwordHash: string;
}

export interface ClientSession {
	clientId: string;
	email: string;
	name: string;
	loggedAt: string;
}

export interface DailyEntry {
	id: string;
	clientId: string;
	date: string;
	calories: number;
	protein: number;
	trainingCompleted: boolean;
	weight: number | null;
	notes: string;
	createdAt: string;
}

const STORAGE_KEY_SESSION = 'client-portal-session';
const STORAGE_KEY_ENTRIES = 'client-portal-daily-entries';
const STORAGE_KEY_CLIENTS = 'client-portal-clients';

let demoClients: ClientProfile[] = [
	{
		id: 'client-jean',
		name: 'Jean Dupont',
		email: 'jean.dupont@demo.local',
		goal: 'Prise de masse',
		targetCalories: 2800,
		targetProtein: 180,
		trainingTargetPerWeek: 4,
		passwordHash: '$2b$10$hoZiZN01tp1JWFVF0Nukme4hS1ne0uCv/x.ETXUC7rzS6wdTwIEuS'
	},
	{
		id: 'client-marie',
		name: 'Marie Martin',
		email: 'marie.martin@demo.local',
		goal: 'Recomposition corporelle',
		targetCalories: 2400,
		targetProtein: 140,
		trainingTargetPerWeek: 4,
		passwordHash: '$2b$10$hoZiZN01tp1JWFVF0Nukme4hS1ne0uCv/x.ETXUC7rzS6wdTwIEuS'
	},
	{
		id: 'client-paul',
		name: 'Paul Durand',
		email: 'paul.durand@demo.local',
		goal: 'Perte de gras',
		targetCalories: 2300,
		targetProtein: 160,
		trainingTargetPerWeek: 3,
		passwordHash: '$2b$10$hoZiZN01tp1JWFVF0Nukme4hS1ne0uCv/x.ETXUC7rzS6wdTwIEuS'
	}
];

const defaultDailyEntries: DailyEntry[] = [
	{
		id: 'entry-1',
		clientId: 'client-jean',
		date: '2026-04-15',
		calories: 2875,
		protein: 185,
		trainingCompleted: true,
		weight: 71.8,
		notes: 'Bonne journée et entraînement complet.',
		createdAt: '2026-04-15T18:20:00.000Z'
	},
	{
		id: 'entry-2',
		clientId: 'client-jean',
		date: '2026-04-16',
		calories: 2740,
		protein: 170,
		trainingCompleted: false,
		weight: null,
		notes: 'Repos actif.',
		createdAt: '2026-04-16T18:20:00.000Z'
	},
	{
		id: 'entry-3',
		clientId: 'client-marie',
		date: '2026-04-16',
		calories: 2410,
		protein: 145,
		trainingCompleted: true,
		weight: 66.4,
		notes: 'Séance réalisée en fin de journée.',
		createdAt: '2026-04-16T19:10:00.000Z'
	}
];

function isBrowser() {
	return typeof window !== 'undefined';
}

function getLocalDate(value = new Date()) {
	const offset = value.getTimezoneOffset() * 60000;
	return new Date(value.getTime() - offset).toISOString().slice(0, 10);
}

function readJson<T>(key: string, fallback: T): T {
	if (!isBrowser()) return fallback;
	const stored = localStorage.getItem(key);
	if (!stored) return fallback;

	try {
		return JSON.parse(stored) as T;
	} catch {
		return fallback;
	}
}

function writeJson<T>(key: string, value: T) {
	if (!isBrowser()) return;
	localStorage.setItem(key, JSON.stringify(value));
}

function getStoredClients(): ClientProfile[] {
	return readJson<ClientProfile[]>(STORAGE_KEY_CLIENTS, demoClients);
}

function setStoredClients(clients: ClientProfile[]) {
	writeJson(STORAGE_KEY_CLIENTS, clients);
}

export { getStoredClients, setStoredClients };

function getStoredEntries(): DailyEntry[] {
	const rawEntries = readJson<Array<DailyEntry | (Omit<DailyEntry, 'weight'> & { weight?: number | null })>>(
		STORAGE_KEY_ENTRIES,
		defaultDailyEntries
	);

	const normalized = rawEntries.map((entry) => ({
		...entry,
		weight: entry.weight ?? null
	}));

	const needsMigration = rawEntries.some((entry) => entry.weight === undefined);
	if (needsMigration) {
		setStoredEntries(normalized);
	}

	return normalized;
}

function setStoredEntries(entries: DailyEntry[]) {
	writeJson(STORAGE_KEY_ENTRIES, entries);
}

function seedStorage() {
	if (!isBrowser()) return;

	if (!localStorage.getItem(STORAGE_KEY_CLIENTS)) {
		setStoredClients(demoClients);
	}

	if (!localStorage.getItem(STORAGE_KEY_ENTRIES)) {
		setStoredEntries(defaultDailyEntries);
	}
}

if (isBrowser()) {
	seedStorage();
}

export function getDemoClients() {
	return getStoredClients();
}

export function getClientById(clientId: string) {
	return getStoredClients().find((client) => client && client.id === clientId) ?? null;
}

export function getClientByEmail(email: string) {
	return getStoredClients().find((client) => client && client.email.toLowerCase() === email.trim().toLowerCase()) ?? null;
}

export function getCurrentSession() {
	return readJson<ClientSession | null>(STORAGE_KEY_SESSION, null);
}

export async function loginClient(email: string, password: string) {
	const response = await fetch('/api/auth/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email, password })
	});

	const data = await response.json();

	if (!response.ok || !data.client) {
		return { client: null, error: data.error || 'Erreur de connexion' };
	}

	// Save session to localStorage
	const session: ClientSession = {
		clientId: data.client.id,
		email: data.client.email,
		name: data.client.name,
		loggedAt: new Date().toISOString()
	};

	writeJson(STORAGE_KEY_SESSION, session);

	// Also make sure this client is in our local cache
	const localClients = getStoredClients();
	const existingClientIndex = localClients.findIndex(c => c && c.id === data.client.id);
	if (existingClientIndex >= 0) {
		localClients[existingClientIndex] = data.client;
	} else {
		localClients.push(data.client);
	}
	setStoredClients(localClients);

	return { client: data.client, error: null };
}

export function logoutClient() {
	if (!isBrowser()) return;
	localStorage.removeItem(STORAGE_KEY_SESSION);
}

export async function getClientEntriesFromServer(clientId: string): Promise<DailyEntry[]> {
	try {
		const response = await fetch(`/api/entries?clientId=${clientId}`);
		if (!response.ok) return [];
		const data = await response.json();
		return data.entries || [];
	} catch (error) {
		console.error('Error fetching entries:', error);
		return [];
	}
}

export async function saveDailyEntry(input: {
	clientId: string;
	date: string;
	calories: number;
	protein: number;
	trainingCompleted: boolean;
	weight?: number | null;
	notes: string;
}) {
	const response = await fetch('/api/entries', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(input)
	});

	if (!response.ok) {
		throw new Error('Impossible de sauvegarder');
	}

	const data = await response.json();
	return data.entry;
}

export async function getClientDailyEntries(clientId: string) {
	return await getClientEntriesFromServer(clientId);
}

export async function getTodayEntry(clientId: string) {
	const today = getLocalDate();
	const entries = await getClientEntriesFromServer(clientId);
	return entries.find((entry) => entry.date === today) ?? null;
}

export async function getClientWeightEntries(clientId: string) {
	const entries = await getClientEntriesFromServer(clientId);
	return entries
		.filter((entry) => entry.weight !== null && entry.weight !== undefined)
		.sort((a, b) => a.date.localeCompare(b.date));
}

export function getTrainingStreak(entries: DailyEntry[]) {
	const completedDates = new Set(
		entries.filter((entry) => entry.trainingCompleted).map((entry) => entry.date)
	);

	let streak = 0;
	let cursor = new Date();

	while (true) {
		const currentDate = getLocalDate(cursor);
		if (!completedDates.has(currentDate)) break;
		streak += 1;
		cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000);
	}

	return streak;
}

export function getLocalIsoDate() {
	return getLocalDate();
}

export async function registerClient(input: { name: string; email: string; goal: string; password: string; confirmPassword?: string }) {
	const response = await fetch('/api/auth/register', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(input)
	});

	const data = await response.json();

	if (!response.ok) {
		return { success: false, error: data.error };
	}

	// Cache the newly registered client locally so the dashboard can find it
	const localClients = getStoredClients();
	localClients.push(data.client);
	setStoredClients(localClients);

	return { success: true, error: null };
}

export async function updateClient(clientId: string, updates: Partial<ClientProfile>) {
	const response = await fetch('/api/clients', {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ clientId, updates })
	});

	const data = await response.json();

	if (!response.ok) {
		return { success: false, error: data.error };
	}

	// Refresh stored clients
	const clients = getStoredClients();
	const updatedClients = clients.map((c) => (c.id === clientId ? data.client : c));
	setStoredClients(updatedClients);

	return { success: true, error: null, client: data.client };
}