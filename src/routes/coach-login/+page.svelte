<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getCurrentCoachSession, loginCoach } from '$lib/coachPortal';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');

	onMount(() => {
		if (getCurrentCoachSession()) {
			goto('/coach-dashboard');
		}
	});

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		error = '';

		const { error: loginError } = loginCoach(email, password);
		loading = false;

		if (loginError) {
			error = loginError;
		} else {
			goto('/coach-dashboard');
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-red-950 px-4">
	<div class="w-full max-w-3xl grid gap-8 lg:grid-cols-[1fr_0.9fr]">
		<section class="bg-white/5 border border-white/10 backdrop-blur rounded-3xl p-8 lg:p-10 text-white shadow-2xl">
			<div class="inline-flex items-center gap-3 mb-4">
				<span class="inline-flex h-12 w-12 items-center justify-center rounded-full border-4 border-red-500 bg-red-500/20">
					<span class="h-4 w-4 rounded-full bg-red-500"></span>
				</span>
				<div>
					<p class="text-sm uppercase tracking-[0.3em] text-red-300">Le Cercle Discipliné</p>
					<p class="text-xs text-gray-400">Espace coach</p>
				</div>
			</div>
			<h1 class="text-4xl font-bold leading-tight mb-4">Vue coach : suivi de tous les clients</h1>
			<p class="text-gray-300 text-lg mb-8">
				Consulte les saisies quotidiennes, identifie les clients en retard et garde un oeil sur l’adhérence.
			</p>
			<div class="grid gap-4 sm:grid-cols-3">
				<div class="rounded-2xl bg-white/10 border border-white/10 p-4">
					<div class="text-2xl font-bold">A</div>
					<div class="text-sm text-gray-300">Vue globale</div>
				</div>
				<div class="rounded-2xl bg-white/10 border border-white/10 p-4">
					<div class="text-2xl font-bold">B</div>
					<div class="text-sm text-gray-300">Alertes du jour</div>
				</div>
				<div class="rounded-2xl bg-white/10 border border-white/10 p-4">
					<div class="text-2xl font-bold">C</div>
					<div class="text-sm text-gray-300">Historique client</div>
				</div>
			</div>
		</section>

		<section class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 lg:p-10">
			<h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Connexion admin</h2>

			<form onsubmit={handleLogin} class="space-y-4">
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email coach</label>
					<input id="email" type="email" bind:value={email} required class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white" />
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe secret</label>
					<input id="password" type="password" bind:value={password} required class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white" />
				</div>

				{#if error}
					<div class="bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 p-3 rounded-xl text-sm border border-red-200 dark:border-red-800">{error}</div>
				{/if}

				<button type="submit" disabled={loading} class="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
					{loading ? 'Authentification...' : 'Accéder au Dashboard'}
				</button>
			</form>

			<div class="mt-8 text-sm text-gray-500 dark:text-gray-400 text-center">
				Zone réservée à l'administration. <br/>
				Vous êtes client ? <a href="/login" class="text-red-600 dark:text-red-400 font-semibold hover:underline">Retour à la connexion client</a>
			</div>
		</section>
	</div>
</div>