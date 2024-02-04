<script>
	import "../app.css"
	import Logo from "$lib/Logo.svelte"
</script>

<div class="flex flex-col min-h-screen w-full bg-stone-50">
	<nav
		class="flex justify-center items-end pr-6 px-4 py-2 bg-orange-100 border-b-2 border-orange-700 text-orange-600"
	>
		<Logo class="w-10" />
		<span class="font-['Kalam'] text-2xl">Tissai</span>
	</nav>
	<div class="my-6 flex flex-col">
		<slot />
	</div>
	<div class="mt-auto flex justify-center bg-stone-200 px-4 py-4 text-sm text-stone-500">
		<small class="">2024 @ Tissai</small>
	</div>
</div>
