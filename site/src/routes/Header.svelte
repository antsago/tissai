<script lang="ts">
	import { Logo } from "$lib/components"
	import SearchForm from "./SearchForm.svelte"

	export let searchQuery: string | null
</script>

<header
	class="px-6 py-2 bg-orange-100 border-b-2 border-orange-700 text-orange-500"
>
	<div class="max-w-screen-lg mx-auto flex justify-between items-center">
		<a href="/" class="mr-6 flex">
			<Logo class="w-11 md:w-12" />
			<span class="hidden md:block pt-[0.5rem] text-3xl md:text-3xl font-['Kalam']">
				Tissai
			</span>
		</a>

		<SearchForm class="flex-grow max-w-lg" initialValue={searchQuery} />
	</div>
</header>
