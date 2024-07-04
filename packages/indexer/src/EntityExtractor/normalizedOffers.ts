import type { JsonLD } from "../jsonLd.js"
import _ from "lodash"

export type NormalizedOffer = NonNullable<JsonLD["offers"]>[0]

function normalizedOffers(ld: JsonLD): NormalizedOffer[] {
  if (!ld.offers) {
    return [
      {
        price: undefined,
        currency: undefined,
        seller: undefined,
      },
    ]
  }

  return _.uniqWith(ld.offers.map(o => ({
    price: o.price,
    currency: o.currency,
    seller: o.seller,
  })), _.isEqual)
}

export default normalizedOffers
