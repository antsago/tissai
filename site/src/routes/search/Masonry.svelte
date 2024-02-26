<!-- From https://tobiasahlin.com/blog/masonry-with-css/ -->
<!-- Needs a fixed height taller than the tallest column -->
<script lang="ts">
	let classes = ""
	export { classes as class }
	export let itemsLength: number
</script>

<style>
	.masonry {
		display: flex;
		flex-flow: column wrap;
		--max-item-height: 20rem;
	}
	.masonry :global(*:not(.break)) {
		max-height: var(--max-item-height);
	}

	/* Force new columns */
	.break {
		flex-basis: 100%;
		width: 0;
		margin: 0;
		display: none;
	}

	/* Split/reorder items into columns */
	@media (min-width: 425px) {
		.masonry {
			height: calc((var(--items-length) / 2 + 1) * var(--max-item-height));
		}
		.masonry :global(*:nth-of-type(2n+1)) { order: 1; }
		.masonry :global(*:nth-of-type(2n)) { order: 2; }
		.break:nth-of-type(1) {
			display: block;
		}
	}

	@media (min-width: 768px) {
		.masonry {
			height: calc((var(--items-length) / 3 + 1) * var(--max-item-height));
		}
		.masonry :global(*:nth-of-type(3n+1)) { order: 1; }
		.masonry :global(*:nth-of-type(3n+2)) { order: 2; }
		.masonry :global(*:nth-of-type(3n)) { order: 3; }
		.break:nth-of-type(2) {
			display: block;
		}
	}

	@media (min-width: 1024px) {
		.masonry {
			height: calc((var(--items-length) / 4 + 1) * var(--max-item-height));
		}
		.masonry :global(*:nth-of-type(4n+1)) { order: 1; }
		.masonry :global(*:nth-of-type(4n+2)) { order: 2; }
		.masonry :global(*:nth-of-type(4n+3)) { order: 3; }
		.masonry :global(*:nth-of-type(4n))   { order: 4; }
		.break:nth-of-type(3) {
			display: block;
		}
	}

	@media (min-width: 1440px) {
		.masonry {
			height: calc((var(--items-length) / 5 + 1) * var(--max-item-height));
		}
		.masonry :global(*:nth-of-type(5n+1)) { order: 1; }
		.masonry :global(*:nth-of-type(5n+2)) { order: 2; }
		.masonry :global(*:nth-of-type(5n+3)) { order: 3; }
		.masonry :global(*:nth-of-type(5n+4)) { order: 4; }
		.masonry :global(*:nth-of-type(5n))   { order: 5; }
		.break:nth-of-type(4) {
			display: block;
		}
	}
</style>

<ul class="{classes} masonry" style="--items-length: {itemsLength}">
	<slot />
	<span class="break"></span>
	<span class="break"></span>
	<span class="break"></span>
	<span class="break"></span>
</ul>
