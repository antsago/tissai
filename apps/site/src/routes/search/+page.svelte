<script lang="ts">
  import type { Search, Suggestion, Filters as FiltersType } from "@tissai/db"
  import { page } from "$app/stores"
  import {
    Section,
    Masonry,
    ProductTile,
    SuggestionTile,
    Filters,
  } from "$lib/components"

  export let data: {
    tiles: (Search | Suggestion)[]
    filters: FiltersType
  }
</script>

<Section label="Filtros" class="mb-12 bg-stone-50 px-8">
  <Filters filters={data.filters} class="mx-auto" />
</Section>

<Section label="Resultados de la búsqueda">
  <Masonry class="content-center" tiles={data.tiles} let:tile>
    {#if "title" in tile}
      <ProductTile product={tile} />
    {:else}
      <SuggestionTile suggestion={tile} baseUrl={$page.url.href} />
    {/if}
  </Masonry>
</Section>
