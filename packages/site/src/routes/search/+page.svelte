<script lang="ts">
  import { page } from "$app/stores"
  import type { Search } from "@tissai/db"
  import Masonry from "./Masonry.svelte"
  import { Section } from "$lib/components"

  export let data: { products: Search }
</script>

<Section label="Filtros">
  {#if $page.url.searchParams.get("brand")}
    <span>{$page.url.searchParams.get("brand")}</span>
  {/if}
  {#if $page.url.searchParams.get("category")}
    <span>{$page.url.searchParams.get("category")}</span>
  {/if}
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
      <span>{product.price}</span>
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
