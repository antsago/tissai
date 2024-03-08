<!-- From https://tobiasahlin.com/blog/masonry-with-css/ -->
<script lang="ts" generics="T">
	let classes = ""
	export { classes as class }
	export let tiles: T[]
</script>

<ul class="{classes} masonry" style="--tiles-length: {tiles.length}">
	{#each tiles as tile}
		<li class="tile">
			<slot {tile} />
		</li>
	{/each}
	<span class="tile break"></span>
	<span class="tile break"></span>
	<span class="tile break"></span>
</ul>

<style>
	.masonry {
		--no-columns: 1;
		--max-tile-height: 28rem;
		--tile-margin: 0.5rem;
		--masonry-y-padding: 2rem;
		--masonry-x-padding: 1rem;
		--tiles-per-column: calc(var(--tiles-length) / var(--no-columns));
		display: flex;
		flex-flow: column wrap;
		height: calc(
			var(--tiles-per-column) *
				(var(--max-tile-height) + var(--tile-margin) * 2) +
				var(--masonry-y-padding) * 2
		);
		padding: var(--masonry-y-padding) var(--masonry-x-padding);
	}
	.tile:not(.break) {
		margin: var(--tile-margin);
		width: 14.5rem;
		max-height: var(--max-tile-height);
	}

	/* Force new columns */
	.break {
		flex-basis: 100%;
		width: 0;
		margin: 0;
		display: none;
	}

	/* Split/reorder tiles into columns */
	@media (min-width: 528px) {
		.masonry {
			--no-columns: 2;
		}
		.tile:nth-of-type(2n + 1) {
			order: 1;
		}
		.tile:nth-of-type(2n) {
			order: 2;
		}
		.break:nth-of-type(1) {
			display: block;
		}
	}

	@media (min-width: 776px) {
		.masonry {
			--no-columns: 3;
		}
		.tile:nth-of-type(3n + 1) {
			order: 1;
		}
		.tile:nth-of-type(3n + 2) {
			order: 2;
		}
		.tile:nth-of-type(3n) {
			order: 3;
		}
		.break:nth-of-type(2) {
			display: block;
		}
	}

	@media (min-width: 1024px) {
		.masonry {
			--no-columns: 4;
		}
		.tile:nth-of-type(4n + 1) {
			order: 1;
		}
		.tile:nth-of-type(4n + 2) {
			order: 2;
		}
		.tile:nth-of-type(4n + 3) {
			order: 3;
		}
		.tile:nth-of-type(4n) {
			order: 4;
		}
		.break:nth-of-type(3) {
			display: block;
		}
	}
</style>
