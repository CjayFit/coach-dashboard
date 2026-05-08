import {
	getClientDailyEntries,
	getDemoClients,
	getLocalIsoDate,
	type ClientProfile,
	type DailyEntry
} from './clientPortal';

export interface CoachSession {
	email: string;
	name: string;
	loggedAt: string;
}

export interface CoachClientSummary extends ClientProfile {
	todayEntry: DailyEntry | null;
	latestEntry: DailyEntry | null;
	latestWeight: number | null;
	weightHistory: Array<{ date: string; weight: number }>;
	entriesCount: number;
	weeklyTrainingRate: number;
	averageCalories: number;
	averageProtein: number;
}

const STORAGE_KEY_COACH_SESSION = 'coach-portal-session';

function isBrowser() {
	return typeof window !== 'undefined';
}

function readSession() {
	if (!isBrowser()) return null;
	const stored = localStorage.getItem(STORAGE_KEY_COACH_SESSION);
	return stored ? (JSON.parse(stored) as CoachSession) : null;
}

function writeSession(session: CoachSession | null) {
	if (!isBrowser()) return;
	if (!session) {
		localStorage.removeItem(STORAGE_KEY_COACH_SESSION);
		return;
	}
	localStorage.setItem(STORAGE_KEY_COACH_SESSION, JSON.stringify(session));
}

export function getCurrentCoachSession() {
	return readSession();
}

export async function loginCoach(email: string, password: string) {
	try {
		const response = await fetch('/api/auth/coach-login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password })
		});

		const data = await response.json();

		if (!response.ok || !data.coach) {
			return { session: null, error: data.error || 'Erreur de connexion' };
		}

		// Save session to localStorage
		const session: CoachSession = {
			email: data.coach.email,
			name: data.coach.name,
			loggedAt: new Date().toISOString()
		};

		writeSession(session);
		console.log('✅ Coach logged in:', data.coach.email);

		return { session, error: null };
	} catch (error) {
		console.error('Error logging in coach:', error);
		return { session: null, error: 'Erreur de connexion' };
	}
}

export function logoutCoach() {
	writeSession(null);
}

export async function getClientsFromServer(): Promise<ClientProfile[]> {
	try {
		const response = await fetch('/api/clients');
		if (!response.ok) {
			console.error('Error fetching clients from server');
			return [];
		}
		const data = await response.json();
		return data.clients || [];
	} catch (error) {
		console.error('Error fetching clients:', error);
		return [];
	}
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

export async function getCoachClientSummariesFromServer(): Promise<CoachClientSummary[]> {
	const today = getLocalIsoDate();
	const clients = await getClientsFromServer();

	const summariesPromises = clients.map(async (client) => {
		const entries = await getClientEntriesFromServer(client.id);
		const latestEntry = entries[entries.length - 1] ?? null;
		const todayEntry = entries.find((entry) => entry.date === today) ?? null;
		const latestWeightEntry = [...entries].reverse().find((entry) => entry.weight !== null && entry.weight !== undefined) ?? null;
		const weightHistory = entries
			.filter((entry) => entry.weight !== null && entry.weight !== undefined)
			.map((entry) => ({ date: entry.date, weight: entry.weight as number }));
		const entriesCount = entries.length;
		
		const weeklyTrainingRate = entriesCount > 0
			? Math.round((entries.filter((entry) => entry.trainingCompleted).length / entriesCount) * 100)
			: 0;
			
		const averageCalories = entriesCount > 0
			? Math.round(entries.reduce((sum, entry) => sum + entry.calories, 0) / entriesCount)
			: 0;
			
		const averageProtein = entriesCount > 0
			? Math.round(entries.reduce((sum, entry) => sum + entry.protein, 0) / entriesCount)
			: 0;

		return {
			...client,
			todayEntry,
			latestEntry,
			latestWeight: latestWeightEntry?.weight ?? null,
			weightHistory,
			entriesCount,
			weeklyTrainingRate,
			averageCalories,
			averageProtein
		};
	});

	return Promise.all(summariesPromises);
}

export async function getCoachKpis() {
	const summaries = await getCoachClientSummariesFromServer();
	const today = getLocalIsoDate();
	const entriesToday = summaries.map((summary) => summary.todayEntry).filter(Boolean) as DailyEntry[];

	return {
		totalClients: summaries.length,
		todayEntries: entriesToday.length,
		trainingCompleted: entriesToday.filter((entry) => entry.trainingCompleted).length,
		averageCaloriesToday: entriesToday.length > 0
			? Math.round(entriesToday.reduce((sum, entry) => sum + entry.calories, 0) / entriesToday.length)
			: 0,
		averageProteinToday: entriesToday.length > 0
			? Math.round(entriesToday.reduce((sum, entry) => sum + entry.protein, 0) / entriesToday.length)
			: 0,
		today
	};
}

// Seed data
export async function seedData() {
	const demoClients = getDemoClients();
	const clientEntries = demoClients.map(client => ({
		clientId: client.id,
		entries: [
			{
				date: '2024-01-01',
				weight: 70,
				calories: 200,
				protein: 30,
				trainingCompleted: true
			},
			{
				date: '2024-01-02',
				weight: 72,
				calories: 250,
				protein: 35,
				trainingCompleted: false
			}
		]
	}));

	// Save demo clients to localStorage
	localStorage.setItem('demo-clients', JSON.stringify(demoClients));

	// Save demo entries to localStorage
	localStorage.setItem('demo-entries', JSON.stringify(clientEntries));

	console.log('✅ Demo data seeded');
}

// Seed data
export async function seedDataWithEntries() {
	const demoClients = getDemoClients();
	const clientEntries = demoClients.map(client => ({
		clientId: client.id,
		entries: [
			{
				date: '2024-01-01',
				weight: 70,
				calories: 200,
				protein: 30,
				trainingCompleted: true
			},
			{
				date: '2024-01-02',
				weight: 72,
				calories: 250,
				protein: 35,
				trainingCompleted: false
			}
		]
	}));

	// Save demo clients to localStorage
	localStorage.setItem('demo-clients', JSON.stringify(demoClients));

	// Save demo entries to localStorage
	localStorage.setItem('demo-entries', JSON.stringify(clientEntries));

	console.log('✅ Demo data seeded');
}