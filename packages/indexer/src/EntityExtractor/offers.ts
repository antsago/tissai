import type { Product, Offer, Page } from "@tissai/db"
import type { JsonLD } from "../jsonLd.js"
import { randomUUID } from "node:crypto"
import _ from "lodash"

function offers(ld: JsonLD, page: Page, product: Product): Offer[] {
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

export default offers
