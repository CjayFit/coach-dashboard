<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { enrichClient, getStatusEmoji, getStatusLabel } from '$lib/utils';
	import type { Client, ClientWithStatus } from '$lib/types';
	import { onMount } from 'svelte';

	let clients = $state<ClientWithStatus[]>([]);
	let loading = $state(true);
	let filter = $state<'all' | 'red'>('all');

	// KPIs
	let totalClients = $derived(clients.length);
	let greenCount = $derived(clients.filter((c) => c.status === 'green').length);
	let yellowCount = $derived(clients.filter((c) => c.status === 'yellow').length);
	let redCount = $derived(clients.filter((c) => c.status === 'red').length);
	let avgWeightGain = $derived(
		clients.length > 0
			? clients.reduce((sum, c) => sum + (c.current_weight - c.start_weight), 0) / clients.length
			: 0
	);
	let avgScore = $derived(
		clients.length > 0 ? clients.reduce((sum, c) => sum + c.score, 0) / clients.length : 0
	);

	let filteredClients = $derived(
		filter === 'red' ? clients.filter((c) => c.status === 'red') : clients
	);

	async function loadClients() {
		loading = true;
		const { data, error } = await supabase.from('clients').select('*').order('name');

		if (error) {
			console.error('Error loading clients:', error);
		} else if (data) {
			clients = data.map(enrichClient);
		}
		loading = false;
	}

	onMount(() => {
		loadClients();
	});
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-white shadow">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
			<h1 class="text-2xl font-bold text-gray-900">Dashboard Stratégique</h1>
			<nav class="space-x-4">
				<a href="/dashboard" class="text-blue-600 font-semibold">Dashboard</a>
				<a href="/clients" class="text-gray-600 hover:text-gray-900">Clients</a>
			</nav>
		</div>
	</header>

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{#if loading}
			<div class="flex justify-center items-center h-64">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		{:else}
			<!-- KPIs -->
			<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
				<div class="bg-white rounded-lg shadow p-6">
					<div class="text-sm text-gray-600 mb-1">Total Clients</div>
					<div class="text-3xl font-bold text-gray-900">{totalClients}</div>
				</div>

				<div class="bg-white rounded-lg shadow p-6">
					<div class="text-sm text-gray-600 mb-1">🟢 Excellents</div>
					<div class="text-3xl font-bold text-green-600">{greenCount}</div>
				</div>

				<div class="bg-white rounded-lg shadow p-6">
					<div class="text-sm text-gray-600 mb-1">🟡 À surveiller</div>
					<div class="text-3xl font-bold text-yellow-600">{yellowCount}</div>
				</div>

				<div class="bg-white rounded-lg shadow p-6">
					<div class="text-sm text-gray-600 mb-1">🔴 À risque</div>
					<div class="text-3xl font-bold text-red-600">{redCount}</div>
				</div>

				<div class="bg-white rounded-lg shadow p-6">
					<div class="text-sm text-gray-600 mb-1">Prise de poids moy.</div>
					<div class="text-3xl font-bold text-blue-600">
						{avgWeightGain.toFixed(1)}<span class="text-lg">kg</span>
					</div>
				</div>

				<div class="bg-white rounded-lg shadow p-6">
					<div class="text-sm text-gray-600 mb-1">Score moyen</div>
					<div class="text-3xl font-bold text-purple-600">
						{avgScore.toFixed(1)}<span class="text-lg">/5</span>
					</div>
				</div>
			</div>

			<!-- Filter -->
			<div class="bg-white rounded-lg shadow p-4 mb-6">
				<div class="flex items-center space-x-4">
					<span class="text-sm font-medium text-gray-700">Filtre :</span>
					<button
						onclick={() => (filter = 'all')}
						class="px-4 py-2 rounded-lg {filter === 'all'
							? 'bg-blue-600 text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
					>
						Tous les clients
					</button>
					<button
						onclick={() => (filter = 'red')}
						class="px-4 py-2 rounded-lg {filter === 'red'
							? 'bg-red-600 text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
					>
						🔴 Clients à risque uniquement
					</button>
				</div>
			</div>

			<!-- Clients List -->
			<div class="bg-white rounded-lg shadow overflow-hidden">
				<div class="px-6 py-4 border-b border-gray-200">
					<h2 class="text-lg font-semibold text-gray-900">
						{filter === 'red' ? 'Clients à risque' : 'Tous les clients'} ({filteredClients.length})
					</h2>
				</div>

				{#if filteredClients.length === 0}
					<div class="p-8 text-center text-gray-500">
						{filter === 'red'
							? '🎉 Aucun client à risque !'
							: 'Aucun client. Ajoutez-en un depuis la page Clients.'}
					</div>
				{:else}
					<div class="overflow-x-auto">
						<table class="min-w-full divide-y divide-gray-200">
							<thead class="bg-gray-50">
								<tr>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
										Statut
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
										Nom
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
										Objectif
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
										Prise de poids
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
										Entraînement
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
										Protéines
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
										Score
									</th>
								</tr>
							</thead>
							<tbody class="bg-white divide-y divide-gray-200">
								{#each filteredClients as client (client.id)}
									<tr class="hover:bg-blue-50 cursor-pointer transition-colors" onclick={() => window.location.href = `/clients/${client.id}`}>
										<td class="px-6 py-4 whitespace-nowrap">
											<span class="text-2xl">{getStatusEmoji(client.status)}</span>
											<span class="ml-2 text-sm text-gray-600">{getStatusLabel(client.status)}</span>
										</td>
										<td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
											{client.name}
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
											{client.goal}
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm">
											<span
												class={client.current_weight > client.start_weight
													? 'text-green-600 font-semibold'
													: 'text-gray-600'}
											>
												+{(client.current_weight - client.start_weight).toFixed(1)} kg
											</span>
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm">
											<span
												class={client.training_adherence >= 0.8
													? 'text-green-600 font-semibold'
													: 'text-red-600'}
											>
												{(client.training_adherence * 100).toFixed(0)}%
											</span>
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm">
											<span
												class={client.protein_adherence >= 0.8
													? 'text-green-600 font-semibold'
													: 'text-red-600'}
											>
												{(client.protein_adherence * 100).toFixed(0)}%
											</span>
										</td>
										<td class="px-6 py-4 whitespace-nowrap">
											<span class="text-lg font-bold text-purple-600">{client.score}/5</span>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		{/if}
	</main>
</div>
