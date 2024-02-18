<script>
	import OutLink from "$lib/ArrowTopRightOnSquare.svelte"
	import Section from "./Section.svelte"

	export let data
</script>

<Section labelledBy="product-details" class="md:flex-row md:max-w-screen-md">
	<div class="bg-stone-100 md:grow">
		<img
			class="w-full max-w-sm md:max-w-4xl mx-auto md:rounded-l border-y border-stone-200/50 aspect-square object-cover"
			alt={data.name}
			src={data.images[0]}
		/>
	</div>
	<div class="flex flex-col md:max-w-sm bg-stone-200 md:rounded-r">
		<div class="max-w-prose m-auto p-8">
			<h1 id="product-details" class="text-stone-900 uppercase text-lg font-medium">{data.name}</h1>
			<p class="mt-4 text-stone-700 text-base">
				{data.description}
			</p>
		</div>
		<a
			class="sticky bottom-0 py-6 px-10 md:rounded-br bg-orange-500 text-orange-100 text-center"
			href={data.product_uri}
		>
			Crompra en
			<span class="font-semibold">{data.shop_name}</span>
			<OutLink class="inline-block ml-1 align-text-bottom w-5 h-5" />
		</a>
	</div>
</Section>

<Section labelledBy="similar-products" class="mt-12 py-8 space-y-5">
	<h2 id="similar-products" class="mx-8 text-stone-700 text-lg font-medium">Similares</h2>
	<ul class="flex flex-row overflow-x-scroll space-x-12 px-8">
		{#each data.similar as recommendation}
			<li class="min-w-64 max-w-64">
				<a href="../{recommendation.id}" class="w-full block bg-stone-50 border-stone-300 border p-6 space-y-4 rounded">
					<img
						class="w-full aspect-square object-cover mx-auto rounded border-stone-200/50 border"
						src={recommendation.image}
						alt={recommendation.name}
					/>
					<h3 class="block w-full text-base text-center uppercase text-stone-700">
						{recommendation.name}
					</h3>
				</a>
			</li>
		{/each}
	</ul>
</Section>
