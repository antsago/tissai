<script lang="ts">
  import type { ProductDetails } from "@tissai/db"
  import AttributeCloud from "./AttributeCloud.svelte"

  export let details: ProductDetails
  export let titleId: string
  let classes = ""
  export { classes as class }
</script>

<div class="flex flex-col p-8 bg-stone-200 {classes}">
  <div class="max-w-prose m-auto">
    {#if details.brand}
      <div class="mb-2 flex flex-row items-center">
        {#if details.brand.logo}
          <img
            class="mr-2 h-4 border border-stone-300 rounded-sm"
            src={details.brand.logo}
            alt="Logo de {details.brand.name}"
          />
        {/if}
        <span class="font-semibold text-stone-500 text-sm">
          {details.brand.name}
        </span>
      </div>
    {/if}

    <h1
      id={titleId}
      class="text-stone-900 uppercase text-lg font-medium"
    >
      {details.title}
    </h1>

    {#if details.description}
      <p class="mt-4 text-stone-700 text-base">
        {details.description}
      </p>
    {/if}

    <AttributeCloud
      class="mt-4"
      background="bg-stone-200"
      category={details.category}
      attributes={details.attributes}
    />
  </div>
</div>
