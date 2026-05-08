export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
	public: {
		Tables: {
			clients: {
				Row: {
					id: string;
					email: string;
					name: string;
					goal: string | null;
					target_calories: number;
					target_protein: number;
					training_target_per_week: number;
					password_hash: string;
					coach_id: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					email: string;
					name: string;
					goal?: string | null;
					target_calories?: number;
					target_protein?: number;
					training_target_per_week?: number;
					password_hash: string;
					coach_id?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					email?: string;
					name?: string;
					goal?: string | null;
					target_calories?: number;
					target_protein?: number;
					training_target_per_week?: number;
					password_hash?: string;
					coach_id?: string | null;
					created_at?: string;
				};
			};
			weekly_logs: {
				Row: {
					id: string;
					client_id: string;
					week_number: number;
					sessions_completed: number;
					sessions_planned: number;
					protein_respected: boolean;
					weight: number;
					notes: string | null;
					created_at?: string;
				};
				Insert: {
					id?: string;
					client_id: string;
					week_number: number;
					sessions_completed: number;
					sessions_planned: number;
					protein_respected: boolean;
					weight: number;
					notes?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					client_id?: string;
					week_number?: number;
					sessions_completed?: number;
					sessions_planned?: number;
					protein_respected?: boolean;
					weight?: number;
					notes?: string | null;
					created_at?: string;
				};
			};
		};
	};
}

export type Client = Database['public']['Tables']['clients']['Row'] & {
	first_name?: string;
	last_name?: string;
};
export type WeeklyLog = Database['public']['Tables']['weekly_logs']['Row'];

export type ClientStatus = 'green' | 'yellow' | 'red';

export interface ClientWithStatus extends Client {
	status: ClientStatus;
	score: number;
}
