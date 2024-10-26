<script lang="ts">
  import Chip from "./Chip.svelte"
  import ChipContainer from "./ChipContainer.svelte"

  let classes = ""
  export { classes as class }
  export let background: string
  export let chips: { orange?: boolean; text: string }[]

  const rng = function (seed: number) {
    const max = chips.length
    const min = 0

    const rnd = Math.abs(Math.cos(seed))
    return Math.floor(rnd * (max - min) + min)
  }
</script>

<ChipContainer class={classes}>
  {#each chips as chip, index}
    <Chip
      style="order:{rng(chips.length - index)}; z-index: {rng(index + 1)};"
      emphasis={chip.orange ? "secondary" : "default"}
      {background}
    >
      {chip.text}
    </Chip>
  {/each}
</ChipContainer>
