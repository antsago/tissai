<script lang="ts">
  import type { ProductDetails } from "@tissai/db"
  import Offer from "./Offer.svelte"

  export let headerId: string
  export let offers: ProductDetails["offers"]
</script>

<h2 id={headerId} class="text-stone-700 text-xl font-medium">Compra en</h2>

{#if !offers?.length}
  <p class="mt-6 w-full text-center text-stone-500">
    producto descatalogado o sin ofertas
  </p>
{:else}
  <ul class="mt-8 flex flex-row flex-wrap justify-center gap-8">
    {#each offers as offer}
      <li>
        <Offer {offer} />
      </li>
    {/each}
  </ul>
{/if}