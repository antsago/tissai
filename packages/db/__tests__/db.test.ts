import { randomUUID } from "node:crypto"
import { describe, test } from "vitest"
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

const it = test.extend<{ db: dbFixture }>({
  db: dbFixture
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

  it("searches products", async ({ expect, db }) => {
    await Promise.all([db.categories.create(CATEGORY), db.tags.create(TAG), db.brands.create(BRAND)])
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
    await Promise.all([
      db.products.create(product1),
      db.products.create(product2),
    ])

    const result = await db.searchProducts(product2.embedding)

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

  it("gets product details", async ({ expect, db }) => {
    await Promise.all([
      db.categories.create(CATEGORY),
      db.tags.create(TAG),
      db.brands.create(BRAND),
      db.sites.create(SITE),
      db.sellers.create(SELLER),
    ])
    const SIMILAR = {
      id: "92b15b90-3673-4a0e-b57c-8f9835a4f4d9",
      title: PRODUCT.title,
      images: PRODUCT.images,
      category: PRODUCT.category,
      tags: PRODUCT.tags,
      embedding: [0, ...PRODUCT.embedding.slice(1)],
    }
    await Promise.all([
      db.products.create(SIMILAR),
      db.products.create(PRODUCT),
    ])
    await Promise.all([
      db.offers.create(OFFER),
      db.offers.create({
        ...OFFER,
        id: "3931b158-a7d2-41d5-9b13-7266fe976a2a",
      }),
    ])

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
