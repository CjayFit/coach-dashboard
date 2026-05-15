import { getDemoClients } from './clientPortal';
import type { Client, WeeklyLog } from './types';

// Données mockées pour développement/test
const demoClients = getDemoClients();
export const mockClients: Client[] = demoClients.map((c) => ({
	id: c.id,
	email: c.email,
	name: c.name,
	goal: '',
	target_calories: c.targetCalories,
	target_protein: c.targetProtein,
	training_target_per_week: c.trainingTargetPerWeek,
	password_hash: c.passwordHash,
	created_at: new Date().toISOString(),
	coach_id: '550e8400-e29b-41d4-a716-446655440000'
}));

// Mock coach data
export interface MockCoach {
	id: string;
	name: string;
	email: string;
	password_hash: string;
	created_at: string;
}

export const mockCoaches: MockCoach[] = [
	{
		id: '550e8400-e29b-41d4-a716-446655440000',
		name: 'Admin Coach',
		email: 'coach@lecerclediscipline.com',
		password_hash: '$2b$10$hoZiZN01tp1JWFVF0Nukme4hS1ne0uCv/x.ETXUC7rzS6wdTwIEuS',
		created_at: new Date().toISOString()
	}
];

// Weekly logs mockés pour le graphique
export const mockWeeklyLogs: WeeklyLog[] = [
	// Jean Dupont - progression excellente
	{ id: 'w1', client_id: '1', week_number: 1, sessions_completed: 4, sessions_planned: 4, protein_respected: true, weight: 70.5, notes: 'Bonne semaine', created_at: '2026-01-08' },
	{ id: 'w2', client_id: '1', week_number: 2, sessions_completed: 4, sessions_planned: 4, protein_respected: true, weight: 71.2, notes: 'Énergie au top', created_at: '2026-01-15' },
	{ id: 'w3', client_id: '1', week_number: 3, sessions_completed: 3, sessions_planned: 4, protein_respected: true, weight: 71.8, notes: 'Une séance manquée', created_at: '2026-01-22' },
	{ id: 'w4', client_id: '1', week_number: 4, sessions_completed: 4, sessions_planned: 4, protein_respected: true, weight: 72.5, notes: 'Retour en forme', created_at: '2026-01-29' },
	{ id: 'w5', client_id: '1', week_number: 5, sessions_completed: 4, sessions_planned: 4, protein_respected: true, weight: 73.0, notes: 'Force en hausse', created_at: '2026-02-05' },
	{ id: 'w6', client_id: '1', week_number: 6, sessions_completed: 4, sessions_planned: 4, protein_respected: true, weight: 73.5, notes: 'Excellent', created_at: '2026-02-12' },
	
	// Marie Martin - progression modérée
	{ id: 'w7', client_id: '2', week_number: 1, sessions_completed: 3, sessions_planned: 4, protein_respected: true, weight: 65.3, notes: 'Bon départ', created_at: '2026-01-22' },
	{ id: 'w8', client_id: '2', week_number: 2, sessions_completed: 2, sessions_planned: 4, protein_respected: false, weight: 65.5, notes: 'Semaine difficile', created_at: '2026-01-29' },
	{ id: 'w9', client_id: '2', week_number: 3, sessions_completed: 3, sessions_planned: 4, protein_respected: true, weight: 65.9, notes: 'Reprise!', created_at: '2026-02-05' },
	{ id: 'w10', client_id: '2', week_number: 4, sessions_completed: 3, sessions_planned: 4, protein_respected: true, weight: 66.2, notes: 'Stabilisation', created_at: '2026-02-12' },
	
	// Paul Durand - difficulté
	{ id: 'w11', client_id: '3', week_number: 1, sessions_completed: 2, sessions_planned: 4, protein_respected: false, weight: 79.5, notes: 'Début difficile', created_at: '2026-02-08' },
	{ id: 'w12', client_id: '3', week_number: 2, sessions_completed: 2, sessions_planned: 4, protein_respected: false, weight: 78.5, notes: 'Perte de poids', created_at: '2026-02-13' }
];

// Stockage persistant dans localStorage pour survivre aux recharges de module
const STORAGE_KEY_CLIENTS = 'mockClients';
const STORAGE_KEY_LOGS = 'mockLogs';
const STORAGE_KEY_ENTRIES = 'mockEntries';
const STORAGE_KEY_COACHES = 'mockCoaches';

