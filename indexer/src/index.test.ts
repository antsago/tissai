import { expect, describe, it, beforeEach, vi } from "vitest"
import {
  MockPg,
  MockPython,
  PRODUCT,
  DERIVED_DATA,
  pageWithSchema,
  OFFER,
} from "#mocks"
import {
  BRANDS,
  CATEGORIES,
  OFFERS,
  PRODUCTS,
  SELLERS,
  TAGS,
} from "./Db/index.js"

describe("index", () => {
  let pg: MockPg
  let python: MockPython
  beforeEach(async () => {
    vi.resetModules()

    const { MockPg, MockPython } = await import("#mocks")
    pg = MockPg()
    python = MockPython()
    python.mockReturnValue(DERIVED_DATA)
  })

  it("handles title-only products", async () => {
    const page = pageWithSchema({
      "@context": "https://schema.org",
      "@type": "Product",
      name: PRODUCT.title,
    })
    pg.query.mockResolvedValueOnce({ rows: [page] })

    await import("./index.js")

    expect(pg).toHaveInserted(PRODUCTS)
    expect(pg).toHaveInserted(OFFERS)
    expect(pg).toHaveInserted(CATEGORIES)
    expect(pg).toHaveInserted(TAGS)
    expect(pg).not.toHaveInserted(SELLERS)
    expect(pg).not.toHaveInserted(BRANDS)
  })

  it("handles empty pages", async () => {
    const page = pageWithSchema()
    pg.query.mockResolvedValueOnce({ rows: [page] })

    await import("./index.js")

    expect(pg).not.toHaveInserted(PRODUCTS)
    expect(pg).not.toHaveInserted(OFFERS)
    expect(pg).not.toHaveInserted(CATEGORIES)
    expect(pg).not.toHaveInserted(TAGS)
    expect(pg).not.toHaveInserted(SELLERS)
    expect(pg).not.toHaveInserted(BRANDS)
    expect(pg.end).toHaveBeenCalled()
  })

  it("stores multiple offers, sellers, and tags", async () => {
    const seller2 = `${OFFER.seller} 2`
    const tags = ["tag1", "tag2"]
    const page = pageWithSchema({
        "@context": "https://schema.org/",
        "@type": "Product",
        name: PRODUCT.title,
        offers: [
          {
            "@type": "Offer",
            seller: {
              "@type": "Organization",
              name: OFFER.seller,
            },
          },
          {
            "@type": "Offer",
            seller: {
              "@type": "Organization",
              name: seller2,
            },
          },
        ],
      })
    pg.query.mockResolvedValueOnce({ rows: [page] })
    python.mockReturnValue({ ...DERIVED_DATA, tags })

    await import("./index.js")

    expect(pg).toHaveInserted(OFFERS, [OFFER.seller])
    expect(pg).toHaveInserted(OFFERS, [seller2])
    expect(pg).toHaveInserted(SELLERS, [OFFER.seller])
    expect(pg).toHaveInserted(SELLERS, [seller2])
    expect(pg).toHaveInserted(TAGS, [tags[0]])
    expect(pg).toHaveInserted(TAGS, [tags[1]])
  })
})
