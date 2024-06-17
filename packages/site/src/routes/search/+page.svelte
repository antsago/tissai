<script lang="ts">
  import { page } from "$app/stores"
  import type { Search, SearchParams } from "@tissai/db"
  import Masonry from "./Masonry.svelte"
  import { Section } from "$lib/components"
  import Chip from "../product/[productId]/Chip.svelte"

  export let data: { products: Search, filters: Omit<SearchParams, "embedding"> }
</script>

<Section label="Filtros" class="mb-12 bg-stone-50">
  <div class="mx-auto flex flex-row flex-wrap justify-center px-1">
    {#if data.filters.category}
      <Chip orange background="bg-stone-50" style="z-index: {(data.filters.tags?.length ?? 0) + 3}">
        categoría: {$page.url.searchParams.get("category")}
      </Chip>
    {/if}
    {#if data.filters.brand}
      <Chip background="bg-stone-50" style="z-index: {(data.filters.tags?.length ?? 0) + 2}">
        marca: {data.filters.brand}
      </Chip>
    {/if}
    {#if data.filters.min && data.filters.max}
      <Chip background="bg-stone-50" style="z-index: {(data.filters.tags?.length ?? 0) + 1}">
        precio: {data.filters.min} - {data.filters.max}
      </Chip>
    {:else if data.filters.max}
      <Chip background="bg-stone-50" style="z-index: {(data.filters.tags?.length ?? 0) + 1}">
        precio: &lt;{data.filters.max}
      </Chip>
    {:else if data.filters.min}
      <Chip background="bg-stone-50" style="z-index: {(data.filters.tags?.length ?? 0) + 1}">
        precio: &gt;{data.filters.min}
      </Chip>
    {/if}
    {#if data.filters.tags?.length}
      {#each data.filters.tags as tag, index}
        <Chip background="bg-stone-50" style="z-index: {data.filters.tags?.length - index}">{tag}</Chip>
      {/each}
    {/if}
  </div>
</Section>

<Section label="Resultados de la búsqueda">
  <Masonry class="content-center" tiles={data.products} let:tile={product}>
    <a
      class="w-full h-full flex flex-col rounded bg-stone-200"
      href="../product/{product.id}"
    >
      <div class="w-full flex-basis-6 max-h-[25rem] rounded-t">
        <img
          src={product.image}
          alt={product.title}
          class="h-full mx-auto rounded-t border border-b-0 border-stone-300/50"
        />
      </div>
      {#if product.price}
        <span>{product.price}</span>
      {/if}
      {#if product.brand}
        {#if product.brand.logo}
          <img src={product.brand.logo} alt="Logo de {product.brand.name}" />
        {:else}
          <span>{product.brand.name}</span>
        {/if}
      {/if}
      <h3
        class="block w-full px-4 py-3 border rounded-b border-stone-300/50 text-base text-center truncate text-stone-700"
      >
        {product.title}
      </h3>
    </a>
  </Masonry>
</Section>
