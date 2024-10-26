<script lang="ts">
  import { ChipCloud } from "../shared"

  const getPriceValue = (min?: number, max?: number) => {
    if (min !== undefined && max !== undefined) {
      return `${min} - ${max}`
    }
    if (max !== undefined) {
      return `> ${max}`
    }

    return `< ${min}`
  }

  let classes = ""
  export { classes as class }
  export let filters: {
    brand?: string
    max?: number
    min?: number
    category?: {
      name: string
    }
    attributes?: { label: string; name: string }[]
  }
</script>

<ChipCloud
  class={classes}
  background="bg-stone-50"
  chips={[
    filters.category && {
      text: `categoría: ${filters.category.name}`,
      orange: true,
    },
    filters.brand && { text: `marca: ${filters.brand}` },
    (filters.min !== undefined || filters.max !== undefined) && {
      text: `price: ${getPriceValue(filters.min, filters.max)}`,
    },
    ...(filters.attributes?.map(({ label, name }) => ({
      text: label === name ? name : `${label}: ${name}`,
    })) ?? []),
  ].filter((c) => !!c)}
/>
