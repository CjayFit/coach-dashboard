<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		// Appliquer le thème noir au démarrage
		document.documentElement.classList.add('dark');
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Le Cercle Discipline</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	{@render children()}
</div>
