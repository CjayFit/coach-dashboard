import type { Client, ClientStatus, ClientWithStatus } from './types';

/**
 * Calculate discipline score for a client
 * Score is based on:
 * - Training adherence >= 80%: +2 points
 * - Protein adherence >= 80%: +2 points  
 * - Weight gain (current > start): +1 point
 * Max score: 5
 */
export function calculateScore(client: Client): number {
	let score = 0;
	if (client.training_adherence >= 0.8) score += 2;
	if (client.protein_adherence >= 0.8) score += 2;
	if (client.current_weight > client.start_weight) score += 1;
	return score;
}

/**
 * Get status badge based on discipline score
 * - Green (🟢): score >= 4
 * - Yellow (🟡): score >= 2
 * - Red (🔴): score < 2
 */
export function getStatus(score: number): ClientStatus {
	if (score >= 4) return 'green';
	if (score >= 2) return 'yellow';
	return 'red';
}

/**
 * Add status and score to a client
 */
export function enrichClient(client: Client): ClientWithStatus {
	const score = calculateScore(client);
	const status = getStatus(score);
	return {
		...client,
		status,
		score
	};
}

/**
 * Get status emoji
 */
export function getStatusEmoji(status: ClientStatus): string {
	switch (status) {
		case 'green':
			return '🟢';
		case 'yellow':
			return '🟡';
		case 'red':
			return '🔴';
	}
}

/**
 * Get status label
 */
export function getStatusLabel(status: ClientStatus): string {
	switch (status) {
		case 'green':
			return 'Excellent';
		case 'yellow':
			return 'À surveiller';
		case 'red':
			return 'À risque';
	}
}

/**
 * Format date to French locale
 */
export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString('fr-FR', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}
