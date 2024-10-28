<script lang="ts">
  type Chip = {
    emphasis?: "primary" | "secondary" | string
    text: string
    href?: string
  }

  let classes = ""
  export { classes as class }
  export let background: string
  export let chips: Chip[]

  const rng = function (seed: number) {
    const max = chips.length
    const min = 0

    const rnd = Math.abs(Math.cos(seed))
    return Math.floor(rnd * (max - min) + min)
  }

  const normalizeChips = (chip: Chip, index: number) => {
    const style =
      chip.emphasis === "primary"
        ? "border-orange-500/50 bg-orange-400 text-orange-100"
        : chip.emphasis === "secondary"
          ? `border-orange-700 text-orange-600 ${background}`
          : `border-stone-500 text-stone-600 ${background}`

    return {
      text: chip.text,
      order: rng(chips.length - index),
      zIndex: rng(index + 1),
      href: chip.href,
      style,
    }
  }
</script>

<div class="flex flex-row flex-wrap justify-center content-center px-1 {classes}">
  {#each chips.map(normalizeChips) as chip}
    {@const style = `order:${chip.order}; z-index: ${chip.zIndex};`}
    {@const chipClasses = `rounded-full -mx-1 -my-px px-4 py-1 text-xs border whitespace-nowrap ${chip.style}`}

    {#if chip.href}
      <a href={chip.href}>
        <span {style} class={chipClasses}>{chip.text}</span>
      </a>
    {:else}
      <span {style} class={chipClasses}>{chip.text}</span>
    {/if}
  {/each}
</div>
