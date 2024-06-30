import type { Seller, Db } from "@tissai/db"
import type { JsonLD } from "../jsonLd.js"

async function sellers({ offers }: JsonLD, db: Db): Promise<Seller[]> {
  if (!offers) {
    return []
  }

  const entities = offers
    .map((offer: any) => ({
      name: offer.seller?.toLowerCase(),
    }))
    .filter(({ name }) => !!name)
  
  await Promise.all(entities.map((seller) => db.sellers.create(seller)))
  return entities
}

export default sellers
