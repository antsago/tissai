<script lang="ts">
  import type { ProductDetails } from "@tissai/db"
  import { ArrowTopRightOnSquare as OutlinkIcon } from "$lib/components"

  export let offer: ProductDetails["offers"][0]
</script>

<a
  href={offer.url}
  class="flex flex-col items-center py-4 bg-stone-50 border-stone-300 border rounded-lg"
>
  <div
    class="w-full flex flex-row border-b border-stone-200 pb-4 px-8 items-end"
  >
    <div class="flex flex-row items-baseline text-stone-700">
      <span
        class="font-medium text-lg {offer.price === null ||
        offer.price === undefined
          ? 'line-through'
          : ''}"
      >
        {offer.price ?? "00.00"}
      </span>
      {#if offer.currency}
        <span class="ml-[2px] font-light text-xs lowercase"
          >{offer.currency}</span
        >
      {/if}
    </div>
    <OutlinkIcon
      class="ml-auto mb-[3px] rounded-lg text-orange-500 stroke-2 w-6 h-6"
      title="Link de compra"
    />
  </div>
  <div class="mt-4 flex flex-row items-center">
    <img
      class="mr-2 h-5"
      src={offer.site.icon}
      alt="Icono de {offer.site.name}"
    />
    <h3 class="font-medium text-stone-900 text-lg">{offer.site.name}</h3>
  </div>
  {#if offer.seller}
    <p class="mt-2 text-stone-500 text-xs">
      Vendido por <span class="italic">{offer.seller}</span>
    </p>
  {/if}
</a>
