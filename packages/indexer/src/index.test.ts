import { describe, test, beforeEach, vi, afterEach } from "vitest"
import { mockDbFixture } from "@tissai/db/mocks"
import { mockPythonFixture } from "@tissai/python-pool/mocks"
import {
  PRODUCT,
  DERIVED_DATA,
  pageWithSchema,
  OFFER,
  mockOraFixture,
} from "#mocks"
import { CATEGORIES, OFFERS, PRODUCTS, SELLERS, TAGS } from "@tissai/db"

type Fixtures = {
  mockDb: mockDbFixture
  mockPython: mockPythonFixture
  mockOra: mockOraFixture
}

const it = test.extend<Fixtures>({
  mockDb: [mockDbFixture as any, { auto: true }],
  mockPython: [mockPythonFixture, { auto: true }],
  mockOra: [mockOraFixture, { auto: true }],
})

describe("index", () => {
  beforeEach<Fixtures>(async ({ mockDb, mockPython }) => {
    mockPython.mockReturnValue(DERIVED_DATA)
    mockDb.pool.query.mockResolvedValue({ rows: [{ count: 1 }] })
  })
  afterEach(() => {
    vi.resetModules()
  })

  it("handles title-only products", async ({ expect, mockDb }) => {
    const page = pageWithSchema({
      "@context": "https://schema.org",
      "@type": "Product",
      name: PRODUCT.title,
    })
    mockDb.cursor.read.mockResolvedValueOnce([page])

    await import("./index.js")

    expect(mockDb).toHaveInserted(PRODUCTS)
    expect(mockDb).toHaveInserted(OFFERS)
    expect(mockDb).toHaveInserted(TAGS)
  })

  it("handles empty pages", async ({ expect, mockDb, mockPython, mockOra }) => {
    const page = pageWithSchema()
    mockDb.cursor.read.mockResolvedValueOnce([page])

    await import("./index.js")

    expect(mockDb).not.toHaveInserted(PRODUCTS)
    expect(mockDb).not.toHaveInserted(OFFERS)
    expect(mockDb).not.toHaveInserted(TAGS)
    expect(mockDb.pool.end).toHaveBeenCalled()
    expect(mockPython.worker.end).toHaveBeenCalled()
    expect(mockOra.spinner.succeed).toHaveBeenCalled()
  })

  it("stores multiple offers, sellers, and tags", async ({
    expect,
    mockDb,
    mockPython,
  }) => {
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
    mockDb.cursor.read.mockResolvedValueOnce([page])
    mockPython.mockReturnValue({ ...DERIVED_DATA, tags })

    await import("./index.js")

    expect(mockDb).toHaveInserted(OFFERS, [OFFER.seller])
    expect(mockDb).toHaveInserted(OFFERS, [seller2])
    expect(mockDb).toHaveInserted(TAGS, [tags[0]])
    expect(mockDb).toHaveInserted(TAGS, [tags[1]])
  })

  it("processes multiple pages", async ({ expect, mockDb }) => {
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
    mockDb.cursor.read.mockResolvedValueOnce([page])
    mockDb.cursor.read.mockResolvedValueOnce([page2])

    await import("./index.js")

    expect(mockDb).toHaveInserted(PRODUCTS, [PRODUCT.title])
    expect(mockDb).toHaveInserted(PRODUCTS, [title2])
  })

  it("handles processsing errors", async ({ expect, mockDb, mockOra }) => {
    const error = new Error("Booh!")
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
    mockDb.cursor.read.mockResolvedValueOnce([page])
    mockDb.cursor.read.mockResolvedValueOnce([page2])
    let hasThrown = false
    mockDb.pool.query.mockImplementation((query) => {
      if (query.includes("INSERT") && !hasThrown) {
        hasThrown = true
        throw error
      }
      return Promise.resolve({ rows: [{ count: 2 }] })
    })

    await import("./index.js")

    expect(mockDb).not.toHaveInserted(PRODUCTS, [PRODUCT.title])
    expect(mockDb).toHaveInserted(PRODUCTS, [title2])
    expect(mockOra.spinner.prefixText).toContain(error.message)
  })

  it("handles fatal errors", async ({
    expect,
    mockDb,
    mockPython,
    mockOra,
  }) => {
    const error = new Error("Booh!")
    mockDb.pool.query.mockRejectedValue(error)

    await import("./index.js")

    expect(mockOra.spinner.fail).toHaveBeenCalledWith(
      expect.stringContaining(error.message),
    )
    expect(mockDb.pool.end).toHaveBeenCalled()
    expect(mockPython.worker.end).toHaveBeenCalled()
  })

  it("reports processed pages", async ({ expect, mockDb, mockOra }) => {
    const page = pageWithSchema({
      "@context": "https://schema.org",
      "@type": "Product",
      name: PRODUCT.title,
    })
    mockDb.cursor.read.mockResolvedValueOnce([page])

    await import("./index.js")

    expect(mockOra.spinner.text).toContain(page.id)
  })

  it("initializes db", async ({ expect, mockDb }) => {
    mockDb.cursor.read.mockResolvedValueOnce([])

    await import("./index.js")

    expect(mockDb.pool.query).toHaveBeenCalledWith(
      expect.stringContaining("CREATE TABLE"),
      undefined,
    )
  })
})
