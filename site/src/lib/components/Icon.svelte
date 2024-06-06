<script lang="ts">
  let classes = ""
  let title: string | undefined = undefined
  export { classes as class, title }
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
  class={classes}
  role="img"
>
  {#if title}
    <title>{title}</title>
  {/if}
  <slot />
</svg>
