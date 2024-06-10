<script lang="ts">
  export let orange = false
  export let style = ""
</script>

<span
  {style}
  class="before:content-[''] rounded-3xl -m-1 px-5 py-1 {orange
    ? 'border border-orange-700 text-orange-700 bg-orange-50'
    : 'border border-stone-700 text-stone-700 bg-stone-50'}"
>
  <slot />
</span>
