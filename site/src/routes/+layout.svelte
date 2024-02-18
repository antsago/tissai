<script>
	import "../app.css"
	import Logo from "$lib/Logo.svelte"
</script>

<div class="flex flex-col min-h-screen w-full bg-stone-50">
	<header
		class="flex justify-center items-end md:justify-start px-6 py-2 bg-orange-100 border-b-2 border-orange-700 text-orange-600"
	>
		<Logo class="w-10 md:w-12" />
		<span class="font-['Kalam'] text-2xl md:text-3xl">Tissai</span>
	</header>
	<div class="min-h-12 grow" />
	<main>
		<slot />
	</main>
	<div class="min-h-12 grow-[2]" />
	<footer
		class="mt-auto flex justify-center bg-stone-200 px-4 py-4 text-sm text-stone-500"
	>
		<small class="">2024 @ Tissai</small>
	</footer>
</div>
