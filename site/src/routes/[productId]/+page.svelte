<script>
	import OutLink from "$lib/ArrowTopRightOnSquare.svelte"

	export let data
</script>

<div class="flex flex-col grow space-y-6 md:flex-row md:grow-0 md:space-y-0">
	<div class="bg-stone-100 md:grow md:max-w-md">
		<img
			class="w-full max-w-sm mx-auto border border-stone-200/50 aspect-square object-cover"
			alt={data.name}
			src={data.image}
		/>
	</div>
	<div class="grow flex flex-col md:max-w-sm">
		<div class="mb-6 bg-stone-200">
			<div class="max-w-prose mx-auto p-6">
				<h1 class="text-stone-900 uppercase text-lg">{data.name}</h1>
				<p class="mt-4 text-stone-700 text-base" role="main">{data.description}</p>
			</div>
		</div>
		<a
			class="sticky bottom-0 mt-auto py-6 px-10 bg-orange-500 text-orange-100 text-center"
			href={data.sellers?.[0].productUrl}
		>
			Crompra en
			<span class="font-semibold">{data.sellers[0].shop.name}</span>
			<OutLink class="inline-block ml-1 align-text-bottom w-5 h-5" />
		</a>
	</div>
</div>
