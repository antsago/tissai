<script lang="ts">
	export let labelledBy: string
	let classes = ""
	export { classes as class }
</script>

<section aria-labelledby={labelledBy} class="bg-stone-100">
	<div class="max-w-screen-lg mx-auto flex flex-col justify-evenly {classes}">
		<slot />
	</div>
</section>
