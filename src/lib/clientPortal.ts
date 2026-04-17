export interface ClientProfile {
	id: string;
	name: string;
	email: string;
	goal: string;
	targetCalories: number;
	trainingTargetPerWeek: number;
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
	trainingCompleted: boolean;
	weight: number | null;
	notes: string;
	createdAt: string;
}

const STORAGE_KEY_SESSION = 'client-portal-session';
const STORAGE_KEY_ENTRIES = 'client-portal-daily-entries';

const demoClients: ClientProfile[] = [
	{
		id: 'client-jean',
		name: 'Jean Dupont',
		email: 'jean.dupont@demo.local',
		goal: 'Prise de masse',
		targetCalories: 2800,
		trainingTargetPerWeek: 4
	},
	{
		id: 'client-marie',
		name: 'Marie Martin',
		email: 'marie.martin@demo.local',
		goal: 'Recomposition corporelle',
		targetCalories: 2400,
		trainingTargetPerWeek: 4
	},
	{
		id: 'client-paul',
		name: 'Paul Durand',
		email: 'paul.durand@demo.local',
		goal: 'Perte de gras',
		targetCalories: 2300,
		trainingTargetPerWeek: 3
	}
];

const defaultDailyEntries: DailyEntry[] = [
	{
		id: 'entry-1',
		clientId: 'client-jean',
		date: '2026-04-15',
		calories: 2875,
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

	if (!localStorage.getItem(STORAGE_KEY_ENTRIES)) {
		setStoredEntries(defaultDailyEntries);
	}
}

if (isBrowser()) {
	seedStorage();
}

export function getDemoClients() {
	return demoClients;
}

export function getClientById(clientId: string) {
	return demoClients.find((client) => client.id === clientId) ?? null;
}

export function getClientByEmail(email: string) {
	return demoClients.find((client) => client.email.toLowerCase() === email.trim().toLowerCase()) ?? null;
}

export function getCurrentSession() {
	return readJson<ClientSession | null>(STORAGE_KEY_SESSION, null);
}

export function loginClient(email: string, password: string) {
	const client = getClientByEmail(email);

	if (!client) {
		return { client: null, error: 'Aucun compte client trouvé pour cette adresse email.' };
	}

	if (!password.trim()) {
		return { client: null, error: 'Veuillez saisir un mot de passe.' };
	}

	const session: ClientSession = {
		clientId: client.id,
		email: client.email,
		name: client.name,
		loggedAt: new Date().toISOString()
	};

	writeJson(STORAGE_KEY_SESSION, session);
	return { client, error: null };
}

export function logoutClient() {
	if (!isBrowser()) return;
	localStorage.removeItem(STORAGE_KEY_SESSION);
}

export function getClientDailyEntries(clientId: string) {
	return getStoredEntries()
		.filter((entry) => entry.clientId === clientId)
		.sort((a, b) => a.date.localeCompare(b.date));
}

export function getTodayEntry(clientId: string) {
	const today = getLocalDate();
	return getClientDailyEntries(clientId).find((entry) => entry.date === today) ?? null;
}

export function saveDailyEntry(input: {
	clientId: string;
	date: string;
	calories: number;
	trainingCompleted: boolean;
	weight?: number | null;
	notes: string;
}) {
	const entries = getStoredEntries();
	const existingIndex = entries.findIndex(
		(entry) => entry.clientId === input.clientId && entry.date === input.date
	);

	const entry: DailyEntry = {
		id: existingIndex >= 0 ? entries[existingIndex].id : Math.random().toString(36).slice(2, 10),
		clientId: input.clientId,
		date: input.date,
		calories: input.calories,
		trainingCompleted: input.trainingCompleted,
		weight: input.weight ?? null,
		notes: input.notes.trim(),
		createdAt: new Date().toISOString()
	};

	if (existingIndex >= 0) {
		entries[existingIndex] = entry;
	} else {
		entries.push(entry);
	}

	setStoredEntries(entries);
	return entry;
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

export function getClientWeightEntries(clientId: string) {
	return getClientDailyEntries(clientId)
		.filter((entry) => entry.weight !== null && entry.weight !== undefined)
		.sort((a, b) => a.date.localeCompare(b.date));
}

export function registerClient(input: { name: string; email: string; goal: string }) {
	const newClient: ClientProfile = {
		id: `client-${input.name.toLowerCase().replace(/\s/g, '-')}`,
		name: input.name,
		email: input.email,
		goal: input.goal,
		targetCalories: 2000, // Default value
		trainingTargetPerWeek: 3 // Default value
	};
	// In a real app, this would be an API call.
	// For demo purposes, we'll just log it.
	console.log('New client registered:', newClient);
	// Note: This won't persist without a proper backend or by modifying the mock data source.
	// To make it work with the current structure, we would need to modify the `demoClients` array,
	// but it's defined as a const. For a real-world scenario, this would be handled differently.
}