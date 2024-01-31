<script>
	export let data
</script>

<div class="min-h-screen flex flex-col">
	<div class="sticky top-0 left-0 right-0 border-t-[20px] border-gray-500"/>
	<div class="flex flex-col grow px-6 py-6">
		<img class="h-80 object-cover rounded-lg ring-2 ring-gray-200/50" alt="{data.name}" src="{data.image}"/>
		<div class="p-6 my-6 bg-gray-200 rounded-lg ring-1 ring-gray-300">
			<h1 class="text-gray-800 uppercase text-lg">{data.name}</h1>
			<p class="mt-4 text-gray-700 text-base" role="main">{data.description}</p>
		</div>
		<!-- sticky -->
		<a class="sticky bottom-6 mt-auto py-6 px-10 bg-gray-500 rounded-2xl text-gray-200 text-center" href={data.sellers?.[0].productUrl}>Crompra en {data.sellers[0].shop.name}</a>
	</div>
</div>
