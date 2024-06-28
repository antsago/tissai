import type { Seller } from "@tissai/db"
import type { JsonLD } from "../jsonLd.js"

function sellers({ offers }: JsonLD): Seller[] {
  if (!offers) {
    return []
  }

  return offers
    .map((offer: any) => ({
      name: offer.seller?.toLowerCase(),
    }))
    .filter(({ name }) => !!name)
}

export default sellers
