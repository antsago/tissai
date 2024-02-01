<script>
	import "../app.css"
	import Logo from "$lib/Logo.svelte"
</script>

<div class="min-h-screen flex flex-col w-full">
	<nav
		class="mb-6 flex items-center border-b border-orange-600/50 px-6 py-2 bg-orange-400"
	>
		<Logo class="w-10 text-orange-200" />
	</nav>
	<slot />
</div>
