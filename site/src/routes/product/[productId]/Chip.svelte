<script lang="ts">
  export let orange = false
  export let style = ""
</script>

<span
  {style}
  class="rounded-full -mx-1 -my-px px-4 py-1 text-xs bg-stone-200 border {orange
    ? 'border-orange-700 text-orange-600'
    : 'border-stone-500 text-stone-600'}"
>
  <slot />
</span>
