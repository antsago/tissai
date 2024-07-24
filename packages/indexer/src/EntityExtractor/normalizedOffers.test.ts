import { expect, describe, it } from "vitest"
import normalizedOffers from "./normalizedOffers.js"

const OFFER = {
  url: "https://example.com/offer",
  price: 10,
  currency: "EUR",
  seller: "pertemba",
}

describe("normalizedOffers", () => {
  it("extracts implicit offer", async () => {
    const result = normalizedOffers({})

    expect(result).toStrictEqual([
      {
        price: undefined,
        currency: undefined,
        seller: undefined,
      },
    ])
  })

  it("extracts multiple offers", async () => {
    const offer2 = {
      url: "https://example.com/offer",
      price: 20,
      currency: "USD",
      seller: "batemper",
    }
    const result = normalizedOffers({ offers: [OFFER, offer2] })

    expect(result).toStrictEqual([
      {
        price: OFFER.price,
        currency: OFFER.currency,
        seller: OFFER.seller,
      },
      {
        price: offer2.price,
        currency: offer2.currency,
        seller: offer2.seller,
      },
    ])
  })

  it("ignores duplicated offers", async () => {
    const offer2 = {
      id: "something-different",
      ...OFFER,
    }
    const result = normalizedOffers({ offers: [OFFER, offer2] })

    expect(result.length).toStrictEqual(1)
  })
})
