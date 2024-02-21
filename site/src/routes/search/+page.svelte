<script>
	export let data
</script>

<form action="/search">
	<label>
		Search
		<input name="q">
	</label>
</form>
<ul>
	Products
	{#each data.products as product}
		<li>{product.name}</li>
	{/each}
</ul>
