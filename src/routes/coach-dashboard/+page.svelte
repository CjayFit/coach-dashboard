<script lang="ts">
	import { goto } from '$app/navigation';
	import { Chart, registerables } from 'chart.js';
	import { onDestroy, onMount } from 'svelte';
	import {
		getCoachClientSummariesFromServer,
		getCurrentCoachSession,
		logoutCoach,
		type CoachClientSummary
	} from '$lib/coachPortal';
	import { updateClient } from '$lib/clientPortal';
	import { formatDate } from '$lib/utils';

	Chart.register(...registerables);

	let loading = $state(true);
	let summaries = $state<CoachClientSummary[]>([]);
	let filter = $state<'all' | 'missing' | 'training-missed'>('all');
	let selectedClientId = $state('');
	let weightChart: Chart | null = null;
	let editingClientId = $state<string | null>(null);
	let editForm = $state({
		targetCalories: 0,
		targetProtein: 0,
		trainingTargetPerWeek: 0,
		goal: ''
	});
	let editError = $state('');
	let editSuccess = $state('');
	let editSaving = $state(false);

	let kpis = $derived({
		totalClients: summaries.length,
		todayEntries: summaries.filter((item) => item.todayEntry).length,
		trainingCompleted: summaries.filter((item) => item.todayEntry?.trainingCompleted).length,
		averageCaloriesToday:
			summaries.filter((item) => item.todayEntry).length > 0
				? Math.round(
						summaries
							.filter((item) => item.todayEntry)
							.reduce((sum, item) => sum + (item.todayEntry?.calories ?? 0), 0) /
							summaries.filter((item) => item.todayEntry).length
					)
				: 0,
		averageProteinToday:
			summaries.filter((item) => item.todayEntry).length > 0
				? Math.round(
						summaries
							.filter((item) => item.todayEntry)
							.reduce((sum, item) => sum + (item.todayEntry?.protein ?? 0), 0) /
							summaries.filter((item) => item.todayEntry).length
					)
				: 0
	});
	let filteredSummaries = $derived(
		filter === 'missing'
			? summaries.filter((item) => !item.todayEntry)
			: filter === 'training-missed'
				? summaries.filter((item) => item.todayEntry && !item.todayEntry.trainingCompleted)
				: summaries
	);
	let selectedClientSummary = $derived(
		summaries.find((item) => item.id === selectedClientId) ?? summaries[0] ?? null
	);

	function renderWeightChart() {
		const canvas = document.getElementById('coachWeightChart') as HTMLCanvasElement | null;
		if (!canvas) return;

		if (weightChart) {
			weightChart.destroy();
			weightChart = null;
		}

		const history = selectedClientSummary?.weightHistory ?? [];
		if (history.length === 0) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		weightChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: history.map((point) => formatDate(point.date)),
				datasets: [
					{
						label: `Poids de ${selectedClientSummary?.name ?? 'client'}`,
						data: history.map((point) => point.weight),
						borderColor: 'rgb(239, 68, 68)',
						backgroundColor: 'rgba(239, 68, 68, 0.15)',
						fill: true,
						tension: 0.3,
						pointRadius: 5,
						pointHoverRadius: 7,
						pointBackgroundColor: 'rgb(239, 68, 68)',
						pointBorderColor: '#fff',
						pointBorderWidth: 2
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						labels: { color: '#e5e7eb' }
					}
				},
				scales: {
					x: {
						ticks: { color: '#9ca3af' },
						grid: { color: 'rgba(156, 163, 175, 0.12)' }
					},
					y: {
						ticks: { color: '#9ca3af' },
						grid: { color: 'rgba(156, 163, 175, 0.12)' }
					}
				}
			}
		});
	}

	onMount(() => {
		if (!getCurrentCoachSession()) {
			goto('/coach-login');
			return;
		}

		(async () => {
			summaries = await getCoachClientSummariesFromServer();
			selectedClientId = summaries[0]?.id ?? '';
			loading = false;
			setTimeout(renderWeightChart, 0);
		})();
	});

	onDestroy(() => {
		weightChart?.destroy();
	});

	function handleLogout() {
		logoutCoach();
		goto('/coach-login');
	}

	function refresh() {
		(async () => {
			summaries = await getCoachClientSummariesFromServer();
			if (!summaries.some((item) => item.id === selectedClientId)) {
				selectedClientId = summaries[0]?.id ?? '';
			}
			setTimeout(renderWeightChart, 0);
		})();
	}

	function handleClientChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		selectedClientId = target.value;
		setTimeout(renderWeightChart, 0);
	}

	function startEditClient(clientId: string) {
		const client = summaries.find((s) => s.id === clientId);
		if (!client) return;

		editingClientId = clientId;
		editForm = {
			targetCalories: client.targetCalories,
			targetProtein: client.targetProtein,
			trainingTargetPerWeek: client.trainingTargetPerWeek,
			goal: client.goal
		};
		editError = '';
		editSuccess = '';
	}

	function cancelEdit() {
		editingClientId = null;
		editError = '';
		editSuccess = '';
	}

	async function handleSaveEdit() {
		if (!editingClientId) return;

		editSaving = true;
		editError = '';
		editSuccess = '';

		const { success, error } = await updateClient(editingClientId, editForm);

		if (!success) {
			editError = error || 'Erreur lors de la mise à jour';
			editSaving = false;
			return;
		}

		// Refresh data from server
		summaries = await getCoachClientSummariesFromServer();
		editSuccess = 'Client mis à jour avec succès';
		editSaving = false;

		setTimeout(() => {
			editingClientId = null;
		}, 1000);
	}
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<header class="bg-white dark:bg-gray-800 shadow">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
			<div class="flex items-center gap-3">
				<span class="inline-flex h-11 w-11 items-center justify-center rounded-full border-4 border-red-500 bg-red-500/10"><span class="h-3.5 w-3.5 rounded-full bg-red-500"></span></span>
				<div>
					<p class="text-sm text-red-600 dark:text-red-400 font-semibold uppercase tracking-wide">Le Cercle Discipliné</p>
					<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Espace coach</h1>
				</div>
			</div>
			<div class="flex items-center gap-3">
				<button onclick={refresh} class="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition">Rafraîchir</button>
				<button onclick={handleLogout} class="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition">Se déconnecter</button>
			</div>
		</div>
	</header>

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
		{#if loading}
			<div class="flex justify-center items-center h-64"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div></div>
		{:else}
			<section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
				<div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6"><div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Clients</div><div class="text-3xl font-bold text-gray-900 dark:text-white">{kpis.totalClients}</div></div>
				<div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6"><div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Saisies du jour</div><div class="text-3xl font-bold text-red-600 dark:text-red-400">{kpis.todayEntries}</div></div>
				<div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6"><div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Entraînements faits</div><div class="text-3xl font-bold text-green-600 dark:text-green-400">{kpis.trainingCompleted}</div></div>
				<div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6"><div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Calories moyennes</div><div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{kpis.averageCaloriesToday}<span class="text-lg ml-1">kcal</span></div></div>
				<div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6"><div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Protéines moyennes</div><div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{kpis.averageProteinToday}<span class="text-lg ml-1">g</span></div></div>
			</section>

			<section class="bg-white dark:bg-gray-800 rounded-3xl shadow p-6">
				<div class="flex flex-wrap items-start justify-between gap-4 mb-4">
					<div>
						<h2 class="text-xl font-semibold text-gray-900 dark:text-white">Progression du poids (coach)</h2>
						<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Sélectionnez un client pour afficher son évolution de poids.</p>
					</div>
					{#if summaries.length > 0}
						<select
							value={selectedClientId}
							onchange={handleClientChange}
							class="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
						>
							{#each summaries as summary}
								<option value={summary.id}>{summary.name}</option>
							{/each}
						</select>
					{/if}
				</div>
				<div class="h-72">
					{#if selectedClientSummary && selectedClientSummary.weightHistory.length > 0}
						<canvas id="coachWeightChart"></canvas>
					{:else}
						<div class="h-full flex items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
							Aucune donnée de poids disponible pour ce client.
						</div>
					{/if}
				</div>
			</section>

			<section class="bg-white dark:bg-gray-800 rounded-3xl shadow p-4 flex flex-wrap items-center gap-3">
				<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Filtres :</span>
				<button onclick={() => (filter = 'all')} class="px-4 py-2 rounded-xl {filter === 'all' ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}">Tous</button>
				<button onclick={() => (filter = 'missing')} class="px-4 py-2 rounded-xl {filter === 'missing' ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}">Sans saisie aujourd'hui</button>
				<button onclick={() => (filter = 'training-missed')} class="px-4 py-2 rounded-xl {filter === 'training-missed' ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}">Entraînement manqué</button>
			</section>

			<section class="bg-white dark:bg-gray-800 rounded-3xl shadow overflow-hidden">
				<div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Vue d'ensemble des clients</h2>
				</div>
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
						<thead class="bg-gray-50 dark:bg-gray-700">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Client</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Objectif</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Saisie du jour</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Calories</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Protéines</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Poids</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Entraînement</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Dernière saisie</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
							</tr>
						</thead>
						<tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
							{#each filteredSummaries as summary (summary.id)}
								<tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
									<td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{summary.name}</td>
									<td class="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{summary.goal}</td>
									<td class="px-6 py-4 whitespace-nowrap">
										{#if summary.todayEntry}
											<span class="inline-flex px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">Oui</span>
										{:else}
											<span class="inline-flex px-3 py-1 rounded-full text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">Non</span>
										{/if}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{summary.todayEntry?.calories ?? '-'}{summary.todayEntry ? ' kcal' : ''}</td>
									<td class="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{summary.todayEntry?.protein ?? '-'}{summary.todayEntry ? ' g' : ''}</td>
									<td class="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{summary.latestWeight !== null ? `${summary.latestWeight} kg` : '-'}</td>
									<td class="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{summary.todayEntry ? (summary.todayEntry.trainingCompleted ? 'Fait' : 'Non fait') : '-'}</td>
									<td class="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{summary.latestEntry ? formatDate(summary.latestEntry.date) : 'Aucune'}</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<button onclick={() => startEditClient(summary.id)} class="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm">Modifier</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>

			{#if editingClientId}
				<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-8">
						<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Modifier le client</h2>

						{#if editError}
							<div class="mb-4 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-300">
								{editError}
							</div>
						{/if}

						{#if editSuccess}
							<div class="mb-4 rounded-2xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30 px-4 py-3 text-sm text-green-700 dark:text-green-300">
								{editSuccess}
							</div>
						{/if}

						<form onsubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} class="space-y-4">
							<div>
								<label for="edit-calories" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Objectif calories</label>
								<input
									id="edit-calories"
									type="number"
									min="0"
									bind:value={editForm.targetCalories}
									class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<div>
								<label for="edit-protein" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Objectif protéines (g)</label>
								<input
									id="edit-protein"
									type="number"
									min="0"
									bind:value={editForm.targetProtein}
									class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<div>
								<label for="edit-training" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Séances/semaine</label>
								<input
									id="edit-training"
									type="number"
									min="0"
									bind:value={editForm.trainingTargetPerWeek}
									class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<div>
								<label for="edit-goal" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Objectif</label>
								<textarea
									id="edit-goal"
									bind:value={editForm.goal}
									rows="3"
									class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
								></textarea>
							</div>

							<div class="flex gap-3 pt-4">
								<button
									type="submit"
									disabled={editSaving}
									class="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{editSaving ? 'Enregistrement...' : 'Enregistrer'}
								</button>
								<button
									type="button"
									onclick={cancelEdit}
									disabled={editSaving}
									class="flex-1 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white py-2 rounded-xl font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Annuler
								</button>
							</div>
						</form>
					</div>
				</div>
			{/if}
		{/if}
	</main>
</div>