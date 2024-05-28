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

vi.spyOn(global.console, "error").mockImplementation(() => {})

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
    pg.cursor.read.mockResolvedValueOnce([page])

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
    pg.cursor.read.mockResolvedValueOnce([page])

    await import("./index.js")

    expect(pg).not.toHaveInserted(PRODUCTS)
    expect(pg).not.toHaveInserted(OFFERS)
    expect(pg).not.toHaveInserted(CATEGORIES)
    expect(pg).not.toHaveInserted(TAGS)
    expect(pg).not.toHaveInserted(SELLERS)
    expect(pg).not.toHaveInserted(BRANDS)
    expect(pg.pool.end).toHaveBeenCalled()
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
    pg.cursor.read.mockResolvedValueOnce([page])
    python.mockReturnValue({ ...DERIVED_DATA, tags })

    await import("./index.js")

    expect(pg).toHaveInserted(OFFERS, [OFFER.seller])
    expect(pg).toHaveInserted(OFFERS, [seller2])
    expect(pg).toHaveInserted(SELLERS, [OFFER.seller])
    expect(pg).toHaveInserted(SELLERS, [seller2])
    expect(pg).toHaveInserted(TAGS, [tags[0]])
    expect(pg).toHaveInserted(TAGS, [tags[1]])
  })

  it("processes multiple pages", async () => {
    const page = pageWithSchema({
      "@context": "https://schema.org",
      "@type": "Product",
      name: PRODUCT.title,
    })
    const title2 = "Another product"
    const page2 = {
      ...pageWithSchema({
        "@context": "https://schema.org",
        "@type": "Product",
        name: title2,
      }),
      id: "d861c3c5-5206-4347-b2ec-6f1ca94fca2f",
      url: "page/2",
    }
    pg.cursor.read.mockResolvedValueOnce([page])
    pg.cursor.read.mockResolvedValueOnce([page2])

    await import("./index.js")

    expect(pg).toHaveInserted(PRODUCTS, [PRODUCT.title])
    expect(pg).toHaveInserted(PRODUCTS, [title2])
  })

  it("handles processsing errors", async () => {
    const error = new Error('Booh!')
    const title2 = "Another product"
    const page = pageWithSchema({
      "@context": "https://schema.org",
      "@type": "Product",
      name: PRODUCT.title,
    })
    const page2 = pageWithSchema({
      "@context": "https://schema.org",
      "@type": "Product",
      name: title2,
    })
    pg.cursor.read.mockResolvedValueOnce([page])
    pg.cursor.read.mockResolvedValueOnce([page2])
    pg.pool.query.mockRejectedValueOnce(error)

    await import("./index.js")

    expect(pg).not.toHaveInserted(PRODUCTS, [PRODUCT.title])
    expect(pg).toHaveInserted(PRODUCTS, [title2])
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining(error.message))
  })

  it("handles fatal errors", async () => {
    const error = new Error('Booh!')
    python.PythonShell.mockImplementation(() => { throw error })

    const act = import("./index.js")

    await expect(act).rejects.toThrow(error)
    expect(pg.pool.end).toHaveBeenCalled()
  })
})
