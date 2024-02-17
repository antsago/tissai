<script>
	import OutLink from "$lib/ArrowTopRightOnSquare.svelte"
	import Section from "./Section.svelte"

	export let data
</script>

<Section labelledBy="product-details" class="md:flex-row">
	<div class="bg-stone-100 md:grow">
		<img
			class="w-full max-w-sm md:max-w-full mx-auto border-y border-stone-200/50 aspect-square object-cover"
			alt={data.name}
			src={data.images[0]}
		/>
	</div>
	<div class="flex flex-col md:max-w-sm bg-stone-200">
		<div class="max-w-prose m-auto p-6">
			<h1 id="product-details" class="text-stone-900 uppercase text-lg">{data.name}</h1>
			<p class="mt-4 text-stone-700 text-base">
				{data.description}
			</p>
		</div>
		<a
			class="sticky bottom-0 py-6 px-10 bg-orange-500 text-orange-100 text-center"
			href={data.product_uri}
		>
			Crompra en
			<span class="font-semibold">{data.shop_name}</span>
			<OutLink class="inline-block ml-1 align-text-bottom w-5 h-5" />
		</a>
	</div>
</Section>

<section aria-labelledby="similar-products">
	<h2 id="similar-products">Productos similares</h2>
	<ul>
	{#each data.similar as recommendation}
	<li>
		<a href="/{recommendation.id}">
			<img src={recommendation.image} alt={recommendation.name}/>
			<span>{recommendation.name}</span>
		</a>
	</li>
	{/each}
	</ul>
</section>
