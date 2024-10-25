<script lang="ts">
  import ChipCloud from "../ChipCloud.svelte"

  let classes = ""
  export { classes as class }
  export let filters: {
    brand?: string,
    max?: number,
    min?: number,
    category?: string,
    attributes?: { label: string, value: string }[],
  }
  const getPriceValue = (min?: number, max?: number) => {
    if (min !== undefined && max !== undefined) {
      return `${min} - ${max}`
    }
    if (max !== undefined) {
      return `> ${max}`
    }

    return `< ${min}`
  }
</script>

<ChipCloud
  class={classes}
  background="bg-stone-50"
  chips={[
    filters.category && { text: `categoría: ${filters.category}`, orange: true },
    filters.brand && { text: `marca: ${filters.brand}`},
    (filters.min !== undefined || filters.max !== undefined) && { text: `price: ${getPriceValue(filters.min, filters.max)}`},
    ...(filters.attributes?.map(({ label, value }) => ({ text: label === value ? value : `${label}: ${value}` })) ?? []),
  ].filter(c => !!c)}
/>
