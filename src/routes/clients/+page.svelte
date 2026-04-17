<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getCurrentSession } from '$lib/clientPortal';

	onMount(() => {
		goto(getCurrentSession() ? '/dashboard' : '/login');
	});
</script>

<div class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
	<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
</div>