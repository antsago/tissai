<script>
	export let data
</script>

<ul>
	Products
	{#each data.products as product}
		<li>{product.name}</li>
	{/each}
</ul>
