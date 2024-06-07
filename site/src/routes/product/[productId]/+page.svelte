<script>
  import {
    ArrowTopRightOnSquare as OutlinkIcon,
    Photo as MissingImage,
    Section,
  } from "$lib/components"
  import Recommendations from "./Recommendations.svelte"

  export let data
</script>

<Section labelledBy="product-details" class="md:flex-row">
  <div class="bg-stone-100 relative">
    {#if data.images.length === 0}
      <MissingImage title="Sin imagenes" />
    {/if}
    {#each data.images as image}
      <img
        class="sticky top-0 w-full max-w-sm md:max-w-md mx-auto md:rounded border border-stone-200/50 aspect-square object-cover"
        alt={data.title}
        src={image}
      />
    {/each}
  </div>
  <div class="flex flex-col md:max-w-sm bg-stone-200 md:rounded">
    <div class="max-w-prose m-auto p-8">
      {#if data.brand}
        {#if data.brand.logo}
          <img alt="Logo de {data.brand.name}" src={data.brand.logo} />
        {/if}
        <p>{data.brand.name}</p>
      {/if}
      <h1
        id="product-details"
        class="text-stone-900 uppercase text-lg font-medium"
      >
        {data.title}
      </h1>
      <span>{data.category}</span>
      {#each data.tags as tag}
        <span>{tag}</span>
      {/each}
      {#if data.description}
        <p class="mt-4 text-stone-700 text-base">
          {data.description}
        </p>
      {/if}
    </div>
  </div>
</Section>

<Section labelledBy="compra-en" class="mt-12 py-8">
  <h2 id="compra-en" class="mx-8 text-stone-700 text-xl font-medium">
    Compra en
  </h2>
  {#if data.offers.length === 0}
    <p>No hemos encontrado este producto en ningún lado</p>
  {/if}
  {#each data.offers as offer}
    <li>
      <h3 class="font-semibold">{offer.site.name}</h3>
      <a href={offer.url}>
        <OutlinkIcon
          class="inline-block ml-1 align-text-bottom w-5 h-5"
          title="Link de compra"
        />
      </a>
      {#if offer.seller}
        <p>{offer.seller}</p>
      {/if}
      {#if ![null, undefined].includes(offer.price)}
        <p>{offer.price}</p>
        {#if offer.currency}
          <p>{offer.currency}</p>
        {/if}
      {/if}
    </li>
  {/each}
</Section>

<Recommendations recommendations={data.similar} class="mt-12" />
