<script>
	import "../app.css"
	import Logo from "$lib/Logo.svelte"
</script>

<div class="min-h-screen flex flex-col w-full">
	<nav
		class="mb-6 flex justify-center items-end pr-6 px-4 py-2 bg-orange-100 border-b-2 border-orange-700 text-orange-700"
	>
		<Logo class="w-10" />
		<span class="font-['Kalam'] text-2xl">Tissai</span>
	</nav>
	<slot />
</div>
