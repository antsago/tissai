<script lang="ts">
  import { Photo as MissingImage } from "$lib/components"

  export let images: string[] | undefined
  export let alt:string
</script>

{#if !images || images.length === 0}
  <MissingImage title="Sin imagenes" />
{:else}
  {#each images as image}
    <img {alt} src={image} />
  {/each}
{/if}
