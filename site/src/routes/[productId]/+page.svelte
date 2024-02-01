<script>
	import OutLink from './ArrowTopRightOnSquare.svelte'

	export let data
</script>

<div class="flex flex-col grow">
	<div class="bg-stone-100 py-px">
		<img
			class="w-full max-w-md mx-auto aspect-square object-cover"
			alt={data.name}
			src={data.image}
		/>
	</div>
	<div class="my-6 p-6 bg-stone-100">
		<h1 class="text-stone-900 uppercase text-lg">{data.name}</h1>
		<p class="mt-4 text-stone-700 text-base" role="main">{data.description}</p>
	</div>
	<a
		class="sticky bottom-0 mt-auto py-6 px-10 bg-orange-100 border-t border-orange-300/50 text-orange-900 text-center"
		href={data.sellers?.[0].productUrl}
	>
		Crompra en 
		<span class="font-semibold">{data.sellers[0].shop.name}</span>
		<OutLink foo="inline-block ml-1 align-text-bottom w-5 h-5"/>
	</a>
</div>
