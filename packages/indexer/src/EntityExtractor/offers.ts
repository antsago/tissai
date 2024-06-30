import type { Product, Offer, Page, Db } from "@tissai/db"
import type { JsonLD } from "../jsonLd.js"
import { randomUUID } from "node:crypto"
import _ from "lodash"

function extractOffers(ld: JsonLD, page: Page, product: Product): Offer[] {
  const base = {
    url: page.url,
    site: page.site,
    product: product.id,
  }

  if (!ld.offers) {
    return [
      {
        ...base,
        id: randomUUID(),
        price: undefined,
        currency: undefined,
        seller: undefined,
      },
    ]
  }

  const rawOffers = ld.offers.map((offer) => ({
    ...base,
    price: offer.price,
    currency: offer.currency,
    seller: offer.seller,
  }))
  return _.uniqWith(rawOffers, _.isEqual).map((offer) => ({
    ...offer,
    id: randomUUID(),
  }))
}

async function offers(ld: JsonLD, page: Page, product: Product, db: Db): Promise<Offer[]> {
  const entities = extractOffers(ld, page, product)

  await Promise.all(
    entities
      .map((offer) => db.offers.create(offer))
  )

  return entities
}

export default offers
