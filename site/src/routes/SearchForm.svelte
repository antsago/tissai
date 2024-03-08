<script lang="ts">
	import { MagnifyingGlass as SearchIcon } from "$lib/components"

	let classes = ""
	export { classes as class }
	export let initialValue: string | null = ""
	export let onSubmit: any = () => {} // Hook to test form submit
</script>

<form
	action="/search"
	on:submit={onSubmit}
	role="search"
	class="{classes} flex rounded-full border border-orange-600 bg-orange-50 px-4"
>
	<input
		name="q"
		type="search"
		value={initialValue}
		class="flex-grow w-1 bg-inherit py-1"
	/>
	<button class="ml-auto p-px"
		><SearchIcon class="w-7 text-orange-600" /></button
	>
</form>
