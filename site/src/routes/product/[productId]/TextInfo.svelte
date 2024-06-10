<script lang="ts">
  import type { ProductDetails } from "@tissai/db"
  import Chip from "./Chip.svelte"

  export let details: ProductDetails
  let classes = ""
  export { classes as class }

  const rng = function (seed: number) {
    const max = details.tags.length + 1
    const min = 0

    const rnd = Math.abs(Math.cos(seed))
    return Math.floor(rnd * (max - min) + min)
  }
</script>

<div class={classes}>
  {#if details.brand}
    <div class="mb-2 flex flex-row items-center">
      {#if details.brand.logo}
        <img class="mr-2 h-4 border border-stone-300 rounded-sm" src={details.brand.logo} alt="Logo de {details.brand.name}" />
      {/if}
      <span class="font-light text-stone-600 uppercase text-sm">
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
  <div class="flex flex-wrap justify-center mt-4 px-1">
    <Chip style="order:{rng(details.tags.length)}; z-index: {rng(0)};" orange>
      {details.category}
    </Chip>

    {#each details.tags as tag, index}
      <Chip
        style="order:{rng(details.tags.length - index)}; z-index: {rng(
          index + 1,
        )};"
      >
        {tag}
      </Chip>
    {/each}
  </div>
</div>
