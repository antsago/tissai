import type { Product, Offer, Page, Db, Seller } from "@tissai/db"
import type { NormalizedOffer } from "./normalizedOffers.js"
import { randomUUID } from "node:crypto"
import _ from "lodash"

async function offer(
  normalized: NormalizedOffer,
  seller: Seller|undefined, 
  page: Page,
  product: Product,
  db: Db,
): Promise<Offer> {
  const entity = {
    id: randomUUID(),
    url: page.url,
    site: page.site,
    product: product.id,
    price: normalized.price,
    currency: normalized.currency,
    seller: seller?.name,
  }

  await db.offers.create(entity)

  return entity
}

export default offer
