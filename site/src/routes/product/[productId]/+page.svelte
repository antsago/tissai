<script>
  import {
    ArrowTopRightOnSquare as OutlinkIcon,
    Section,
  } from "$lib/components"

  export let data
</script>

<Section labelledBy="product-details" class="md:flex-row">
  <div class="bg-stone-100 relative">
    <img
      class="sticky top-0 w-full max-w-sm md:max-w-md mx-auto md:rounded border border-stone-200/50 aspect-square object-cover"
      alt={data.title}
      src={data.images[0]}
    />
  </div>
  <div class="flex flex-col md:max-w-sm bg-stone-200 md:rounded">
    <div class="max-w-prose m-auto p-8">
      <img alt={data.brand?.name} src={data.brand?.logo}/>
      <p>{data.brand?.name}</p>
      <h1
        id="product-details"
        class="text-stone-900 uppercase text-lg font-medium"
      >
        {data.title}
      </h1>
      <p class="mt-4 text-stone-700 text-base">
        {data.description}
      </p>
    </div>
    </div>
    </Section>
    
    <Section labelledBy="compra-en">
      <h2 id="compra-en" class="mx-8 text-stone-700 text-xl font-medium">
        Compra en
      </h2>
      <a
        class="sticky bottom-0 py-6 px-10 md:rounded-b bg-orange-500 text-orange-100 text-center"
        href={data.product_uri}
      >
        <span class="font-semibold">{data.shop_name}</span>
        <OutlinkIcon class="inline-block ml-1 align-text-bottom w-5 h-5" />
      </a>
</Section>

<Section labelledBy="similar-products" class="mt-12 py-8 space-y-5">
  <h2 id="similar-products" class="mx-8 text-stone-700 text-xl font-medium">
    Similares
  </h2>
  <ul class="flex flex-row overflow-x-scroll space-x-8 px-8">
    {#each data.similar as recommendation}
      <li class="min-w-56 max-w-56">
        <a
          href="./{recommendation.id}"
          class="w-full block bg-stone-50 border-stone-300 border py-5 px-4 space-y-4 rounded"
        >
          <img
            class="w-full aspect-square object-cover mx-auto rounded border-stone-200/50 border"
            src={recommendation.image}
            alt={recommendation.title}
          />
          <h3
            class="block w-full h-10 text-sm text-center uppercase text-stone-700 line-clamp-2"
          >
            {recommendation.title}
          </h3>
        </a>
      </li>
    {/each}
  </ul>
</Section>
