<script lang="ts">
  import type { ProductDetails } from "@tissai/db"
  import { ArrowTopRightOnSquare as OutlinkIcon } from "../icons"

  export let offer: NonNullable<ProductDetails["offers"]>[0]
</script>

<a
  href={offer.url}
  class="flex flex-col items-center w-52 py-4 bg-stone-50 border-stone-300 border rounded-lg"
>
  <div
    class="w-full flex flex-row border-b border-stone-200 pb-4 px-8 items-end"
  >
    <div
      class="flex flex-row items-baseline text-stone-900 {offer.price === null
        ? 'line-through'
        : ''}"
    >
      <span class="font-medium text-lg">
        {offer.price ?? "00.00"}
      </span>
      <span class="ml-[2px] font-light text-xs lowercase"
        >{offer.currency ?? "???"}</span
      >
    </div>
    <OutlinkIcon
      class="ml-auto mb-[3px] rounded-lg text-orange-500 stroke-2 w-6 h-6"
      title="Link de compra"
    />
  </div>
  <div class="mt-4 flex flex-row items-center">
    <img
      class="mr-2 h-5 border border-stone-200/50 rounded-sm"
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
