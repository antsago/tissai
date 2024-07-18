import { describe, test, beforeEach, vi, afterEach } from "vitest"
import { BRAND, mockDbFixture } from "@tissai/db/mocks"
import { mockPythonFixture } from "@tissai/python-pool/mocks"
import { PRODUCT, pageWithSchema, mockOraFixture } from "#mocks"
import { OFFERS, PRODUCTS, SELLERS } from "@tissai/db"

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
    mockPython.mockReturnValue({})
    mockDb.pool.query.mockResolvedValue({ rows: [{ count: 1 }] })
  })
  afterEach(() => {
    vi.resetModules()
  })

  it("handles title-only products", async ({
    expect,
    mockDb,
    mockPython,
    mockOra,
  }) => {
    const page = pageWithSchema({
      "@context": "https://schema.org",
      "@type": "Product",
      name: PRODUCT.title,
    })
    mockDb.cursor.read.mockResolvedValueOnce([page])

    await import("./index.js")

    expect(mockDb.pool.end).toHaveBeenCalled()
    expect(mockPython.worker.end).toHaveBeenCalled()
    expect(mockOra.spinner.succeed).toHaveBeenCalled()
  })

  it("processes multiple offers", async ({ expect, mockDb }) => {
    const offer1 = {
      "@type": "Offer",
      price: 10,
      seller: {
        "@type": "Organization",
        name: "pertemba",
      },
    }
    const offer2 = {
      "@type": "Offer",
      price: 20,
      seller: {
        "@type": "Organization",
        name: "batemper",
      },
    }
    const page = pageWithSchema({
      "@context": "https://schema.org",
      "@type": "Product",
      name: PRODUCT.title,
      offers: [offer1, offer2],
    })
    mockDb.cursor.read.mockResolvedValueOnce([page])

    await import("./index.js")

    expect(mockDb).toHaveInserted(OFFERS, [offer1.price])
    expect(mockDb).toHaveInserted(OFFERS, [offer2.price])
    expect(mockDb).toHaveInserted(SELLERS, [offer1.seller.name])
    expect(mockDb).toHaveInserted(SELLERS, [offer2.seller.name])
  })

  it("handles empty pages", async ({ expect, mockDb, mockPython, mockOra }) => {
    const page = pageWithSchema()
    mockDb.cursor.read.mockResolvedValueOnce([page])

    await import("./index.js")

    expect(mockDb.pool.end).toHaveBeenCalled()
    expect(mockPython.worker.end).toHaveBeenCalled()
    expect(mockOra.spinner.succeed).toHaveBeenCalled()
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

  it("handles processsing errors", async ({ expect, mockDb, mockOra, mockPython }) => {
    const error = new Error("Booh!")
    const title2 = "Another product"
    const page = pageWithSchema({
      "@context": "https://schema.org",
      "@type": "Product",
      name: PRODUCT.title,
      brand: {
        "@type": "Brand",
        name: BRAND.name,
      },
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
      if (query.includes("select") && !hasThrown) {
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
