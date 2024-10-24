<script lang="ts">
  import type { ProductDetails } from "@tissai/db"
  import {
    Section,
    ImageCarousel,
    OfferList,
    TextInfo,
    ProductSnippet,
  } from "$lib/components"

  export let data: ProductDetails
</script>

<Section labelledBy="product-details" class="md:flex-row">
  <ImageCarousel images={data.images} alt={data.title} />
  <TextInfo
    class="md:max-w-80 lg:max-w-sm md:rounded-r"
    headerId="product-details"
    details={data}
  />
</Section>

<Section labelledBy="compra-en" class="mt-12 p-8">
  <OfferList headerId="compra-en" offers={data.offers} />
</Section>

{#if data.similar}
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
{/if}
