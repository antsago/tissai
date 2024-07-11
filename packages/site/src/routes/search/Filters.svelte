<script lang="ts">
  import type { SearchParams } from "@tissai/db"
  import { Chip, ChipContainer } from "$lib/components"

  let classes = ""
  export { classes as class }
  export let filters: Omit<SearchParams, "query">
  const { ["categoría"]: category, ...otherAttributes } = filters?.attributes ?? {}
  const attributes = Object.entries(otherAttributes).map(([label, value]) => ({ label, value }))
  const attributesLength = attributes.length ?? 0
</script>

<ChipContainer class={classes}>
  {#if category}
    <Chip orange background="bg-stone-50" style="z-index: {attributesLength + 3}">
      categoría: {category.join(' o ')}
    </Chip>
  {/if}
  {#if filters.brand}
    <Chip background="bg-stone-50" style="z-index: {attributesLength + 2}">
      marca: {filters.brand}
    </Chip>
  {/if}
  {#if filters.min || filters.max}
    <Chip background="bg-stone-50" style="z-index: {attributesLength + 1}">
      precio:
      {#if filters.min && filters.max}
        {filters.min} - {filters.max}
      {:else if filters.max}
        &lt;{filters.max}
      {:else}
        &gt;{filters.min}
      {/if}
    </Chip>
  {/if}
  {#each attributes as attribute, index}
    <Chip background="bg-stone-50" style="z-index: {attributesLength - index}">
      {#if attribute.value.length === 1 && attribute.value[0] === attribute.label}
        {attribute.label}
      {:else}
        {attribute.label}: {attribute.value.join(' o ')}
      {/if}
    </Chip>
  {/each}
</ChipContainer>
