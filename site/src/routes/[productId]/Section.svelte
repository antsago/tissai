<script lang="ts">
	export let labelledBy: string
	let classes = ""
	export { classes as class }
</script>

<section aria-labelledby={labelledBy} class="bg-stone-100 {classes}">
	<div class="md:max-w-screen-md mx-auto flex flex-col">
		<slot />
	</div>
</section>
