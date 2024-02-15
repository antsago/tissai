<script>
	import OutLink from "$lib/ArrowTopRightOnSquare.svelte"

	export let data
</script>

<div class="md:bg-stone-100">
	<section
		aria-labelledby="pdetailstitle"
		class="md:max-w-screen-md mx-auto flex flex-col space-y-6 md:flex-row md:space-y-0"
	>
		<div class="bg-stone-100 md:grow">
			<img
				class="w-full max-w-sm md:max-w-full mx-auto border-y border-stone-200/50 aspect-square object-cover"
				alt={data.name}
				src={data.images[0]}
			/>
		</div>
		<div class="flex flex-col md:max-w-sm bg-stone-200">
			<div class="max-w-prose m-auto p-6">
				<h1 id="pdetailstitle" class="text-stone-900 uppercase text-lg">{data.name}</h1>
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
	</section>
</div>
