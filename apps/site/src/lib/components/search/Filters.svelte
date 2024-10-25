<script lang="ts">
  import Chip from "../Chip.svelte"
  import ChipContainer from "../ChipContainer.svelte"

  let classes = ""
  export { classes as class }
  export let filters: {
    brand?: string,
    max?: number,
    min?: number,
    category?: string,
    attributes?: { label: string, value: string }[],
  }
</script>

<ChipContainer class={classes}>
  {#if filters.category}
    <Chip
      orange
      background="bg-stone-50"
    >
      categoría: {filters.category}
    </Chip>
  {/if}
  {#if filters.brand}
    <Chip background="bg-stone-50">
      marca: {filters.brand}
    </Chip>
  {/if}
  {#if filters.min || filters.max}
    <Chip background="bg-stone-50">
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
  {#each filters.attributes ?? [] as attribute, index}
    <Chip background="bg-stone-50">
      {#if attribute.value === attribute.label}
        {attribute.label}
      {:else}
        {attribute.label}: {attribute.value}
      {/if}
    </Chip>
  {/each}
</ChipContainer>
