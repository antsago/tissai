import { expect, describe, test, beforeEach } from "vitest"
import { PAGE, PRODUCT, mockDbFixture } from "@tissai/db/mocks"
import { Db, OFFERS } from "@tissai/db"
import offers from "./offers.js"

type Fixtures = { pg: mockDbFixture }
const it = test.extend<Fixtures>({
  pg: [mockDbFixture as any, { auto: true }],
})

const OFFER = {
  url: "https://example.com/offer",
  price: 10,
  currency: "EUR",
  seller: "pertemba",
}

describe("offers", () => {
  let db: Db
  beforeEach<Fixtures>(({ pg }) => {
    pg.pool.query.mockResolvedValue({ rows: [] })
    db = Db()
  })

  it("extracts offer", async ({ pg }) => {
    const result = await offers({ offers: [OFFER] }, PAGE, PRODUCT, db)

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
    expect(pg).toHaveInserted(OFFERS, [
      PAGE.url,
      PAGE.site,
      PRODUCT.id,
      OFFER.price,
      OFFER.currency,
      OFFER.seller,
    ])
  })

  it("extracts implicit offer", async ({ pg }) => {
    const result = await offers({}, PAGE, PRODUCT, db)

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
    expect(pg).toHaveInserted(OFFERS, [PAGE.url, PAGE.site, PRODUCT.id])
  })

  it("extracts multiple offers", async ({ pg }) => {
    const offer2 = {
      url: "https://example.com/offer",
      price: 20,
      currency: "USD",
      seller: "batemper",
    }
    const result = await offers({ offers: [OFFER, offer2] }, PAGE, PRODUCT, db)

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
    expect(pg).toHaveInserted(OFFERS, [OFFER.seller])
    expect(pg).toHaveInserted(OFFERS, [offer2.seller])
  })

  it("ignores duplicated offers", async () => {
    const offer2 = {
      id: "something-different",
      ...OFFER,
    }
    const result = await offers({ offers: [OFFER, offer2] }, PAGE, PRODUCT, db)

    expect(result.length).toStrictEqual(1)
  })
})