// Mock daily entries data
export interface MockDailyEntry {
	id: string;
	client_id: string;
	date: string;
	calories: number;
	protein: number;
	training_completed: boolean;
	weight: number | null;
	notes: string;
	created_at: string;
}

export const mockDailyEntries: MockDailyEntry[] = [
	{
		id: 'e1',
		client_id: 'client-jean',
		date: '2026-04-15',
		calories: 2800,
		protein: 180,
		training_completed: true,
		weight: 70.5,
		notes: 'Bonne séance',
		created_at: '2026-04-15'
	},
	{
		id: 'e2',
		client_id: 'client-jean',
		date: '2026-04-16',
		calories: 2750,
		protein: 175,
		training_completed: true,
		weight: 70.7,
		notes: 'Repos actif',
		created_at: '2026-04-16'
	}
];

// Initialiser depuis localStorage ou données par défaut
function initializeStores() {
	if (typeof window === 'undefined') {
		return { clients: mockClients, logs: mockWeeklyLogs, entries: mockDailyEntries, coaches: mockCoaches };
	}

	// Essayer de charger depuis localStorage
	const storedClients = localStorage.getItem(STORAGE_KEY_CLIENTS);
	const storedLogs = localStorage.getItem(STORAGE_KEY_LOGS);
	const storedEntries = localStorage.getItem(STORAGE_KEY_ENTRIES);
	const storedCoaches = localStorage.getItem(STORAGE_KEY_COACHES);

	if (storedClients && storedLogs && storedEntries && storedCoaches) {
		console.log('✅ Loading data from localStorage');
		return {
			clients: JSON.parse(storedClients),
			logs: JSON.parse(storedLogs),
			entries: JSON.parse(storedEntries),
			coaches: JSON.parse(storedCoaches)
		};
	} else {
		console.log('🔧 Initializing with default mock data');
		const stores = { clients: mockClients, logs: mockWeeklyLogs, entries: mockDailyEntries, coaches: mockCoaches };
		localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(mockClients));
		localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(mockWeeklyLogs));
		localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(mockDailyEntries));
		localStorage.setItem(STORAGE_KEY_COACHES, JSON.stringify(mockCoaches));
		return stores;
	}
}

// Fonctions helper pour accéder aux stores
function getClientsStore(): Client[] {
	if (typeof window === 'undefined') return mockClients;
	const stored = localStorage.getItem(STORAGE_KEY_CLIENTS);
	return stored ? JSON.parse(stored) : mockClients;
}

function getLogsStore(): WeeklyLog[] {
	if (typeof window === 'undefined') return mockWeeklyLogs;
	const stored = localStorage.getItem(STORAGE_KEY_LOGS);
	const logs = stored ? JSON.parse(stored) : mockWeeklyLogs;
	console.log('📊 Getting logs from localStorage:', logs.length, 'logs');
	return logs;
}

function getEntriesStore(): MockDailyEntry[] {
	if (typeof window === 'undefined') return mockDailyEntries;
	const stored = localStorage.getItem(STORAGE_KEY_ENTRIES);
	return stored ? JSON.parse(stored) : mockDailyEntries;
}

function setEntriesStore(entries: MockDailyEntry[]) {
	if (typeof window === 'undefined') return;
	console.log('💾 Saving', entries.length, 'entries to localStorage');
	localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));
}

function getCoachesStore(): MockCoach[] {
	if (typeof window === 'undefined') return mockCoaches;
	const stored = localStorage.getItem(STORAGE_KEY_COACHES);
	return stored ? JSON.parse(stored) : mockCoaches;
}

function setCoachesStore(coaches: MockCoach[]) {
	if (typeof window === 'undefined') return;
	console.log('💾 Saving', coaches.length, 'coaches to localStorage');
	localStorage.setItem(STORAGE_KEY_COACHES, JSON.stringify(coaches));
}

function setClientsStore(clients: Client[]) {
	if (typeof window === 'undefined') return;
	console.log('💾 Saving', clients.length, 'clients to localStorage');
	localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(clients));
}

function setLogsStore(logs: WeeklyLog[]) {
	if (typeof window === 'undefined') return;
	console.log('💾 Saving', logs.length, 'logs to localStorage');
	localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
}

// Fonction pour réinitialiser les données (utile pour le debugging)
export function resetMockData() {
	if (typeof window === 'undefined') return;
	console.log('🔄 Resetting mock data to defaults');
	localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(mockClients));
	localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(mockWeeklyLogs));
	localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(mockDailyEntries));
	localStorage.setItem(STORAGE_KEY_COACHES, JSON.stringify(mockCoaches));
	console.log('✅ Mock data reset complete');
}

