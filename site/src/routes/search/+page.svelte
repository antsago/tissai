<script>
	export let data
</script>

<section aria-label="Resultados de la búsqueda">
	<ul>
		Products
		{#each data.products as product}
			<li>
				<a href="../product/{product.id}">
					<h3>{product.name}</h3>
					<img src={product.image} alt={product.name} />
				</a>
			</li>
		{/each}
	</ul>
</section>
