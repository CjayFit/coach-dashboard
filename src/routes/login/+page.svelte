<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getCurrentSession, getDemoClients, loginClient } from '$lib/clientPortal';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');

	onMount(() => {
		if (getCurrentSession()) {
			goto('/dashboard');
		}
	});

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		error = '';

		const { error: loginError } = loginClient(email, password);

		loading = false;

		if (loginError) {
			error = loginError;
		} else {
			goto('/dashboard');
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-gray-900 to-black px-4">
	<div class="w-full max-w-5xl grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
		<section class="bg-white/5 border border-white/10 backdrop-blur rounded-3xl p-8 lg:p-10 text-white shadow-2xl">
				<div class="inline-flex items-center gap-3 mb-4">
					<span class="inline-flex h-12 w-12 items-center justify-center rounded-full border-4 border-red-500 bg-red-500/20">
						<span class="h-4 w-4 rounded-full bg-red-500"></span>
					</span>
					<div>
						<p class="text-sm uppercase tracking-[0.3em] text-red-300">Le Cercle Discipline</p>
						<p class="text-xs text-gray-400">Portail client</p>
					</div>
				</div>
				<h1 class="text-4xl lg:text-5xl font-bold leading-tight mb-4">Suivi quotidien des calories et de l'entraînement</h1>
			<p class="text-gray-300 text-lg max-w-xl mb-8">
				Chaque client se connecte, saisit ses calories consommées et indique si la séance a été réalisée.
			</p>

			<div class="grid gap-4 sm:grid-cols-3">
				<div class="rounded-2xl bg-white/10 border border-white/10 p-4">
					<div class="text-2xl font-bold">1</div>
					<div class="text-sm text-gray-300">Connexion par client</div>
				</div>
				<div class="rounded-2xl bg-white/10 border border-white/10 p-4">
					<div class="text-2xl font-bold">2</div>
					<div class="text-sm text-gray-300">Saisie journalière</div>
				</div>
				<div class="rounded-2xl bg-white/10 border border-white/10 p-4">
					<div class="text-2xl font-bold">3</div>
					<div class="text-sm text-gray-300">Historique immédiat</div>
				</div>
			</div>
		</section>

		<section class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 lg:p-10">
			<h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Connexion client</h2>
			<p class="text-gray-600 dark:text-gray-400 mb-6">Utilisez une adresse démo ci-dessous. Le mot de passe peut être libre.</p>

			<form on:submit={handleLogin} class="space-y-6">
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						required
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
						placeholder="jean.dupont@demo.local"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Mot de passe</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						required
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
						placeholder="Votre mot de passe"
					/>
				</div>

				{#if error}
					<div class="text-sm text-red-600">
						{error}
					</div>
				{/if}

				<button
					type="submit"
					disabled={loading}
					class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
				>
					{loading ? 'Connexion...' : 'Se connecter'}
				</button>
			</form>

            <p class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Pas encore de compte? <a href="/register" class="font-medium text-red-600 hover:text-red-500">S'inscrire</a>
            </p>

			<div class="mt-8">
				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Ou continuer avec</span>
					</div>
				</div>

				<div class="mt-6">
					<div class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Comptes de démonstration</div>
					<div class="grid gap-3">
						{#each getDemoClients() as client}
							<button
								type="button"
								on:click={() => {
									email = client.email;
									password = 'demo';
								}}
								class="text-left w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
							>
								<div class="font-semibold text-gray-900 dark:text-white">{client.name}</div>
								<div class="text-sm text-gray-500 dark:text-gray-400">{client.email}</div>
							</button>
						{/each}
					</div>
				</div>
			</div>

			<div class="mt-8 text-sm text-center text-gray-500 dark:text-gray-400">
				Vous êtes coach ? <a href="/coach-login" class="text-red-600 dark:text-red-400 font-semibold hover:underline">Accéder à l’espace coach</a>
			</div>
		</section>
	</div>
</div>
