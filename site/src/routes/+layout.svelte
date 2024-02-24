<script lang="ts">
	import "../app.css"
	import Logo from "$lib/Logo.svelte"
	import { page } from '$app/stores'
	import SearchIcon from "$lib/MagnifyingGlass.svelte"

	// Hook to test form submit
	export let onSubmit: any = () => {}
</script>

<div class="flex flex-col min-h-screen w-full bg-stone-50">
	<header
		class="px-6 py-2 bg-orange-100 border-b-2 border-orange-700 text-orange-600"
	>
		<div class="max-w-screen-lg mx-auto flex justify-between items-center">
			<div class="mr-6 flex items-end">
				<Logo class="w-11 md:w-12" />
				<span class="hidden md:block font-['Kalam'] text-3xl md:text-3xl">Tissai</span>
			</div>

			<form
				action="/search"
				on:submit={onSubmit}
				role="search"
				class="flex-grow max-w-lg flex rounded-full border border-orange-600 bg-orange-50 px-4"
			>
				<input
					name="q"
					type="search"
					value={$page.url.searchParams.get("q")}
					class="flex-grow w-1 bg-inherit py-1"
				/>
				<button class="ml-auto p-px"><SearchIcon class="w-7 text-orange-600"/></button>
			</form>
		</div>
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
