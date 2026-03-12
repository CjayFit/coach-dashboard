<script lang="ts">
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabase';
	import { enrichClient, getStatusEmoji, getStatusLabel, formatDate } from '$lib/utils';
	import type { Client, ClientWithStatus, WeeklyLog } from '$lib/types';
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';

	// Enregistrer Chart.js
	Chart.register(...registerables);

	let clientId = $derived($page.params.id);
	let client = $state<ClientWithStatus | null>(null);
	let weeklyLogs = $state<WeeklyLog[]>([]);
	let loading = $state(true);
	let chart: Chart | null = null;

	async function loadClientData() {
		loading = true;

		// Charger le client
		const { data: clientData, error: clientError } = await supabase
			.from('clients')
			.select('*')
			.eq('id', clientId)
			.single();

		if (clientError) {
			console.error('Error loading client:', clientError);
		} else if (clientData) {
			client = enrichClient(clientData);
		}

		// Charger les weekly logs
		const { data: logsData, error: logsError } = await supabase
			.from('weekly_logs')
			.select('*')
			.eq('client_id', clientId)
			.order('week_number');

		if (logsError) {
			console.error('Error loading logs:', logsError);
		} else if (logsData) {
			weeklyLogs = logsData;
		}

		loading = false;

		// Créer le graphique après chargement des données
		if (weeklyLogs.length > 0) {
			setTimeout(createChart, 100);
		}
	}

	function createChart() {
		const canvas = document.getElementById('weightChart') as HTMLCanvasElement;
		if (!canvas) return;

		// Détruire l'ancien graphique s'il existe
		if (chart) {
			chart.destroy();
		}

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Préparer les données
		const labels = weeklyLogs.map((log) => `Semaine ${log.week_number}`);
		const weights = weeklyLogs.map((log) => log.weight);
		const startWeight = client?.start_weight || weights[0];

		chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels,
				datasets: [
					{
						label: 'Poids (kg)',
						data: weights,
						borderColor: 'rgb(59, 130, 246)',
						backgroundColor: 'rgba(59, 130, 246, 0.1)',
						borderWidth: 3,
						tension: 0.2,
						fill: true,
						pointRadius: 6,
						pointHoverRadius: 8,
						pointBackgroundColor: 'rgb(59, 130, 246)',
						pointBorderColor: '#fff',
						pointBorderWidth: 2
					},
					{
						label: 'Poids de départ',
						data: new Array(weights.length).fill(startWeight),
						borderColor: 'rgb(156, 163, 175)',
						borderWidth: 2,
						borderDash: [5, 5],
						pointRadius: 0,
						fill: false
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: true,
						position: 'top'
					},
					tooltip: {
						callbacks: {
							afterLabel: (context) => {
								const index = context.dataIndex;
								const log = weeklyLogs[index];
								if (!log) return '';
								return [
									`Séances: ${log.sessions_completed}/${log.sessions_planned}`,
									`Protéines: ${log.protein_respected ? '✓' : '✗'}`,
									log.notes ? `Note: ${log.notes}` : ''
								].filter(Boolean);
							}
						}
					}
				},
				scales: {
					y: {
						beginAtZero: false,
						title: {
							display: true,
							text: 'Poids (kg)'
						}
					},
					x: {
						title: {
							display: true,
							text: 'Semaines'
						}
					}
				}
			}
		});
	}

	onMount(() => {
		loadClientData();
	});
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-white shadow">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
			<div class="flex items-center space-x-4">
				<a href="/dashboard" class="text-blue-600 hover:text-blue-800">
					← Retour
				</a>
				<h1 class="text-2xl font-bold text-gray-900">Détails du client</h1>
			</div>
			<nav class="space-x-4">
				<a href="/dashboard" class="text-gray-600 hover:text-gray-900">Dashboard</a>
				<a href="/clients" class="text-gray-600 hover:text-gray-900">Clients</a>
			</nav>
		</div>
	</header>

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{#if loading}
			<div class="flex justify-center items-center h-64">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		{:else if !client}
			<div class="bg-white rounded-lg shadow p-12 text-center">
				<p class="text-gray-500 text-lg mb-4">Client non trouvé</p>
				<a href="/dashboard" class="text-blue-600 hover:underline">Retour au dashboard</a>
			</div>
		{:else}
			<!-- Informations du client -->
			<div class="bg-white rounded-lg shadow-lg p-6 mb-6">
				<div class="flex items-start justify-between mb-4">
					<div>
						<h2 class="text-3xl font-bold text-gray-900 mb-2">{client.name}</h2>
						<p class="text-gray-600 text-lg">{client.goal}</p>
					</div>
					<div class="text-right">
						<div class="flex items-center space-x-2 mb-2">
							<span class="text-3xl">{getStatusEmoji(client.status)}</span>
							<span
								class="text-lg font-semibold {client.status === 'green'
									? 'text-green-700'
									: client.status === 'yellow'
										? 'text-yellow-700'
										: 'text-red-700'}"
							>
								{getStatusLabel(client.status)}
							</span>
						</div>
						<div class="text-2xl font-bold text-purple-600">Score: {client.score}/5</div>
					</div>
				</div>

				<!-- Métriques -->
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
					<div class="bg-blue-50 p-4 rounded-lg">
						<div class="text-sm text-gray-600 mb-1">Poids départ</div>
						<div class="text-2xl font-bold text-gray-900">{client.start_weight} kg</div>
					</div>
					<div class="bg-blue-50 p-4 rounded-lg">
						<div class="text-sm text-gray-600 mb-1">Poids actuel</div>
						<div class="text-2xl font-bold text-gray-900">{client.current_weight} kg</div>
					</div>
					<div class="bg-green-50 p-4 rounded-lg">
						<div class="text-sm text-gray-600 mb-1">Progression</div>
						<div
							class="text-2xl font-bold {client.current_weight > client.start_weight
								? 'text-green-600'
								: 'text-gray-900'}"
						>
							{client.current_weight > client.start_weight ? '+' : ''}{(
								client.current_weight - client.start_weight
							).toFixed(1)} kg
						</div>
					</div>
					<div class="bg-purple-50 p-4 rounded-lg">
						<div class="text-sm text-gray-600 mb-1">Dernier check-in</div>
						<div class="text-sm font-semibold text-gray-900">{formatDate(client.last_checkin)}</div>
					</div>
				</div>

				<!-- Adhérence -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
					<div class="bg-gray-50 p-4 rounded-lg">
						<div class="flex justify-between items-center mb-2">
							<span class="text-sm font-medium text-gray-700">Adhérence entraînement</span>
							<span
								class="text-lg font-bold {client.training_adherence >= 0.8
									? 'text-green-600'
									: 'text-red-600'}"
							>
								{(client.training_adherence * 100).toFixed(0)}%
							</span>
						</div>
						<div class="w-full bg-gray-200 rounded-full h-3">
							<div
								class="h-3 rounded-full {client.training_adherence >= 0.8
									? 'bg-green-600'
									: 'bg-red-600'}"
								style="width: {client.training_adherence * 100}%"
							></div>
						</div>
					</div>
					<div class="bg-gray-50 p-4 rounded-lg">
						<div class="flex justify-between items-center mb-2">
							<span class="text-sm font-medium text-gray-700">Adhérence protéines</span>
							<span
								class="text-lg font-bold {client.protein_adherence >= 0.8
									? 'text-green-600'
									: 'text-red-600'}"
							>
								{(client.protein_adherence * 100).toFixed(0)}%
							</span>
						</div>
						<div class="w-full bg-gray-200 rounded-full h-3">
							<div
								class="h-3 rounded-full {client.protein_adherence >= 0.8
									? 'bg-green-600'
									: 'bg-red-600'}"
								style="width: {client.protein_adherence * 100}%"
							></div>
						</div>
					</div>
				</div>
			</div>

			<!-- Graphique d'évolution -->
			{#if weeklyLogs.length > 0}
				<div class="bg-white rounded-lg shadow-lg p-6 mb-6">
					<h3 class="text-xl font-bold text-gray-900 mb-4">📊 Évolution du poids</h3>
					<div class="h-96">
						<canvas id="weightChart"></canvas>
					</div>
				</div>

				<!-- Historique des semaines -->
				<div class="bg-white rounded-lg shadow-lg p-6">
					<h3 class="text-xl font-bold text-gray-900 mb-4">📝 Historique hebdomadaire</h3>
					<div class="space-y-3">
						{#each weeklyLogs as log (log.id)}
							<div class="bg-gray-50 p-4 rounded-lg">
								<div class="flex justify-between items-start">
									<div>
										<div class="font-semibold text-gray-900 mb-1">
											Semaine {log.week_number} - {log.weight} kg
										</div>
										<div class="text-sm text-gray-600">
											Séances: {log.sessions_completed}/{log.sessions_planned}
											•
											Protéines: {log.protein_respected ? '✅ Respectées' : '❌ Non respectées'}
										</div>
										{#if log.notes}
											<div class="text-sm text-gray-500 mt-1 italic">"{log.notes}"</div>
										{/if}
									</div>
									<div
										class="text-xs font-medium px-2 py-1 rounded {log.protein_respected &&
										log.sessions_completed >= log.sessions_planned * 0.75
											? 'bg-green-100 text-green-700'
											: 'bg-yellow-100 text-yellow-700'}"
									>
										{log.protein_respected && log.sessions_completed >= log.sessions_planned * 0.75
											? 'Bonne semaine'
											: 'À améliorer'}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{:else}
				<div class="bg-white rounded-lg shadow p-8 text-center">
					<p class="text-gray-500 mb-2">Aucune donnée hebdomadaire pour ce client</p>
					<p class="text-sm text-gray-400">Les données d'évolution apparaîtront ici une fois ajoutées</p>
				</div>
			{/if}
		{/if}
	</main>
</div>
