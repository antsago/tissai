<script lang="ts">
  import type { ProductDetails } from "@tissai/db"

  export let product: ProductDetails["similar"][0]
</script>

<a
  href="./{product.id}"
  class="w-full block bg-stone-50 border-stone-300 border py-5 px-4 space-y-4 rounded"
>
  <img
    class="w-full aspect-square object-cover mx-auto rounded border-stone-200/50 border"
    src={product.image}
    alt={product.title}
  />
  <h3
    class="block w-full h-10 text-sm text-center uppercase text-stone-700 line-clamp-2"
  >
    {product.title}
  </h3>
</a>
