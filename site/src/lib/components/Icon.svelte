<script lang="ts">
  let classes = ""
  export { classes as class }
  export let solid = false
  export let title: string | undefined = undefined
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  stroke="currentColor"
  fill={solid ? "currentColor": "none"}
  class={classes}
  role="img"
>
  {#if title}
    <title>{title}</title>
  {/if}
  <slot />
</svg>
