<script lang="ts">
  import type { ProductDetails } from "@tissai/db"
  import {
    ArrowTopRightOnSquare as OutlinkIcon,
  } from "$lib/components"

  export let offer: ProductDetails["offers"][0]
</script>

<img src={offer.site.icon} alt="Icono de {offer.site.name}">
<h3 class="font-semibold">{offer.site.name}</h3>
<a href={offer.url}>
  <OutlinkIcon
    class="inline-block ml-1 align-text-bottom w-5 h-5"
    title="Link de compra"
  />
</a>
{#if offer.seller}
  <p>{offer.seller}</p>
{/if}
{#if offer.price !== null && offer.price !== undefined}
  <p>{offer.price}</p>
  {#if offer.currency}
    <p>{offer.currency}</p>
  {/if}
{/if}