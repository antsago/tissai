<script lang="ts">
  import type { ProductDetails } from "@tissai/db"

  export let brand: ProductDetails["brand"]
  export let description: ProductDetails["description"]
  export let title: ProductDetails["title"]
  let classes = ""
  export { classes as class }
</script>

<div class="{classes} p-8">
  {#if brand}
    <div class="mb-2 flex flex-row items-center">
      {#if brand.logo}
        <img class="mr-2 h-4" src={brand.logo} alt="Logo de {brand.name}" />
      {/if}
      <span class="font-light text-stone-600 italic text-lg">{brand.name}</span>
    </div>
  {/if}
  <h1 id="product-details" class="text-stone-900 uppercase text-lg font-medium">
    {title}
  </h1>
  {#if description}
    <p class="mt-4 text-stone-700 text-base">
      {description}
    </p>
  {/if}
</div>
