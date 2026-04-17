<script lang="ts">
	import { goto } from '$app/navigation';
	import { Chart, registerables } from 'chart.js';
	import { onDestroy, onMount } from 'svelte';
	import {
		getClientById,
		getClientDailyEntries,
		getClientWeightEntries,
		getCurrentSession,
		getLocalIsoDate,
		getTrainingStreak,
		logoutClient,
		saveDailyEntry,
		type ClientProfile,
		type DailyEntry
	} from '$lib/clientPortal';
	import { formatDate } from '$lib/utils';

	Chart.register(...registerables);

	const today = getLocalIsoDate();

	let client = $state<ClientProfile | null>(null);
	let entries = $state<DailyEntry[]>([]);
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let success = $state('');
	let form = $state({
		calories: 0,
		trainingCompleted: false,
		weight: '' as number | string,
		notes: ''
	});
	let weightChart: Chart | null = null;

	let recentEntries = $derived([...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7));
	let todaysEntry = $derived(entries.find((entry) => entry.date === today) ?? null);
	let weightEntries = $derived(client ? getClientWeightEntries(client.id).slice(-12) : []);
	let latestWeightEntry = $derived(weightEntries[weightEntries.length - 1] ?? null);
	let daysSinceLastWeight = $derived(
		latestWeightEntry
			? Math.floor(
					(new Date(`${today}T00:00:00`).getTime() - new Date(`${latestWeightEntry.date}T00:00:00`).getTime()) /
					(1000 * 60 * 60 * 24)
				)
			: Infinity
	);
	let averageCalories = $derived(
		entries.length > 0 ? Math.round(entries.reduce((sum, entry) => sum + entry.calories, 0) / entries.length) : 0
	);
	let trainingRate = $derived(
		entries.length > 0 ? Math.round((entries.filter((entry) => entry.trainingCompleted).length / entries.length) * 100) : 0
	);
	let trainingStreak = $derived(getTrainingStreak(entries));

	function renderWeightChart() {
		if (!client) return;

		const canvas = document.getElementById('weightProgressChart') as HTMLCanvasElement | null;
		if (!canvas) return;

		const data = getClientWeightEntries(client.id).slice(-12);
		if (weightChart) {
			weightChart.destroy();
			weightChart = null;
		}

		if (data.length === 0) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		weightChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: data.map((entry) => formatDate(entry.date)),
				datasets: [
					{
						label: 'Poids (kg)',
						data: data.map((entry) => entry.weight),
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
					},
					tooltip: {
						callbacks: {
							label: (context) => `${context.parsed.y} kg`
						}
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
		const session = getCurrentSession();

		if (!session) {
			goto('/login');
			return;
		}

		const profile = getClientById(session.clientId);
		if (!profile) {
			logoutClient();
			goto('/login');
			return;
		}

		client = profile;
		entries = getClientDailyEntries(profile.id);
		const todayEntry = entries.find((entry) => entry.date === today);
		form = {
			calories: todayEntry?.calories ?? profile.targetCalories,
			trainingCompleted: todayEntry?.trainingCompleted ?? false,
			weight: todayEntry?.weight ?? '',
			notes: todayEntry?.notes ?? ''
		};
		loading = false;
		setTimeout(renderWeightChart, 0);
	});

	onDestroy(() => {
		weightChart?.destroy();
	});

	function handleLogout() {
		logoutClient();
		goto('/login');
	}

	function refreshEntries() {
		if (!client) return;
		entries = getClientDailyEntries(client.id);
		setTimeout(renderWeightChart, 0);
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();

		if (!client) return;

		saving = true;
		error = '';
		success = '';

		if (form.calories <= 0) {
			error = 'Veuillez saisir le nombre de calories consommées.';
			saving = false;
			return;
		}

		saveDailyEntry({
			clientId: client.id,
			date: today,
			calories: Number(form.calories),
			trainingCompleted: form.trainingCompleted,
			weight: form.weight === '' ? null : Number(form.weight),
			notes: form.notes
		});

		refreshEntries();
		success = 'Votre saisie du jour a été enregistrée.';
		saving = false;
		setTimeout(renderWeightChart, 0);
	}
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<header class="bg-white dark:bg-gray-800 shadow">
		<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
			<div class="flex items-center gap-3">
				<span class="inline-flex h-11 w-11 items-center justify-center rounded-full border-4 border-red-500 bg-red-500/10">
					<span class="h-3.5 w-3.5 rounded-full bg-red-500"></span>
				</span>
				<div>
					<p class="text-sm text-red-600 dark:text-red-400 font-semibold uppercase tracking-wide">Le Cercle Discipline</p>
					<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Tableau de bord client</h1>
					<p class="text-sm text-gray-500 dark:text-gray-400">Bonjour {client?.name ?? 'client'}</p>
				</div>
			</div>
			<button
				onclick={handleLogout}
				class="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
			>
				Se déconnecter
			</button>
		</div>
	</header>

	<main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
		{#if loading}
			<div class="flex justify-center items-center h-64">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		{:else if client}
			<section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
					<div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Objectif calorique</div>
					<div class="text-3xl font-bold text-gray-900 dark:text-white">{client.targetCalories}<span class="text-lg ml-1">kcal</span></div>
				</div>
				<div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
					<div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Moyenne récente</div>
					<div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{averageCalories}<span class="text-lg ml-1">kcal</span></div>
				</div>
				<div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
					<div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Taux d'entraînement</div>
					<div class="text-3xl font-bold text-green-600 dark:text-green-400">{trainingRate}%</div>
				</div>
				<div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
					<div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Série actuelle</div>
					<div class="text-3xl font-bold text-purple-600 dark:text-purple-400">{trainingStreak} jour{trainingStreak > 1 ? 's' : ''}</div>
				</div>
			</section>

			<section class="bg-white dark:bg-gray-800 rounded-3xl shadow p-6 lg:p-8">
				<div class="flex items-start justify-between gap-4 mb-6">
					<div>
						<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Progression du poids</h2>
						<p class="text-gray-600 dark:text-gray-400 mt-1">Mesure au moins une fois par semaine pour visualiser la tendance.</p>
					</div>
					<div class="text-right">
						<div class="text-sm text-gray-500 dark:text-gray-400">Dernière mesure</div>
						<div class="text-xl font-bold text-red-600 dark:text-red-400">{latestWeightEntry ? `${latestWeightEntry.weight} kg` : 'Aucune'}</div>
					</div>
				</div>

				{#if !latestWeightEntry || daysSinceLastWeight >= 7}
					<div class="mb-4 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-300">
						La pesée hebdomadaire est en retard. Merci de saisir le poids cette semaine.
					</div>
				{/if}
				<div class="h-72">
					{#if weightEntries.length > 0}
						<canvas id="weightProgressChart"></canvas>
					{:else}
						<div class="h-full flex items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
							Ajoutez une mesure de poids pour voir la progression.
						</div>
					{/if}
				</div>
			</section>

			<section class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
				<div class="bg-white dark:bg-gray-800 rounded-3xl shadow p-6 lg:p-8">
					<div class="flex items-start justify-between gap-4 mb-6">
						<div>
							<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Saisie du jour</h2>
							<p class="text-gray-600 dark:text-gray-400 mt-1">Date du jour : {formatDate(today)}</p>
						</div>
						{#if todaysEntry}
							<span class="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">Déjà enregistré</span>
						{/if}
					</div>

					{#if error}
						<div class="mb-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3 text-sm">{error}</div>
					{/if}

					{#if success}
						<div class="mb-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-2xl px-4 py-3 text-sm">{success}</div>
					{/if}

					<form onsubmit={handleSubmit} class="space-y-5">
						<div>
							<label for="calories" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Calories consommées</label>
							<input
								id="calories"
								type="number"
								min="0"
								step="1"
								bind:value={form.calories}
								class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="2500"
							/>
						</div>

						<label class="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-700 px-4 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition">
							<input type="checkbox" bind:checked={form.trainingCompleted} class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
							<span class="text-gray-800 dark:text-gray-200 font-medium">Entraînement complété aujourd'hui</span>
						</label>

						<div>
							<label for="weight" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Poids hebdomadaire (kg)</label>
							<input
								id="weight"
								type="number"
								min="0"
								step="0.1"
								bind:value={form.weight}
								class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="72.4"
							/>
							<p class="mt-2 text-xs text-gray-500 dark:text-gray-400">À renseigner au moins une fois par semaine pour suivre la progression.</p>
						</div>

						<div>
							<label for="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
							<textarea
								id="notes"
								bind:value={form.notes}
								rows="4"
								class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Commentaires, ressenti, difficultés, énergie..."
							></textarea>
						</div>

						<button
							type="submit"
							disabled={saving}
							class="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{saving ? 'Enregistrement...' : 'Enregistrer la journée'}
						</button>
					</form>
				</div>

				<div class="space-y-6">
					<div class="bg-white dark:bg-gray-800 rounded-3xl shadow p-6">
						<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Votre objectif</h2>
						<p class="text-gray-600 dark:text-gray-400 mb-6">{client.goal}</p>
						<div class="space-y-3 text-sm">
							<div class="flex items-center justify-between">
								<span class="text-gray-500 dark:text-gray-400">Séances visées / semaine</span>
								<span class="font-semibold text-gray-900 dark:text-white">{client.trainingTargetPerWeek}</span>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-gray-500 dark:text-gray-400">Dernière saisie</span>
								<span class="font-semibold text-gray-900 dark:text-white">{todaysEntry ? 'Aujourd’hui' : 'Aucune'}</span>
							</div>
						</div>
					</div>

					<div class="bg-white dark:bg-gray-800 rounded-3xl shadow p-6">
						<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Historique récent</h2>
						{#if recentEntries.length === 0}
							<p class="text-gray-500 dark:text-gray-400">Aucune saisie pour le moment.</p>
						{:else}
							<div class="space-y-3">
								{#each recentEntries as entry (entry.id)}
									<div class="rounded-2xl border border-gray-200 dark:border-gray-700 px-4 py-3">
										<div class="flex items-center justify-between gap-3 mb-1">
											<div class="font-semibold text-gray-900 dark:text-white">{formatDate(entry.date)}</div>
											<div class="text-sm font-medium {entry.trainingCompleted ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">{entry.trainingCompleted ? 'Entraînement fait' : 'Entraînement non fait'}</div>
										</div>
										<div class="text-sm text-gray-600 dark:text-gray-400">{entry.calories} kcal</div>
										{#if entry.weight !== null && entry.weight !== undefined}
											<div class="text-sm text-red-600 dark:text-red-400 mt-1 font-medium">Poids : {entry.weight} kg</div>
										{/if}
										{#if entry.notes}
											<div class="text-sm text-gray-500 dark:text-gray-400 mt-1">{entry.notes}</div>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</section>
		{/if}
	</main>
</div>