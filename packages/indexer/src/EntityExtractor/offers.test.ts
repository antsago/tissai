import { expect, describe, it } from "vitest"
import offers from "./offers.js"
import { PAGE, PRODUCT } from "@tissai/db/mocks"

const jsonLd = {
  "@context": ["https://schema.org/"],
  "@type": ["Product"],
  name: ["The name of the product"],
  productID: ["121230"],
  brand: [
    {
      "@type": ["Brand"],
      name: ["wedze"],
      image: ["https://brand.com/image.jpg"],
    },
  ],
  description: ["The description"],
  image: ["https://example.com/image.jpg"],
  offers: [,],
}

const OFFER = {
  url: "https://example.com/offer",
  price: 10,
  currency: "EUR",
  seller: "pertemba",
}

describe("offers", () => {
  it("extracts offer", async () => {
    const result = offers({ offers: [OFFER] }, PAGE, PRODUCT)

    expect(result).toStrictEqual([
      {
        id: expect.any(String),
        url: PAGE.url,
        site: PAGE.site,
        product: PRODUCT.id,
        price: OFFER.price,
        currency: OFFER.currency,
        seller: OFFER.seller,
      },
    ])
  })

  it("extracts implicit offer", async () => {
    const result = offers({}, PAGE, PRODUCT)

    expect(result).toStrictEqual([
      {
        id: expect.any(String),
        url: PAGE.url,
        site: PAGE.site,
        product: PRODUCT.id,
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
    const result = offers({ offers: [OFFER, offer2] }, PAGE, PRODUCT)

    expect(result).toStrictEqual([
      {
        id: expect.any(String),
        url: PAGE.url,
        site: PAGE.site,
        product: PRODUCT.id,
        price: OFFER.price,
        currency: OFFER.currency,
        seller: OFFER.seller,
      },
      {
        id: expect.any(String),
        url: PAGE.url,
        site: PAGE.site,
        product: PRODUCT.id,
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
    const result = offers({ offers: [OFFER, offer2] }, PAGE, PRODUCT)

    expect(result.length).toStrictEqual(1)
  })
})
