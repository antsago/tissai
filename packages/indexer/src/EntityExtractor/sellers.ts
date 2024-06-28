import type { Seller } from "@tissai/db"
import type { ParsedLd } from "./infoPipelines.js"

function sellers({ offers }: ParsedLd): Seller[] {
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
