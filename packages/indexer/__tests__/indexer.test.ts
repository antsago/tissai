import { describe, test, beforeEach, afterEach, vi } from "vitest"
import { PRODUCTS, OFFERS, CATEGORIES, TAGS, SELLERS, BRANDS } from "@tissai/db"
import { dbFixture } from "@tissai/db/mocks"
import {
  PRODUCT,
  DERIVED_DATA,
  SITE,
  PAGE,
  pageWithSchema,
  OFFER,
  BRAND,
  mockOraFixture,
} from "#mocks"

const it = test.extend<{ db: dbFixture; ora: mockOraFixture }>({
  db: dbFixture as any,
  ora: [mockOraFixture, { auto: true }], // silence console
})

const FULL_SCHEMA = {
  "@context": "https://schema.org/",
  "@type": "Product",
  name: PRODUCT.title,
  description: PRODUCT.description,
  image: PRODUCT.images[0],
  brand: {
    "@type": "Brand",
    name: BRAND.name,
    image: BRAND.logo,
  },
  offers: {
    "@type": "Offer",
    url: "https://example.com/offer",
    price: OFFER.price,
    priceCurrency: OFFER.currency,
    seller: {
      "@type": "Organization",
      name: OFFER.seller,
    },
  },
}

describe("indexer", () => {
  beforeEach<{ db: dbFixture }>(({ db }) => {
    vi.stubEnv("PG_DATABASE", db.name)
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it("extracts and stores page entities", async ({ expect, db }) => {
    await db.load({
      sites: [SITE],
      pages: [pageWithSchema(FULL_SCHEMA)],
    })

    await import("../src/index.js")

    const products = await db.products.getAll()
    expect(products).toStrictEqual([
      {
        id: expect.any(String),
        title: PRODUCT.title,
        description: PRODUCT.description,
        images: [PRODUCT.images[0]],
        embedding: PRODUCT.embedding,
        category: DERIVED_DATA.category,
        tags: DERIVED_DATA.tags,
        brand: BRAND.name,
      },
    ])
    const offers = await db.offers.getAll()
    expect(offers).toStrictEqual([
      {
        id: expect.any(String),
        product: products[0].id,
        site: PAGE.site,
        url: PAGE.url,
        seller: OFFER.seller,
        price: OFFER.price,
        currency: OFFER.currency,
      },
    ])
    const categories = await db.categories.getAll()
    expect(categories).toStrictEqual([{ name: DERIVED_DATA.category }])
    const tags = await db.tags.getAll()
    expect(tags).toStrictEqual([{ name: DERIVED_DATA.tags[0] }])
    const brands = await db.brands.getAll()
    expect(brands).toStrictEqual([{ name: BRAND.name, logo: BRAND.logo }])
    const sellers = await db.sellers.getAll()
    expect(sellers).toStrictEqual([{ name: OFFER.seller }])
    const traces = await db.traces.getAll()
    expect(traces).toStrictEqual(
      expect.arrayContaining([
        {
          id: expect.any(String),
          pageId: PAGE.id,
          objectTable: PRODUCTS.toString(),
          objectId: products[0].id,
          timestamp: expect.any(Date),
        },
        {
          id: expect.any(String),
          pageId: PAGE.id,
          objectTable: OFFERS.toString(),
          objectId: offers[0].id,
          timestamp: expect.any(Date),
        },
        {
          id: expect.any(String),
          pageId: PAGE.id,
          objectTable: CATEGORIES.toString(),
          objectId: categories[0].name,
          timestamp: expect.any(Date),
        },
        {
          id: expect.any(String),
          pageId: PAGE.id,
          objectTable: TAGS.toString(),
          objectId: tags[0].name,
          timestamp: expect.any(Date),
        },
        {
          id: expect.any(String),
          pageId: PAGE.id,
          objectTable: BRANDS.toString(),
          objectId: brands[0].name,
          timestamp: expect.any(Date),
        },
        {
          id: expect.any(String),
          pageId: PAGE.id,
          objectTable: SELLERS.toString(),
          objectId: sellers[0].name,
          timestamp: expect.any(Date),
        },
      ]),
    )
  })

  it("handles duplicates", async ({ expect, db }) => {
    await db.load({
      sites: [SITE],
      pages: [pageWithSchema(FULL_SCHEMA)],
      categories: [{ name: DERIVED_DATA.category }],
      tags: [{ name: DERIVED_DATA.tags[0] }],
      sellers: [{ name: OFFER.seller }],
      brands: [{ name: BRAND.name }],
    })

    await import("../src/index.js")

    const products = await db.products.getAll()
    expect(products.length).toBe(1)
    const offers = await db.offers.getAll()
    expect(offers.length).toBe(1)
    const categories = await db.categories.getAll()
    expect(categories.length).toBe(1)
    const tags = await db.tags.getAll()
    expect(tags.length).toBe(1)
    const brands = await db.brands.getAll()
    expect(brands.length).toBe(1)
    const sellers = await db.sellers.getAll()
    expect(sellers.length).toBe(1)
    const traces = await db.traces.getAll()
    expect(traces.length).toBe(6)
  })
})
