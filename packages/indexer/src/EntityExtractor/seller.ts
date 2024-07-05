import type { Seller, Db } from "@tissai/db"
import type { NormalizedOffer } from "./normalizedOffers.js"

async function seller(
  { seller: name }: NormalizedOffer,
  db: Db,
): Promise<Seller | undefined> {
  if (!name) {
    return undefined
  }

  const entity = {
    name: name.toLowerCase(),
  }
  await db.sellers.create(entity)

  return entity
}

export default seller
