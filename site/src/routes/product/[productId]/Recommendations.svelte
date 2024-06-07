<script lang="ts">
  import type { ProductDetails } from "@tissai/db"
  import { Section } from "$lib/components"

  export let recommendations: ProductDetails["similar"]
  let classes = ""
  export { classes as class }
</script>

<Section labelledBy="similar-products" class="{classes} py-8 space-y-5">
  <h2 id="similar-products" class="mx-8 text-stone-700 text-xl font-medium">
    Similares
  </h2>
  <ul class="flex flex-row overflow-x-scroll space-x-8 px-8">
    {#each recommendations as recommendation}
      <li class="min-w-56 max-w-56">
        <a
          href="./{recommendation.id}"
          class="w-full block bg-stone-50 border-stone-300 border py-5 px-4 space-y-4 rounded"
        >
          <img
            class="w-full aspect-square object-cover mx-auto rounded border-stone-200/50 border"
            src={recommendation.image}
            alt={recommendation.title}
          />
          <h3
            class="block w-full h-10 text-sm text-center uppercase text-stone-700 line-clamp-2"
          >
            {recommendation.title}
          </h3>
        </a>
      </li>
    {/each}
  </ul>
</Section>
