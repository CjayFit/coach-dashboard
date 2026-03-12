import type { Client, WeeklyLog } from './types';

// Données mockées pour développement/test
export const mockClients: Client[] = [
	{
		id: '1',
		name: 'Jean Dupont',
		start_date: '2026-01-01',
		goal: 'Prise de masse',
		start_weight: 70.0,
		current_weight: 73.5,
		training_adherence: 0.9,
		protein_adherence: 0.85,
		last_checkin: '2026-02-10',
		created_at: '2026-01-01'
	},
	{
		id: '2',
		name: 'Marie Martin',
		start_date: '2026-01-15',
		goal: 'Force et hypertrophie',
		start_weight: 65.0,
		current_weight: 66.2,
		training_adherence: 0.75,
		protein_adherence: 0.70,
		last_checkin: '2026-02-12',
		created_at: '2026-01-15'
	},
	{
		id: '3',
		name: 'Paul Durand',
		start_date: '2026-02-01',
		goal: 'Prise de masse',
		start_weight: 80.0,
		current_weight: 78.5,
		training_adherence: 0.50,
		protein_adherence: 0.45,
		last_checkin: '2026-02-13',
		created_at: '2026-02-01'
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

// Initialiser depuis localStorage ou données par défaut
function initializeStores() {
	if (typeof window === 'undefined') {
		return { clients: mockClients, logs: mockWeeklyLogs };
	}

	// Essayer de charger depuis localStorage
	const storedClients = localStorage.getItem(STORAGE_KEY_CLIENTS);
	const storedLogs = localStorage.getItem(STORAGE_KEY_LOGS);

	if (storedClients && storedLogs) {
		console.log('✅ Loading data from localStorage');
		return {
			clients: JSON.parse(storedClients),
			logs: JSON.parse(storedLogs)
		};
	} else {
		console.log('🔧 Initializing with default mock data');
		const stores = { clients: mockClients, logs: mockWeeklyLogs };
		localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(mockClients));
		localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(mockWeeklyLogs));
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
				select: (columns: string) => ({
					order: (column: string) => {
						const sorted = [...getClientsStore()].sort((a, b) => 
							a.name.localeCompare(b.name)
						);
						return Promise.resolve({ data: sorted, error: null });
					},
					eq: (column: string, value: any) => ({
						single: () => {
							const client = getClientsStore().find(c => c.id === value);
							return Promise.resolve({ 
								data: client || null, 
								error: client ? null : { message: 'Client not found' }
							});
						}
					})
				}),
				insert: (data: any) => {
					const newClient = {
						...data,
						id: Math.random().toString(36).substr(2, 9),
						created_at: new Date().toISOString()
					};
					const clients = getClientsStore();
					clients.push(newClient);
					setClientsStore(clients);
					return Promise.resolve({ data: newClient, error: null });
				},
				update: (data: any) => ({
					eq: (column: string, value: any) => {
						const clients = getClientsStore();
						const index = clients.findIndex(c => c.id === value);
						if (index !== -1) {
							clients[index] = { ...clients[index], ...data };
							setClientsStore(clients);
						}
						return Promise.resolve({ data: null, error: null });
					}
				}),
				delete: () => ({
					eq: (column: string, value: any) => {
						const clients = getClientsStore().filter(c => c.id !== value);
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
