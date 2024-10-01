<script lang="ts">
  import type { Search, SearchParams, Suggestion } from "@tissai/db"
  import { page } from "$app/stores"
  import { Section } from "$lib/components"
  import Masonry from "./Masonry.svelte"
  import Filters from "./Filters.svelte"
  import ProductTile from "./ProductTile.svelte"
  import SuggestionTile from "./SuggestionTile.svelte"

  export let data: {
    tiles: (Search | Suggestion)[]
    filters: Omit<SearchParams, "query">
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
