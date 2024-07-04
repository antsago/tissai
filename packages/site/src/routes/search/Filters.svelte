<script lang="ts">
  import type { SearchParams } from "@tissai/db"
  import { Chip, ChipContainer } from "$lib/components"

  let classes = ""
  export { classes as class }
  export let filters: Omit<SearchParams, "query">
  const tagsLength = filters.tags?.length ?? 0
</script>

<ChipContainer class={classes}>
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
  {#if filters.min || filters.max}
    <Chip background="bg-stone-50" style="z-index: {tagsLength + 1}">
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
  {#if filters.tags}
    {#each filters.tags as tag, index}
      <Chip background="bg-stone-50" style="z-index: {tagsLength - index}">
        {tag}
      </Chip>
    {/each}
  {/if}
</ChipContainer>
