import { describe, test, beforeEach, afterEach, vi } from "vitest"
import { dbFixture } from "@tissai/db/mocks"
import {
  PRODUCT,
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

describe(
  "indexer",
  () => {
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
      const brands = await db.brands.getAll()
      expect(brands).toStrictEqual([{ name: BRAND.name, logo: BRAND.logo }])
      const sellers = await db.sellers.getAll()
      expect(sellers).toStrictEqual([{ name: OFFER.seller }])
      const attributes = await db.attributes.getAll()
      expect(attributes).toStrictEqual(
        expect.arrayContaining([
          {
            id: expect.any(String),
            product: products[0].id,
            label: "categoría",
            value: "Vaqueros",
          },
          {
            id: expect.any(String),
            product: products[0].id,
            label: "modelo",
            value: "ajustados",
          },
        ]),
      )
    })

    it("handles duplicates", async ({ expect, db }) => {
      await db.load({
        sites: [SITE],
        pages: [pageWithSchema(FULL_SCHEMA)],
        sellers: [{ name: OFFER.seller }],
        brands: [{ name: BRAND.name }],
      })

      await import("../src/index.js")

      const products = await db.products.getAll()
      expect(products.length).toBe(1)
      const offers = await db.offers.getAll()
      expect(offers.length).toBe(1)
      const brands = await db.brands.getAll()
      expect(brands.length).toBe(1)
      const sellers = await db.sellers.getAll()
      expect(sellers.length).toBe(1)
    })
  },
  { timeout: 60000 },
)
