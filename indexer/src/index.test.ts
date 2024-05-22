import { expect, describe, it, beforeEach, vi } from "vitest"
import { MockPg, PRODUCT, OFFER, BRAND, PAGE, pageWithSchema } from "#mocks"
import {
  BRANDS,
  OFFERS,
  PRODUCTS,
  SELLERS,
  TAGS,
  TRACES,
} from "./Db/index.js"

describe("indexer", () => {
  let pg: MockPg
  beforeEach(async () => {
    vi.resetModules()

    const { MockPg } = await import("#mocks")
    pg = MockPg()
  })

  it("extracts offer details", async () => {
    const page = pageWithSchema({
      "@type": "Product",
      name: PRODUCT.title,
      offers: {
        "@type": "Offer",
        url: "https://example.com/offer",
        price: OFFER.price,
        priceCurrency: OFFER.curency,
        seller: {
          "@type": "Organization",
          name: OFFER.seller,
        },
      },
    })
    pg.query.mockResolvedValueOnce({ rows: [page] })

    await import("./index.js")

    expect(pg).toHaveInserted(SELLERS, [OFFER.seller])
    expect(pg).toHaveInserted(OFFERS, [
      PAGE.site,
      PAGE.url,
      OFFER.price,
      OFFER.curency,
    ])
    expect(pg).toHaveInserted(TRACES, [
      PAGE.id,
      SELLERS.toString(),
      OFFER.seller,
    ])
  })

  it("extracts product brand", async () => {
    const page = pageWithSchema({
      "@type": "Product",
      name: PRODUCT.title,
      brand: {
        "@type": "Brand",
        name: BRAND.name,
        image: BRAND.logo,
      },
    })
    pg.query.mockResolvedValueOnce({ rows: [page] })

    await import("./index.js")

    expect(pg).toHaveInserted(PRODUCTS, [BRAND.name])
    expect(pg).toHaveInserted(BRANDS, [BRAND.name, BRAND.logo])
    expect(pg).toHaveInserted(TRACES, [PAGE.id, BRANDS.toString(), BRAND.name])
  })

  it("extracts multiple tags", async () => {
    const page = pageWithSchema({
      "@type": "Product",
      name: "Test multiple tags",
    })
    pg.query.mockResolvedValueOnce({ rows: [page] })

    await import("./index.js")

    expect(pg).toHaveInserted(TAGS, ["multiple"])
    expect(pg).toHaveInserted(TAGS, ["tags"])
  })
})
