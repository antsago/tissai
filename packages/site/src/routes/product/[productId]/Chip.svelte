<script lang="ts">
  export let orange = false
  export let style = ""
  export let background: string
</script>

<span
  {style}
  class="rounded-full -mx-1 -my-px px-4 py-1 text-xs border whitespace-nowrap {orange
    ? 'border-orange-700 text-orange-600'
    : 'border-stone-500 text-stone-600'}
    {background}
  "
>
  <slot />
</span>
