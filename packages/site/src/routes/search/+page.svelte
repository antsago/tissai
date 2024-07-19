<script lang="ts">
  import type { Search, SearchParams } from "@tissai/db"
  import { Section } from "$lib/components"
  import Masonry from "./Masonry.svelte"
  import Filters from "./Filters.svelte"
  import ProductTile from "./ProductTile.svelte"

  export let data: {
    products: Search["products"]
    filters: Omit<SearchParams, "query">
  }
</script>

<Section label="Filtros" class="mb-12 bg-stone-50 px-8">
  <Filters filters={data.filters} class="mx-auto" />
</Section>

<Section label="Resultados de la búsqueda">
  <Masonry class="content-center" tiles={data.products} let:tile={product}>
    <ProductTile {product} />
  </Masonry>
</Section>
