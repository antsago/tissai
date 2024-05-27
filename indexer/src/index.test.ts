import { expect, describe, it, beforeEach, vi } from "vitest"
import {
  MockPg,
  MockPython,
  PRODUCT,
  DERIVED_DATA,
  pageWithSchema,
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
  })

  it("handles title-only products", async () => {
    const page = pageWithSchema({
      "@context": "https://schema.org",
      "@type": "Product",
      name: PRODUCT.title,
    })
    pg.query.mockResolvedValueOnce({ rows: [page] })
    python.mockImplementation(() => DERIVED_DATA)

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
    python.mockImplementation(() => DERIVED_DATA)

    await import("./index.js")

    expect(pg).not.toHaveInserted(PRODUCTS)
    expect(pg).not.toHaveInserted(OFFERS)
    expect(pg).not.toHaveInserted(CATEGORIES)
    expect(pg).not.toHaveInserted(TAGS)
    expect(pg).not.toHaveInserted(SELLERS)
    expect(pg).not.toHaveInserted(BRANDS)
    expect(pg.end).toHaveBeenCalled()
  })
})
