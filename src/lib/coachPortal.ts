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
}

const STORAGE_KEY_COACH_SESSION = 'coach-portal-session';

const COACH_DEMO_EMAIL = 'coach@demo.local';
const COACH_DEMO_PASSWORD = 'discipline';

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

export function loginCoach(email: string, password: string) {
	if (email.trim().toLowerCase() !== COACH_DEMO_EMAIL) {
		return { session: null, error: 'Compte coach introuvable.' };
	}

	if (password.trim().toLowerCase() !== COACH_DEMO_PASSWORD) {
		return { session: null, error: 'Mot de passe coach incorrect.' };
	}

	const session: CoachSession = {
		email: COACH_DEMO_EMAIL,
		name: 'Coach',
		loggedAt: new Date().toISOString()
	};

	writeSession(session);
	return { session, error: null };
}

export function logoutCoach() {
	writeSession(null);
}

export function getCoachDemoCredentials() {
	return {
		email: COACH_DEMO_EMAIL,
		password: COACH_DEMO_PASSWORD
	};
}

export function getCoachClientSummaries(): CoachClientSummary[] {
	const today = getLocalIsoDate();

	return getDemoClients().map((client) => {
		const entries = getClientDailyEntries(client.id);
		const latestEntry = entries[entries.length - 1] ?? null;
		const todayEntry = entries.find((entry) => entry.date === today) ?? null;
		const latestWeightEntry = [...entries].reverse().find((entry) => entry.weight !== null && entry.weight !== undefined) ?? null;
		const weightHistory = entries
			.filter((entry) => entry.weight !== null && entry.weight !== undefined)
			.map((entry) => ({ date: entry.date, weight: entry.weight as number }));
		const entriesCount = entries.length;
		const weeklyTrainingRate =
			entriesCount > 0
				? Math.round((entries.filter((entry) => entry.trainingCompleted).length / entriesCount) * 100)
				: 0;
		const averageCalories =
			entriesCount > 0
				? Math.round(entries.reduce((sum, entry) => sum + entry.calories, 0) / entriesCount)
				: 0;

		return {
			...client,
			todayEntry,
			latestEntry,
			latestWeight: latestWeightEntry?.weight ?? null,
			weightHistory,
			entriesCount,
			weeklyTrainingRate,
			averageCalories
		};
	});
}

export function getCoachKpis() {
	const summaries = getCoachClientSummaries();
	const today = getLocalIsoDate();
	const entriesToday = summaries.map((summary) => summary.todayEntry).filter(Boolean) as DailyEntry[];

	return {
		totalClients: summaries.length,
		todayEntries: entriesToday.length,
		trainingCompleted: entriesToday.filter((entry) => entry.trainingCompleted).length,
		averageCaloriesToday:
			entriesToday.length > 0
				? Math.round(entriesToday.reduce((sum, entry) => sum + entry.calories, 0) / entriesToday.length)
				: 0,
		today
	};
}