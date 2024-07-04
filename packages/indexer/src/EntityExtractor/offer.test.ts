import { expect, describe, test, beforeEach } from "vitest"
import { PAGE, PRODUCT, SELLER, mockDbFixture } from "@tissai/db/mocks"
import { Db, OFFERS } from "@tissai/db"
import offer from "./offer.js"

type Fixtures = { pg: mockDbFixture }
const it = test.extend<Fixtures>({
  pg: [mockDbFixture as any, { auto: true }],
})

const OFFER = {
  price: 10,
  currency: "EUR",
  seller: "pertemba",
}

describe("offer", () => {
  let db: Db
  beforeEach<Fixtures>(({ pg }) => {
    pg.pool.query.mockResolvedValue({ rows: [] })
    db = Db()
  })

  it("extracts offer", async ({ pg }) => {
    const result = await offer(OFFER, SELLER, PAGE, PRODUCT, db)

    expect(result).toStrictEqual({
      id: expect.any(String),
      url: PAGE.url,
      site: PAGE.site,
      product: PRODUCT.id,
      price: OFFER.price,
      currency: OFFER.currency,
      seller: SELLER.name,
    })
    expect(pg).toHaveInserted(OFFERS, [
      PAGE.url,
      PAGE.site,
      PRODUCT.id,
      OFFER.price,
      OFFER.currency,
      SELLER.name,
    ])
  })

  it("handles offers without sellers", async () => {
    const result = await offer(OFFER , undefined, PAGE, PRODUCT, db)

    expect(result).toStrictEqual({
      id: expect.any(String),
      url: PAGE.url,
      site: PAGE.site,
      product: PRODUCT.id,
      price: OFFER.price,
      currency: OFFER.currency,
      seller: undefined,
    })
  })
})
