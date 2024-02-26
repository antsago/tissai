<script>
	import Masonry from './Masonry.svelte'
	import { Section } from '$lib/components'

	export let data
</script>

<Section label="Resultados de la búsqueda">
	<Masonry class="items-stretch py-8" itemsLength={data.products.length}>
		{#each data.products as product, i}
			<div class="w-40 border border-stone-300 m-2 p-1">
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
	</Masonry>
</Section>
