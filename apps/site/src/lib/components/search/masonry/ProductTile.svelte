<script lang="ts">
  import type { Search } from "@tissai/db"

  export let product: Search
</script>

<a
  class="w-full h-full flex flex-col rounded bg-stone-200"
  href="../product/{product.id}"
>
  <div class="relative w-full flex-basis-6 min-h-20 max-h-[25rem] rounded-t">
    <img
      src={product.image}
      alt={product.title}
      class="h-full mx-auto rounded-t border border-b-0 border-stone-300/50"
    />
    <div
      class="absolute left-0 bottom-0 right-0 top-0 flex flex-col bg-transparent p-4"
    >
      {#if product.price}
        <span
          class="ml-auto rounded-full px-2 py-0.5 text-sm bg-orange-400 border border-orange-500/50 text-orange-100"
        >
          {product.price}
        </span>
      {/if}
      {#if product.brand}
        {#if product.brand.logo}
          <img
            class="mr-auto mt-auto h-5 rounded border border-stone-200"
            src={product.brand.logo}
            alt="Logo de {product.brand.name}"
          />
        {:else}
          <span
            class="mr-auto mt-auto rounded px-2 py-0.5 text-sm bg-stone-100 border border-stone-200/50 font-semibold text-stone-700"
          >
            {product.brand.name}
          </span>
        {/if}
      {/if}
    </div>
  </div>
  <h3
    class="block w-full px-4 py-3 border rounded-b border-stone-300/50 text-base text-center truncate text-stone-700"
  >
    {product.title}
  </h3>
</a>
