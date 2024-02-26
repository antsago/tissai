<!-- From https://tobiasahlin.com/blog/masonry-with-css/ -->
<!-- Needs a fixed height taller than the tallest column -->
<script lang="ts">
	let classes = ""
	export { classes as class }
</script>

<style>
	.masonry {
		display: flex;
		flex-flow: column wrap;
	}

	/* Force new columns */
	.break {
		flex-basis: 100%;
		width: 0;
		margin: 0;
	}

	/* Re-order items into rows */
	.masonry :global(*:nth-of-type(2n+1)) { order: 1; }
	.masonry :global(*:nth-of-type(2n)) { order: 2; }
	@media (min-width: 640px) {
		.masonry :global(*:nth-of-type(3n+1)) { order: 1; }
		.masonry :global(*:nth-of-type(3n+2)) { order: 2; }
		.masonry :global(*:nth-of-type(3n)) { order: 3; }
	}
	@media (min-width: 768px) {
		.masonry :global(*:nth-of-type(4n+1)) { order: 1; }
		.masonry :global(*:nth-of-type(4n+2)) { order: 2; }
		.masonry :global(*:nth-of-type(4n+3)) { order: 3; }
		.masonry :global(*:nth-of-type(4n))   { order: 4; }
	}
	@media (min-width: 1024px) {
		.masonry :global(*:nth-of-type(5n+1)) { order: 1; }
		.masonry :global(*:nth-of-type(5n+2)) { order: 2; }
		.masonry :global(*:nth-of-type(5n+3)) { order: 3; }
		.masonry :global(*:nth-of-type(5n+4)) { order: 4; }
		.masonry :global(*:nth-of-type(5n))   { order: 5; }
	}
</style>

<div class="{classes} masonry">
	<slot />
	<span class="break"></span>
	<span class="break hidden sm:block"></span>
	<span class="break hidden md:block"></span>
	<span class="break hidden lg:block"></span>
</div>
