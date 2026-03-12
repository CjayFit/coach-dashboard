<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		error = '';

		const { data, error: loginError } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		loading = false;

		if (loginError) {
			error = loginError.message;
		} else {
			goto('/dashboard');
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
	<div class="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
		<h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">Coach Dashboard</h1>
		<p class="text-gray-600 text-center mb-8">Connexion administrateur</p>

		<form onsubmit={handleLogin} class="space-y-4">
			<div>
				<label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					placeholder="admin@example.com"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					required
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					placeholder="••••••••"
				/>
			</div>

			{#if error}
				<div class="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
					{error}
				</div>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{loading ? 'Connexion...' : 'Se connecter'}
			</button>
		</form>
	</div>
</div>
