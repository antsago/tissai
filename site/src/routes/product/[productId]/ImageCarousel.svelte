<script lang="ts">
  import { Photo as MissingImage } from "$lib/components"

  export let images: string[] | undefined
  export let alt:string
</script>

<ul class="flex flex-row overflow-x-scroll space-x-4 px-8 py-4">
  {#if !images || images.length === 0}
    <MissingImage title="Sin imagenes" />
  {:else}
    {#each images as image}
      <li class="min-w-56 max-w-56">
        <img
          class="rounded border border-stone-200/50 aspect-square object-cover"
          src={image}
          {alt}
        />
      </li>
    {/each}
  {/if}
</ul>
