<script lang="ts">
  import type { Search } from "@tissai/db"
  import Masonry from "./Masonry.svelte"
  import { Section } from "$lib/components"

  export let data: { products: Search }
</script>

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
      {#if product.brand}
        <img
          src={product.brand.logo}
          alt="Logo de {product.brand.name}"
        />
      {/if}
      <h3
        class="block w-full px-4 py-3 border rounded-b border-stone-300/50 text-base text-center truncate text-stone-700"
      >
        {product.title}
      </h3>
    </a>
  </Masonry>
</Section>
