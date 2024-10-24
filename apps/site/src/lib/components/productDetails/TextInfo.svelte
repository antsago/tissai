<script lang="ts">
  import type { ProductDetails } from "@tissai/db"
  import Chip from "../Chip.svelte"
  import ChipContainer from "../ChipContainer.svelte"

  export let details: ProductDetails
  let classes = ""
  export { classes as class }

  const attributes = details.attributes ?? []
  const rng = function (seed: number) {
    const max = attributes.length ?? 0 + 1
    const min = 0

    const rnd = Math.abs(Math.cos(seed))
    return Math.floor(rnd * (max - min) + min)
  }
</script>

<div class="flex flex-col p-8 bg-stone-200 {classes}">
<div class="max-w-prose m-auto">
  {#if details.brand}
    <div class="mb-2 flex flex-row items-center">
      {#if details.brand.logo}
        <img
          class="mr-2 h-4 border border-stone-300 rounded-sm"
          src={details.brand.logo}
          alt="Logo de {details.brand.name}"
        />
      {/if}
      <span class="font-semibold text-stone-500 text-sm">
        {details.brand.name}
      </span>
    </div>
  {/if}

  <h1 id="product-details" class="text-stone-900 uppercase text-lg font-medium">
    {details.title}
  </h1>

  {#if details.description}
    <p class="mt-4 text-stone-700 text-base">
      {details.description}
    </p>
  {/if}

  <ChipContainer class="mt-4">
    {#if details.category}
      <Chip
        background="bg-stone-200"
        style="order:{rng(attributes.length)}; z-index: {rng(0)};"
        orange
      >
        categoría: {details.category}
      </Chip>
    {/if}
    {#each attributes as attribute, index}
      <Chip
        background="bg-stone-200"
        style="order:{rng(attributes.length - index)}; z-index: {rng(
          index + 1,
        )};"
      >
        {#if attribute.label === attribute.value}
          {attribute.value}
        {:else}
          {attribute.label}: {attribute.value}
        {/if}
      </Chip>
    {/each}
  </ChipContainer>
</div>
</div>
