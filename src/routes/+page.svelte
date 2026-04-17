<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getCurrentSession } from '$lib/clientPortal';
	import { getCurrentCoachSession } from '$lib/coachPortal';

	onMount(() => {
		if (getCurrentCoachSession()) {
			goto('/coach-dashboard');
			return;
		}

		if (getCurrentSession()) {
			goto('/dashboard');
			return;
		}
	});
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
	<div class="w-full max-w-4xl grid gap-6 md:grid-cols-2">
		<a href="/login" class="group rounded-3xl bg-white dark:bg-gray-800 shadow-2xl p-8 hover:-translate-y-1 transition">
			<div class="inline-flex h-12 w-12 items-center justify-center rounded-full border-4 border-red-500 bg-red-500/10 mb-4">
				<span class="h-4 w-4 rounded-full bg-red-500"></span>
			</div>
			<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Espace client</h1>
			<p class="text-gray-600 dark:text-gray-400">Connexion et saisie quotidienne des calories et de l'entraînement.</p>
		</a>

		<a href="/coach-login" class="group rounded-3xl bg-black text-white shadow-2xl p-8 hover:-translate-y-1 transition border border-red-500/30">
			<div class="inline-flex h-12 w-12 items-center justify-center rounded-full border-4 border-red-500 bg-red-500/20 mb-4">
				<span class="h-4 w-4 rounded-full bg-red-500"></span>
			</div>
			<h2 class="text-3xl font-bold mb-2">Espace coach</h2>
			<p class="text-gray-300">Vue globale, alertes du jour et suivi de tous les clients.</p>
		</a>
	</div>
</div>
