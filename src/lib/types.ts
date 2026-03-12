export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
	public: {
		Tables: {
			clients: {
				Row: {
					id: string;
					name: string;
					start_date: string;
					goal: string;
					start_weight: number;
					current_weight: number;
					training_adherence: number;
					protein_adherence: number;
					last_checkin: string;
					created_at?: string;
				};
				Insert: {
					id?: string;
					name: string;
					start_date: string;
					goal: string;
					start_weight: number;
					current_weight: number;
					training_adherence?: number;
					protein_adherence?: number;
					last_checkin: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					start_date?: string;
					goal?: string;
					start_weight?: number;
					current_weight?: number;
					training_adherence?: number;
					protein_adherence?: number;
					last_checkin?: string;
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

export type Client = Database['public']['Tables']['clients']['Row'];
export type WeeklyLog = Database['public']['Tables']['weekly_logs']['Row'];

export type ClientStatus = 'green' | 'yellow' | 'red';

export interface ClientWithStatus extends Client {
	status: ClientStatus;
	score: number;
}
