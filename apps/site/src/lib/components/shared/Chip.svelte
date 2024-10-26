<script lang="ts">
  export let style = ""
  export let background: string|undefined
  export let emphasis: "primary"|"secondary"|"default" = 'default'
</script>

<span
  {style}
  class="rounded-full -mx-1 -my-px px-4 py-1 text-xs border whitespace-nowrap {
  emphasis === "primary" ? "border-orange-500/50 bg-orange-400 text-orange-100" :
  emphasis === "secondary"
    ? `border-orange-700 text-orange-600 ${background}`
    : `border-stone-500 text-stone-600 ${background}`}
  "
>
  <slot>Uups, something went wrong :(</slot>
</span>
