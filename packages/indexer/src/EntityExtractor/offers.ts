import type {
  Product,
  Offer,
  Page,
} from "@tissai/db"
import type { ParsedLd } from './infoPipelines.js'
import { randomUUID } from "node:crypto"
import _ from "lodash"

function offers(ld: ParsedLd, page: Page, product: Product): Offer[] {
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

  return _.uniqWith(ld.offers, _.isEqual).map(
    (offer) => ({
      ...base,
      id: randomUUID(),
      price: offer.price,
      currency: offer.currency,
      seller: offer.seller,
    }),
  )
}

export default offers
