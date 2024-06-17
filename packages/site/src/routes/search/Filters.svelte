<script lang="ts">
  import type { SearchParams } from "@tissai/db"
  import Chip from "../product/[productId]/Chip.svelte"

  let classes = ""
  export { classes as class }
  export let filters: Omit<SearchParams, "embedding">
  const tagsLength = filters.tags?.length ?? 0
</script>

<div class="flex flex-row flex-wrap justify-center px-1 {classes}">
  {#if filters.category}
    <Chip orange background="bg-stone-50" style="z-index: {tagsLength + 3}">
      categoría: {filters.category}
    </Chip>
  {/if}
  {#if filters.brand}
    <Chip background="bg-stone-50" style="z-index: {tagsLength + 2}">
      marca: {filters.brand}
    </Chip>
  {/if}
  {#if filters.min && filters.max}
    <Chip background="bg-stone-50" style="z-index: {tagsLength + 1}">
      precio: {filters.min} - {filters.max}
    </Chip>
  {:else if filters.max}
    <Chip background="bg-stone-50" style="z-index: {tagsLength + 1}">
      precio: &lt;{filters.max}
    </Chip>
  {:else if filters.min}
    <Chip background="bg-stone-50" style="z-index: {tagsLength + 1}">
      precio: &gt;{filters.min}
    </Chip>
  {/if}
  {#if filters.tags}
    {#each filters.tags as tag, index}
      <Chip background="bg-stone-50" style="z-index: {tagsLength - index}">{tag}</Chip>
    {/each}
  {/if}
</div>