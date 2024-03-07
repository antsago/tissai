<script>
	import Masonry from './Masonry.svelte'
	import { Section } from '$lib/components'

	export let data
</script>

<Section label="Resultados de la búsqueda">
	<Masonry class="content-center" tiles={data.products} let:tile={product}>
		<a class="w-full h-full flex flex-col rounded bg-stone-200" href="../product/{product.id}">
			<div class="w-full flex-grow max-h-96">
				<img
					src={product.image}
					alt={product.name}
					class="rounded border border-stone-300/50 object-contain"
				/>
			</div>
			<h3 class="block min-h-[1.5rem] max-h-[4.5rem] mx-4 my-3 text-base text-center text-ellipsis overflow-hidden text-stone-700">{product.name}</h3>
		</a>
	</Masonry>
</Section>
