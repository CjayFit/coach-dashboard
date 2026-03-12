<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { enrichClient, getStatusEmoji, getStatusLabel, formatDate } from '$lib/utils';
	import type { Client, ClientWithStatus } from '$lib/types';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let clients = $state<ClientWithStatus[]>([]);
	let loading = $state(true);
	let showModal = $state(false);
	let editingClient = $state<Client | null>(null);

	// Form state
	let formData = $state({
		name: '',
		start_date: '',
		goal: '',
		start_weight: 0,
		current_weight: 0,
		training_adherence: 0.5,
		protein_adherence: 0.5,
		last_checkin: ''
	});

	// Check-in modal state
	let showCheckinModal = $state(false);
	let checkinClient = $state<Client | null>(null);
	let checkinData = $state({
		week_number: 1,
		weight: 0,
		sessions_completed: 0,
		sessions_planned: 0,
		protein_respected: false,
		notes: ''
	});

	async function loadClients() {
		loading = true;
		const { data, error } = await supabase.from('clients').select('*').order('name');

		if (error) {
			console.error('Error loading clients:', error);
			alert('Erreur lors du chargement des clients');
		} else if (data) {
			clients = data.map(enrichClient);
		}
		loading = false;
	}

	function openAddModal() {
		editingClient = null;
		formData = {
			name: '',
			start_date: new Date().toISOString().split('T')[0],
			goal: '',
			start_weight: 0,
			current_weight: 0,
			training_adherence: 0.5,
			protein_adherence: 0.5,
			last_checkin: new Date().toISOString().split('T')[0]
		};
		showModal = true;
	}

	function openEditModal(client: Client) {
		editingClient = client;
		formData = {
			name: client.name,
			start_date: client.start_date,
			goal: client.goal,
			start_weight: client.start_weight,
			current_weight: client.current_weight,
			training_adherence: client.training_adherence,
			protein_adherence: client.protein_adherence,
			last_checkin: client.last_checkin
		};
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingClient = null;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (editingClient) {
			// Update
			const { error } = await supabase
				.from('clients')
				.update(formData)
				.eq('id', editingClient.id);

			if (error) {
				console.error('Error updating client:', error);
				alert('Erreur lors de la mise à jour');
				return;
			}
		} else {
			// Create
			const { error } = await supabase.from('clients').insert(formData);

			if (error) {
				console.error('Error creating client:', error);
				alert('Erreur lors de la création');
				return;
			}
		}

		closeModal();
		loadClients();
	}

	async function deleteClient(client: Client) {
		if (!confirm(`Supprimer ${client.name} ?`)) return;

		const { error } = await supabase.from('clients').delete().eq('id', client.id);

		if (error) {
			console.error('Error deleting client:', error);
			alert('Erreur lors de la suppression');
			return;
		}

		loadClients();
	}

	async function openCheckinModal(client: Client) {
		checkinClient = client;
		
		// Charger les weekly logs existants pour trouver le prochain numéro de semaine
		const { data: existingLogs } = await supabase
			.from('weekly_logs')
			.select('week_number')
			.eq('client_id', client.id)
			.order('week_number', { ascending: false })
			.limit(1);
		
		const nextWeekNumber = existingLogs && existingLogs.length > 0 
			? existingLogs[0].week_number + 1 
			: 1;
		
		checkinData = {
			week_number: nextWeekNumber,
			weight: client.current_weight,
			sessions_completed: 0,
			sessions_planned: 4,
			protein_respected: false,
			notes: ''
		};
		showCheckinModal = true;
	}

	function closeCheckinModal() {
		showCheckinModal = false;
		checkinClient = null;
	}

	async function handleCheckinSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!checkinClient) return;

		const { error } = await supabase.from('weekly_logs').insert({
			client_id: checkinClient.id,
			...checkinData
		});

		if (error) {
			console.error('Error creating check-in:', error);
			alert('Erreur lors de l\'ajout du check-in');
			return;
		}

		// Mettre à jour le client avec le nouveau poids et la date de check-in
		const updateData: any = {
			current_weight: checkinData.weight,
			last_checkin: new Date().toISOString().split('T')[0]
		};

		// Calculer les nouvelles adhérences basées sur ce check-in
		if (checkinData.sessions_planned > 0) {
			updateData.training_adherence = checkinData.sessions_completed / checkinData.sessions_planned;
		}
		updateData.protein_adherence = checkinData.protein_respected ? 1 : 0;

		const { error: updateError } = await supabase
			.from('clients')
			.update(updateData)
			.eq('id', checkinClient.id);

		if (updateError) {
			console.error('Error updating client:', updateError);
		}

		const clientId = checkinClient.id;
		closeCheckinModal();
		
		// Rediriger vers la page de détails du client pour voir le nouveau check-in
		await goto(`/clients/${clientId}`);
	}

	onMount(() => {
		loadClients();
	});
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-white shadow">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
			<h1 class="text-2xl font-bold text-gray-900">Gestion des Clients</h1>
			<nav class="space-x-4">
				<a href="/dashboard" class="text-gray-600 hover:text-gray-900">Dashboard</a>
				<a href="/clients" class="text-blue-600 font-semibold">Clients</a>
			</nav>
		</div>
	</header>

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Add Button -->
		<div class="mb-6 flex justify-between items-center">
			<h2 class="text-xl font-semibold text-gray-900">Liste des clients</h2>
			<button
				onclick={openAddModal}
				class="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
			>
				+ Ajouter un client
			</button>
		</div>

		{#if loading}
			<div class="flex justify-center items-center h-64">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		{:else if clients.length === 0}
			<div class="bg-white rounded-lg shadow p-12 text-center">
				<p class="text-gray-500 mb-4">Aucun client pour le moment</p>
				<button
					onclick={openAddModal}
					class="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
				>
					Ajouter le premier client
				</button>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each clients as client (client.id)}
					<div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
						<!-- Status Badge -->
						<div
							class="px-6 py-3 {client.status === 'green'
								? 'bg-green-50'
								: client.status === 'yellow'
									? 'bg-yellow-50'
									: 'bg-red-50'}"
						>
							<div class="flex items-center justify-between">
								<span class="text-2xl">{getStatusEmoji(client.status)}</span>
								<span
									class="text-sm font-semibold {client.status === 'green'
										? 'text-green-700'
										: client.status === 'yellow'
											? 'text-yellow-700'
											: 'text-red-700'}"
								>
									{getStatusLabel(client.status)}
								</span>
							</div>
						</div>

						<!-- Client Info -->
						<div class="px-6 py-4">
							<h3 class="text-xl font-bold text-gray-900 mb-2">{client.name}</h3>
							<p class="text-sm text-gray-600 mb-4">{client.goal}</p>

							<div class="space-y-2 text-sm">
								<div class="flex justify-between">
									<span class="text-gray-600">Score discipline :</span>
									<span class="font-bold text-purple-600">{client.score}/5</span>
								</div>
								<div class="flex justify-between">
									<span class="text-gray-600">Prise de poids :</span>
									<span
										class="font-semibold {client.current_weight > client.start_weight
											? 'text-green-600'
											: 'text-gray-600'}"
									>
										+{(client.current_weight - client.start_weight).toFixed(1)} kg
									</span>
								</div>
								<div class="flex justify-between">
									<span class="text-gray-600">Entraînement :</span>
									<span
										class="font-semibold {client.training_adherence >= 0.8
											? 'text-green-600'
											: 'text-red-600'}"
									>
										{(client.training_adherence * 100).toFixed(0)}%
									</span>
								</div>
								<div class="flex justify-between">
									<span class="text-gray-600">Protéines :</span>
									<span
										class="font-semibold {client.protein_adherence >= 0.8
											? 'text-green-600'
											: 'text-red-600'}"
									>
										{(client.protein_adherence * 100).toFixed(0)}%
									</span>
								</div>
								<div class="flex justify-between">
									<span class="text-gray-600">Dernier check-in :</span>
									<span class="text-gray-900">{formatDate(client.last_checkin)}</span>
								</div>
							</div>
						</div>

						<!-- Actions -->
						<div class="px-6 py-4 bg-gray-50 flex space-x-2">
							<button
								onclick={() => openCheckinModal(client)}
								class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
							>
								📝 Nouveau Check In
							</button>
							<button
								onclick={() => deleteClient(client)}
								class="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition"
							>
								Supprimer
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</main>
</div>

