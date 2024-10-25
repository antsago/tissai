<script lang="ts">
  import ChipCloud from "../ChipCloud.svelte"

  export let attributes:
    | {
        label: string
        value: string
      }[]
    | null
  export let category: string | null
  export let background: string
  let classes = ""
  export { classes as class }
</script>

<ChipCloud
  class={classes}
  {background}
  chips={[
    ...(category ? [{ text: `categoría: ${category}`, orange: true }] : []),
    ...(attributes?.map(({ label, value }) => ({ text: label === value ? value : `${label}: ${value}`})) ?? [])
  ]}
/>
