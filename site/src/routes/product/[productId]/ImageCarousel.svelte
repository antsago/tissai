<script lang="ts">
  import { Photo as MissingImage } from "$lib/components"

  export let images: string[] | undefined
  export let alt: string
</script>

<ul class="flex flex-row overflow-x-scroll space-x-4 px-12 py-4">
  {#if !images || images.length === 0}
    <li
      class="flex w-44 h-28 m-auto bg-stone-200/50 rounded border border-stone-300"
    >
      <MissingImage
        class="m-auto stroke-[0.5] text-stone-500/25 h-10"
        title="Sin imagenes"
      />
    </li>
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
