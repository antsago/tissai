<script>
	export let data
</script>

<div class="flex flex-col grow px-6 py-6">
	<img
		class="aspect-square object-cover rounded-lg ring-2 ring-stone-200/50"
		alt={data.name}
		src={data.image}
	/>
	<div class="p-6 my-6 bg-stone-200 rounded-lg ring-1 ring-stone-300">
		<h1 class="text-stone-800 uppercase text-lg">{data.name}</h1>
		<p class="mt-4 text-stone-700 text-base" role="main">{data.description}</p>
	</div>
	<a
		class="sticky bottom-6 mt-auto py-6 px-10 bg-amber-600 rounded-2xl border border-amber-700 text-amber-200 text-center"
		href={data.sellers?.[0].productUrl}
		>Crompra en {data.sellers[0].shop.name}</a
	>
</div>