// Initialiser au chargement du module
if (typeof window !== 'undefined') {
	initializeStores();
}

export const mockSupabaseClient = {
	from: (table: string) => {
		if (table === 'clients') {
			return {
				select: (selectQuery = '*') => ({
					order: (column: string) => {
						console.log('📊 Mock: Selecting clients with order by', column);
						const clients = getClientsStore();
						console.log('📊 Mock: Found', clients.length, 'clients');
						const sorted = [...clients].sort((a, b) => {
							const aVal = a[column as keyof Client];
							const bVal = b[column as keyof Client];
							if (typeof aVal === 'string' && typeof bVal === 'string') {
								return aVal.localeCompare(bVal);
							}
							return 0;
						});
						console.log('📊 Mock: Returning sorted clients:', sorted.map(c => c.email));
						return Promise.resolve({ data: sorted, error: null });
					},
					eq: (column: string, value: any) => {
						if (column === 'email') {
							const client = getClientsStore().find((c) => c.email === value);
							return Promise.resolve({
								data: client ? [client] : [],
								error: null
							});
						}
						return {
							single: () => {
								const client = getClientsStore().find((c) => c.id === value);
								return Promise.resolve({
									data: client || null,
									error: client ? null : { message: 'Client not found' }
								});
							}
						};
					}
				}),
				insert: (data: any) => {
					const newClientData = Array.isArray(data) ? data[0] : data;
					console.log('📝 Mock registering new client:', newClientData.email);
					
					const newClient: Client = {
						...newClientData,
						id: Math.random().toString(36).substr(2, 9),
						created_at: new Date().toISOString(),
						name: newClientData.name || 'New Client',
						coach_id: 'coach-1'
					};
					
					const clients = getClientsStore();
					clients.push(newClient);
					setClientsStore(clients);
					console.log('✅ New client saved to mock storage:', newClient.email, '- Total clients:', clients.length);
					
					return {
						select: () => {
							console.log('📤 Mock returning inserted client:', newClient.email);
							return Promise.resolve({ data: [newClient], error: null });
						}
					};
				},
				update: (data: any) => ({
					eq: (column: string, value: any) => {
						const clients = getClientsStore();
						const index = clients.findIndex((c) => c.id === value);
						if (index !== -1) {
							clients[index] = { ...clients[index], ...data };
							setClientsStore(clients);
						}
						return {
							select: () => ({
								single: () => Promise.resolve({ data: clients[index] || null, error: null })
							})
						};
					}
				}),
				delete: () => ({
					eq: (column: string, value: any) => {
						const clients = getClientsStore().filter((c) => c.id !== value);
						setClientsStore(clients);
						return Promise.resolve({ data: null, error: null });
					}
				})
			};
		}
		if (table === 'weekly_logs') {
			return {
				select: (columns: string) => ({
					eq: (column: string, value: any) => ({
						order: (orderColumn: string, options?: { ascending?: boolean }) => {
							const logs = getLogsStore();
							console.log('🔍 Selecting weekly logs for client:', value, '- Total logs in store:', logs.length);
							const filtered = logs.filter(log => log.client_id === value);
							console.log('✅ Found', filtered.length, 'logs for this client');
							const ascending = options?.ascending !== false; // Par défaut true
							const sorted = [...filtered].sort((a, b) => {
								return ascending 
									? a.week_number - b.week_number 
									: b.week_number - a.week_number;
							});
							
							// Si columns == '*', retourner tous les champs
							// Sinon, filtrer les colonnes demandées
							const result = columns === '*' 
								? sorted 
								: sorted.map(log => {
									if (columns === 'week_number') {
										return { week_number: log.week_number };
									}
									return log;
								});
							
							// Retourner un objet qui peut être utilisé comme Promise OU avec .limit()
							const resultPromise: any = Promise.resolve({ data: result, error: null });
							resultPromise.limit = (count: number) => {
								return Promise.resolve({ data: result.slice(0, count), error: null });
							};
							return resultPromise;
						}
					})
				}),
				insert: (data: any) => {
					console.log('📝 Inserting new weekly log:', data);
					const newLog = {
						...data,
						id: Math.random().toString(36).substr(2, 9),
						created_at: new Date().toISOString()
					};
					const logs = getLogsStore();
					console.log('📊 Current logs count:', logs.length);
					logs.push(newLog);
					setLogsStore(logs); // Persister dans localStorage
					console.log('✅ New log added. Total logs:', logs.length);
					
					// Vérifier que c'est bien sauvegardé
					const verification = getLogsStore();
					console.log('🔍 Verification: localStorage has', verification.length, 'logs');
					
					return Promise.resolve({ data: newLog, error: null });
				}
			};
		}
		if (table === 'daily_entries') {
			return {
				select: (columns: string = '*') => ({
					eq: (column: string, value: any) => ({
						order: (orderColumn: string, options?: { ascending?: boolean }) => {
							const entries = getEntriesStore();
							console.log('🔍 Selecting daily entries for client:', value, '- Total entries in store:', entries.length);
							const filtered = entries.filter(entry => entry.client_id === value);
							console.log('✅ Found', filtered.length, 'entries for this client');
							const ascending = options?.ascending !== false; // Par défaut true
							const sorted = [...filtered].sort((a, b) => {
								return ascending 
									? a.date.localeCompare(b.date)
									: b.date.localeCompare(a.date);
							});
							
							const resultPromise: any = Promise.resolve({ data: sorted, error: null });
							resultPromise.limit = (count: number) => {
								return Promise.resolve({ data: sorted.slice(0, count), error: null });
							};
							return resultPromise;
						}
					})
				}),
				insert: (data: any) => {
					console.log('📝 Inserting new daily entry:', data);
					const newEntry: MockDailyEntry = {
						...data,
						id: Math.random().toString(36).substr(2, 9),
						created_at: new Date().toISOString()
					};
					const entries = getEntriesStore();
					entries.push(newEntry);
					setEntriesStore(entries);
					console.log('✅ New entry added. Total entries:', entries.length);
					
					return Promise.resolve({ data: newEntry, error: null });
				},
				update: (data: any) => ({
					eq: (column: string, value: any) => {
						const entries = getEntriesStore();
						const index = entries.findIndex((e) => e.id === value);
						if (index !== -1) {
							entries[index] = { ...entries[index], ...data };
							setEntriesStore(entries);
						}
						return {
							select: () => ({
								single: () => Promise.resolve({ data: entries[index] || null, error: null })
							})
						};
					}
				}),
				delete: () => ({
					eq: (column: string, value: any) => {
						const entries = getEntriesStore().filter((e) => e.id !== value);
						setEntriesStore(entries);
						return Promise.resolve({ data: null, error: null });
					}
				}),
				upsert: (data: any, options: { onConflict: string }) => {
					const entries = getEntriesStore();
					const { onConflict } = options;
					const conflictColumns = onConflict.split(',');

					const findConflict = (entry: MockDailyEntry) => {
						return conflictColumns.every(col => (entry as any)[col] === (data as any)[col]);
					};

					const existingIndex = entries.findIndex(findConflict);

					if (existingIndex !== -1) {
						// Update
						entries[existingIndex] = { ...entries[existingIndex], ...data };
						setEntriesStore(entries);
						return Promise.resolve({ data: [entries[existingIndex]], error: null });
					} else {
						// Insert
						const newEntry: MockDailyEntry = {
							...data,
							id: Math.random().toString(36).substr(2, 9),
							created_at: new Date().toISOString()
						};
						entries.push(newEntry);
						setEntriesStore(entries);
						return Promise.resolve({ data: [newEntry], error: null });
					}
				}
			};
		}
		if (table === 'coaches') {
			return {
				select: (columns: string = '*') => ({
					eq: (column: string, value: any) => {
						if (column === 'email') {
							const coach = getCoachesStore().find((c) => c.email === value);
							return Promise.resolve({
								data: coach ? [coach] : [],
								error: null
							});
						}
						return {
							single: () => {
								const coach = getCoachesStore().find((c) => c.id === value);
								return Promise.resolve({
									data: coach || null,
									error: coach ? null : { message: 'Coach not found' }
								});
							}
						};
					}
				}),
				order: (column: string) => {
					const sorted = [...getCoachesStore()].sort((a, b) =>
						a.name.localeCompare(b.name)
					);
					return Promise.resolve({ data: sorted, error: null });
				}
			};
		}
		return {};
	},
	auth: {
		signInWithPassword: (credentials: any) => {
			// Mock authentication - accepte n'importe quel email/password
			return Promise.resolve({ 
				data: { user: { email: credentials.email } }, 
				error: null 
			});
		}
	}
};
