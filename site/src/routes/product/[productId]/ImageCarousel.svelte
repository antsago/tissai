<script lang="ts">
  import { Photo as MissingImage } from "$lib/components"

  export let images: string[] | undefined
  export let alt: string
</script>

<div class="w-full overflow-x-scroll">
  <ul class="flex flex-row space-x-4 px-12 py-4 w-max min-w-full h-full justify-center items-center">
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
        <li class="max-w-[calc(100vw-6rem)] md:max-w-[calc(100vw-26rem)]">
          <img
            class="w-full max-h-96 rounded border border-stone-200/50 aspect-square object-cover"
            src={image}
            {alt}
          />
        </li>
      {/each}
    {/if}
  </ul>
</div>
