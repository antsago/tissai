import { randomUUID } from "node:crypto"
import { describe, test, beforeEach } from "vitest"
import {
  PRODUCT,
  SITE,
  PAGE,
  OFFER,
  BRAND,
  CATEGORY,
  TAG,
  SELLER,
  dbFixture,
} from "#mocks"
import { PRODUCTS } from "../src/index.js"

type Fixtures = { db: dbFixture }
const it = test.extend<Fixtures>({
  db: dbFixture,
})

describe.concurrent("db", () => {
  it("creates entities", async ({ expect, db }) => {
    await db.sites.create(SITE)
    await db.pages.create(PAGE)
    await db.categories.create(CATEGORY)
    await db.tags.create(TAG)
    await db.sellers.create(SELLER)
    await db.brands.create(BRAND)
    await db.products.create(PRODUCT)
    await db.offers.create(OFFER)
    await db.traces.create(PAGE.id, PRODUCTS.toString(), PRODUCT.id)

    const products = await db.products.getAll()
    const offers = await db.offers.getAll()
    const categories = await db.categories.getAll()
    const tags = await db.tags.getAll()
    const brands = await db.brands.getAll()
    const sellers = await db.sellers.getAll()
    const traces = await db.traces.getAll()

    expect(products).toStrictEqual([PRODUCT])
    expect(offers).toStrictEqual([OFFER])
    expect(categories).toStrictEqual([CATEGORY])
    expect(tags).toStrictEqual([TAG])
    expect(brands).toStrictEqual([BRAND])
    expect(sellers).toStrictEqual([SELLER])
    expect(traces).toStrictEqual([
      {
        id: expect.any(String),
        timestamp: expect.any(Date),
        pageId: PAGE.id,
        objectTable: PRODUCTS.toString(),
        objectId: PRODUCT.id,
      },
    ])
  })

  describe("search", () => {
    const baseProduct = {
      title: PRODUCT.title,
      images: PRODUCT.images,
      category: PRODUCT.category,
      tags: PRODUCT.tags,
    }
    const product1 = {
      ...baseProduct,
      id: randomUUID(),
      embedding: [0, ...PRODUCT.embedding.slice(1)],
      brand: PRODUCT.brand,
    }
    const product2 = {
      ...baseProduct,
      id: randomUUID(),
      embedding: [1, ...PRODUCT.embedding.slice(1)],
    }
    beforeEach<Fixtures>(async ({ db }) => {
      await db.load({
        categories: [CATEGORY],
        tags: [TAG],
        brands: [BRAND],
        products: [product1, product2],
      })
    })

    it("retrieves results", async ({ expect, db }) => {
      const result = await db.searchProducts({ embedding: product2.embedding })
  
      expect(result).toStrictEqual([
        {
          id: product2.id,
          title: product2.title,
          image: product2.images[0],
          brand: undefined,
        },
        {
          id: product1.id,
          title: product1.title,
          image: product1.images[0],
          brand: BRAND,
        },
      ])
    })
  
    it("filters by brand", async ({ expect, db }) => {
      const result = await db.searchProducts({
        embedding: product2.embedding,
        brand: BRAND.name,
      })
  
      expect(result).toStrictEqual([
        {
          id: product1.id,
          title: product1.title,
          image: product1.images[0],
          brand: BRAND,
        },
      ])
    })
  })

  it("gets product details", async ({ expect, db }) => {
    const SIMILAR = {
      id: "92b15b90-3673-4a0e-b57c-8f9835a4f4d9",
      title: PRODUCT.title,
      images: PRODUCT.images,
      category: PRODUCT.category,
      tags: PRODUCT.tags,
      embedding: [0, ...PRODUCT.embedding.slice(1)],
    }
    await db.load({
      categories: [CATEGORY],
      tags: [TAG],
      brands: [BRAND],
      sites: [SITE],
      sellers: [SELLER],
      products: [SIMILAR, PRODUCT],
      offers: [OFFER, { ...OFFER, id: "3931b158-a7d2-41d5-9b13-7266fe976a2a" }],
    })

    const result = await db.getProductDetails(PRODUCT.id)

    expect(result).toStrictEqual({
      title: PRODUCT.title,
      description: PRODUCT.description,
      images: PRODUCT.images,
      category: PRODUCT.category,
      tags: PRODUCT.tags,
      brand: BRAND,
      similar: [
        {
          id: SIMILAR.id,
          title: SIMILAR.title,
          image: SIMILAR.images[0],
        },
      ],
      offers: [
        {
          url: OFFER.url,
          price: OFFER.price,
          currency: OFFER.currency,
          seller: OFFER.seller,
          site: {
            name: SITE.name,
            icon: SITE.icon,
          },
        },
        {
          url: OFFER.url,
          price: OFFER.price,
          currency: OFFER.currency,
          seller: OFFER.seller,
          site: {
            name: SITE.name,
            icon: SITE.icon,
          },
        },
      ],
    })
  })
})