<!-- Modal -->
{#if showModal}
	<div
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
		onclick={closeModal}
	>
		<div
			class="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="px-6 py-4 border-b border-gray-200">
				<h2 class="text-2xl font-bold text-gray-900">
					{editingClient ? 'Modifier le client' : 'Ajouter un client'}
				</h2>
			</div>

			<form onsubmit={handleSubmit} class="px-6 py-4 space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="md:col-span-2">
						<label for="name" class="block text-sm font-medium text-gray-700 mb-1">
							Nom complet *
						</label>
						<input
							id="name"
							type="text"
							bind:value={formData.name}
							required
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="Jean Dupont"
						/>
					</div>

					<div class="md:col-span-2">
						<label for="goal" class="block text-sm font-medium text-gray-700 mb-1">
							Objectif *
						</label>
						<input
							id="goal"
							type="text"
							bind:value={formData.goal}
							required
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="Prise de masse, force, etc."
						/>
					</div>

					<div>
						<label for="start_date" class="block text-sm font-medium text-gray-700 mb-1">
							Date de début *
						</label>
						<input
							id="start_date"
							type="date"
							bind:value={formData.start_date}
							required
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>

					<div>
						<label for="last_checkin" class="block text-sm font-medium text-gray-700 mb-1">
							Dernier check-in *
						</label>
						<input
							id="last_checkin"
							type="date"
							bind:value={formData.last_checkin}
							required
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>

					<div>
						<label for="start_weight" class="block text-sm font-medium text-gray-700 mb-1">
							Poids de départ (kg) *
						</label>
						<input
							id="start_weight"
							type="number"
							step="0.1"
							bind:value={formData.start_weight}
							required
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="70.0"
						/>
					</div>

					<div>
						<label for="current_weight" class="block text-sm font-medium text-gray-700 mb-1">
							Poids actuel (kg) *
						</label>
						<input
							id="current_weight"
							type="number"
							step="0.1"
							bind:value={formData.current_weight}
							required
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="72.5"
						/>
					</div>

					<div>
						<label for="training_adherence" class="block text-sm font-medium text-gray-700 mb-1">
							Adhérence entraînement: {(formData.training_adherence * 100).toFixed(0)}%
						</label>
						<input
							id="training_adherence"
							type="range"
							min="0"
							max="1"
							step="0.1"
							bind:value={formData.training_adherence}
							class="w-full"
						/>
					</div>

					<div>
						<label for="protein_adherence" class="block text-sm font-medium text-gray-700 mb-1">
							Adhérence protéines: {(formData.protein_adherence * 100).toFixed(0)}%
						</label>
						<input
							id="protein_adherence"
							type="range"
							min="0"
							max="1"
							step="0.1"
							bind:value={formData.protein_adherence}
							class="w-full"
						/>
					</div>
				</div>

				<div class="flex space-x-4 pt-4">
					<button
						type="button"
						onclick={closeModal}
						class="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
					>
						Annuler
					</button>
					<button
						type="submit"
						class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
					>
						{editingClient ? 'Mettre à jour' : 'Ajouter'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Check-in Modal -->
{#if showCheckinModal && checkinClient}
	<div
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
		onclick={closeCheckinModal}
	>
		<div
			class="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="px-6 py-4 border-b border-gray-200">
				<h2 class="text-2xl font-bold text-gray-900">
					📝 Nouveau Check-in - {checkinClient.name}
				</h2>
				<p class="text-sm text-gray-600 mt-1">Ajouter une nouvelle semaine de suivi</p>
			</div>

			<form onsubmit={handleCheckinSubmit} class="px-6 py-4 space-y-4">
				<!-- Info automatique de la semaine -->
				<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
					<div class="flex items-center space-x-2">
						<span class="text-2xl">📅</span>
						<div>
							<div class="font-semibold text-blue-900">Semaine {checkinData.week_number}</div>
							<div class="text-sm text-blue-700">Numéro calculé automatiquement</div>
						</div>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">

					<div>
						<label for="weight" class="block text-sm font-medium text-gray-700 mb-1">
							Poids actuel (kg) *
						</label>
						<input
							id="weight"
							type="number"
							step="0.1"
							bind:value={checkinData.weight}
							required
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
							placeholder="70.5"
						/>
					</div>

					<div>
						<label for="sessions_completed" class="block text-sm font-medium text-gray-700 mb-1">
							Séances complétées *
						</label>
						<input
							id="sessions_completed"
							type="number"
							min="0"
							bind:value={checkinData.sessions_completed}
							required
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
							placeholder="3"
						/>
					</div>

					<div>
						<label for="sessions_planned" class="block text-sm font-medium text-gray-700 mb-1">
							Séances prévues *
						</label>
						<input
							id="sessions_planned"
							type="number"
							min="1"
							bind:value={checkinData.sessions_planned}
							required
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
							placeholder="4"
						/>
					</div>

					<div class="md:col-span-2">
						<label class="flex items-center space-x-2 cursor-pointer">
							<input
								type="checkbox"
								bind:checked={checkinData.protein_respected}
								class="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
							/>
							<span class="text-sm font-medium text-gray-700">
								Objectif protéines respecté cette semaine
							</span>
						</label>
					</div>

					<div class="md:col-span-2">
						<label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
							Notes (optionnel)
						</label>
						<textarea
							id="notes"
							bind:value={checkinData.notes}
							rows="3"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
							placeholder="Commentaires sur la semaine, difficultés, progrès..."
						></textarea>
					</div>
				</div>

				<div class="flex space-x-4 pt-4">
					<button
						type="button"
						onclick={closeCheckinModal}
						class="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
					>
						Annuler
					</button>
					<button
						type="submit"
						class="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
					>
						✓ Enregistrer le check-in
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
