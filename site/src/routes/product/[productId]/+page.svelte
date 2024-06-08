<script lang="ts">
  import type { ProductDetails } from "@tissai/db"
  import { Photo as MissingImage, Section } from "$lib/components"
  import ProductSnippet from "./ProductSnippet.svelte"
  import Offer from "./Offer.svelte"
  import Chip from "./Chip.svelte"

  export let data: ProductDetails
</script>

<Section labelledBy="product-details" class="md:flex-row">
  <div class="bg-stone-100 relative">
    {#if !data.images || data.images.length === 0}
      <MissingImage title="Sin imagenes" />
    {:else}
      {#each data.images as image}
        <!-- class="sticky top-0 w-full max-w-sm md:max-w-md mx-auto md:rounded border border-stone-200/50 aspect-square object-cover" -->
        <img alt={data.title} src={image} />
      {/each}
    {/if}
  </div>
  <div class="flex flex-col md:max-w-sm bg-stone-200 md:rounded">
    <div class="max-w-prose m-auto p-8">
      <div class="flex flex-wrap gap-2 justify-center align-center py-6 px-4">
        <Chip color="orange">{data.category}</Chip>
        {#each data.tags as tag}
          <Chip>{tag}</Chip>
        {/each}
      </div>
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
      {#if data.description}
        <p class="mt-4 text-stone-700 text-base">
          {data.description}
        </p>
      {/if}
    </div>
  </div>
</Section>

<Section labelledBy="compra-en" class="mt-12 p-8">
  <h2 id="compra-en" class="text-stone-700 text-xl font-medium">Compra en</h2>
  {#if data.offers.length === 0}
    <p class="mt-6 w-full text-center text-stone-500">
      Producto descatalogado o sin ofertas
    </p>
  {:else}
    <ul class="my-16 space-y-16">
      {#each data.offers as offer}
        <li>
          <Offer {offer} />
        </li>
      {/each}
    </ul>
  {/if}
</Section>

<Section labelledBy="similar-products" class="mt-12 py-8 space-y-5">
  <h2 id="similar-products" class="mx-8 text-stone-700 text-xl font-medium">
    Similares
  </h2>
  <ul class="flex flex-row overflow-x-scroll space-x-8 px-8">
    {#each data.similar as similar}
      <li class="min-w-56 max-w-56">
        <ProductSnippet product={similar} />
      </li>
    {/each}
  </ul>
</Section>
