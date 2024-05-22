import { expect, describe, it, beforeEach, vi } from "vitest"
import { MockPg, PRODUCT, pageWithSchema } from "#mocks"
import {
  BRANDS,
  CATEGORIES,
  OFFERS,
  PRODUCTS,
  SELLERS,
  TAGS,
} from "./Db/index.js"

describe("indexer", () => {
  let pg: MockPg
  beforeEach(async () => {
    vi.resetModules()

    const { MockPg } = await import("#mocks")
    pg = MockPg()
  })

  it("handles title-only products", async () => {
    const page = pageWithSchema({
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
})
