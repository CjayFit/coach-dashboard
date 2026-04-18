<script lang="ts">
	import { goto } from '$app/navigation';
	import { registerClient, loginClient } from '$lib/clientPortal';

	let name = '';
	let email = '';
	let goal = '';
	let password = '';
	let confirmPassword = '';
	let error = '';
	let loading = false;

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!name || !email || !goal || !password || !confirmPassword) {
			error = 'Tous les champs sont requis.';
			return;
		}

		if (password !== confirmPassword) {
			error = 'Les mots de passe ne correspondent pas.';
			return;
		}

		if (password.length < 8) {
			error = 'Le mot de passe doit contenir au moins 8 caractères.';
			return;
		}

		// La vérification locale "getClientByEmail" a été supprimée. 
		// C'est le serveur qui gèrera cela de façon sécurisée et logique.

		loading = true;
		const { success, error: registerError } = await registerClient({ name, email, goal, password, confirmPassword });
		
		if (registerError) {
			error = registerError;
			loading = false;
		} else if (success) {
			// Auto login après inscription réussie
			const { error: loginError } = await loginClient(email, password);
			loading = false;
			
			if (loginError) {
				error = "Inscription réussie, mais échec de la connexion automatique: " + loginError;
			} else {
				goto('/dashboard');
			}
		}
	}
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center">
	<div class="max-w-md w-full mx-auto p-8 rounded-lg bg-white dark:bg-gray-800 shadow-md">
		<div class="text-center mb-8">
					<span class="inline-flex h-12 w-12 items-center justify-center rounded-full border-4 mb-4 border-red-500 bg-red-500/20">
						<span class="h-4 w-4 rounded-full bg-red-500"></span>
					</span>
					<div>
						<p class="text-sm uppercase tracking-[0.3em] text-red-300">Le Cercle Discipliné</p>
					</div>
		</div>

		<form onsubmit={handleSubmit} class="space-y-6">
			<div>
				<label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>Nom complet</label
				>
				<input
					type="text"
					id="name"
					bind:value={name}
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
				/>
			</div>
			<div>
				<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>Email</label
				>
				<input
					type="email"
					id="email"
					bind:value={email}
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
				/>
			</div>
			<div>
				<label for="goal" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>Objectif</label
				>
				<textarea
					id="goal"
					bind:value={goal}
					rows="3"
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
				></textarea>
			</div>
			<div>
				<label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>Mot de passe (minimum 8 caractères)</label
				>
				<input
					type="password"
					id="password"
					bind:value={password}
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
					placeholder="Choisissez un mot de passe sécurisé"
				/>
			</div>
			<div>
				<label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>Confirmer le mot de passe</label
				>
				<input
					type="password"
					id="confirmPassword"
					bind:value={confirmPassword}
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
					placeholder="Confirmez votre mot de passe"
				/>
			</div>

			{#if error}
				<p class="text-sm text-red-600">{error}</p>
			{/if}

			<div>
				<button
					type="submit"
					disabled={loading}
					class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? 'Création du compte...' : 'S\'inscrire'}
				</button>
			</div>
		</form>
        <p class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Déjà un compte? <a href="/login" class="font-medium text-red-600 hover:text-red-500">Se connecter</a>
        </p>
	</div>
</div>
