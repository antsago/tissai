<script lang="ts">
  import Chip from "../Chip.svelte"
  import ChipContainer from "../ChipContainer.svelte"

  export let attributes: {
    label: string
    value: string
  }[] | null
  export let category: string | null
  export let background: string
  let classes = ""
  export { classes as class }

  const rng = function (seed: number) {
    const max = attributes?.length ?? 0 + (category === null ? 0 : 1)
    const min = 0

    const rnd = Math.abs(Math.cos(seed))
    return Math.floor(rnd * (max - min) + min)
  }
</script>

<ChipContainer class={classes}>
  {#if category}
    <Chip
     style="order:{rng(attributes?.length ?? 0)}; z-index: {rng(0)};"
     background={background}
      orange
    >
      categoría: {category}
    </Chip>
  {/if}
  {#each attributes ?? [] as attribute, index}
    <Chip
      style="order:{rng((attributes ?? []).length - index)}; z-index: {rng(
        index + 1,
      )};"
     background={background}
    >
      {#if attribute.label === attribute.value}
        {attribute.value}
      {:else}
        {attribute.label}: {attribute.value}
      {/if}
    </Chip>
  {/each}
</ChipContainer>