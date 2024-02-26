<script>
	export let data
</script>
<style>
	/* From https://tobiasahlin.com/blog/masonry-with-css/ */
	.masonry {
		display: flex;
		flex-flow: column wrap;
		align-content: space-around;
		/* Your container needs a fixed height, and it 
		* needs to be taller than your tallest column. */
		height: 500vh; 
	}

	/* Force new columns */
	.break {
		flex-basis: 100%;
		width: 0;
		margin: 0;
	}

	/* Re-order items into 2 rows */
	.item:nth-of-type(2n+1) { order: 1; }
	.item:nth-of-type(2n) { order: 2; }
	/* Re-order items into 3 rows */
	@media (min-width: 640px) {
		.item:nth-of-type(3n+1) { order: 1; }
		.item:nth-of-type(3n+2) { order: 2; }
		.item:nth-of-type(3n) { order: 3; }
	}
	/* Re-order items into 4 rows */
	@media (min-width: 768px) {
		.item:nth-of-type(4n+1) { order: 1; }
		.item:nth-of-type(4n+2) { order: 2; }
		.item:nth-of-type(4n+3) { order: 3; }
		.item:nth-of-type(4n)   { order: 4; }
	}
	/* Re-order items into 5 rows */
	@media (min-width: 1024px) {
		.item:nth-of-type(5n+1) { order: 1; }
		.item:nth-of-type(5n+2) { order: 2; }
		.item:nth-of-type(5n+3) { order: 3; }
		.item:nth-of-type(5n+4) { order: 4; }
		.item:nth-of-type(5n)   { order: 5; }
	}
</style>

<section aria-label="Resultados de la búsqueda">
	<div class="masonry">
		{#each data.products as product, i}
			<div class="item w-40 border border-stone-300 m-2 p-1">
				<a href="../product/{product.id}">
					<img
						src={product.image}
						alt={product.name}
						class=""
					/>
					<h3>{product.name}</h3>
					<h3>{i}</h3>
				</a>
			</div>
		{/each}
		<span class="item break"></span>
		<span class="item break hidden sm:block"></span>
		<span class="item break hidden md:block"></span>
		<span class="item break hidden lg:block"></span>
	</div>
</section>
