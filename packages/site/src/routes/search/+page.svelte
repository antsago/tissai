<script lang="ts">
  import { page } from "$app/stores"
  import type { Search } from "@tissai/db"
  import Masonry from "./Masonry.svelte"
  import { Section } from "$lib/components"
  import Chip from "../product/[productId]/Chip.svelte"

  export let data: { products: Search }
</script>

<Section label="Filtros" class="mb-12 bg-stone-50">
  <div class="mx-auto flex flex-row flex-wrap justify-center px-1">
    {#if $page.url.searchParams.get("category")}
      <Chip orange background="bg-stone-50" style="z-index: {$page.url.searchParams.getAll("inc").length + 3}">
        categoría: {$page.url.searchParams.get("category")}
      </Chip>
    {/if}
    {#if $page.url.searchParams.get("brand")}
      <Chip background="bg-stone-50" style="z-index: {$page.url.searchParams.getAll("inc").length + 2}">
        marca: {$page.url.searchParams.get("brand")}
      </Chip>
    {/if}
    {#if $page.url.searchParams.get("min") && $page.url.searchParams.get("max")}
      <Chip background="bg-stone-50" style="z-index: {$page.url.searchParams.getAll("inc").length + 1}">
        precio: {$page.url.searchParams.get("min")} - {$page.url.searchParams.get("max")}
      </Chip>
    {:else if $page.url.searchParams.get("max")}
      <Chip background="bg-stone-50" style="z-index: {$page.url.searchParams.getAll("inc").length + 1}">
        precio: &lt;{$page.url.searchParams.get("max")}
      </Chip>
    {:else if $page.url.searchParams.get("min")}
      <Chip background="bg-stone-50" style="z-index: {$page.url.searchParams.getAll("inc").length + 1}">
        precio: &gt;{$page.url.searchParams.get("min")}
      </Chip>
    {/if}
    {#if $page.url.searchParams.get("inc")}
      {#each $page.url.searchParams.getAll("inc") as tag, index}
        <Chip background="bg-stone-50" style="z-index: {$page.url.searchParams.getAll("inc").length - index}">{tag}</Chip>
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
