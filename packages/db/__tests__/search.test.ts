import { randomUUID } from "node:crypto"
import { describe, test, beforeEach } from "vitest"
import { PRODUCT, BRAND, CATEGORY, TAG, dbFixture, OFFER, SITE, SELLER } from "#mocks"

type Fixtures = { db: dbFixture }
const it = test.extend<Fixtures>({
  db: dbFixture,
})

describe.concurrent("search", () => {
  const category2 = {
    name: "another",
  }
  const baseProduct = {
    title: PRODUCT.title,
    images: PRODUCT.images,
    tags: PRODUCT.tags,
  }
  const product1 = {
    ...baseProduct,
    id: randomUUID(),
    embedding: [0, ...PRODUCT.embedding.slice(1)],
    category: PRODUCT.category,
    brand: PRODUCT.brand,
  }
  const product2 = {
    ...baseProduct,
    id: randomUUID(),
    embedding: [1, ...PRODUCT.embedding.slice(1)],
    category: category2.name,
  }
  const baseOffer = {
    site: OFFER.site,
    url: OFFER.url,
  }
  const offer1 = {
    ...baseOffer,
    seller: undefined,
    id: randomUUID(),
    product: product1.id,
    price: OFFER.price - 10,
  }
  const offer2 = {
    ...baseOffer,
    id: randomUUID(),
    product: product2.id,
  }
  beforeEach<Fixtures>(async ({ db }) => {
    await db.load({
      sites: [SITE],
      categories: [CATEGORY, category2],
      tags: [TAG],
      brands: [BRAND],
      products: [product1, product2],
      offers: [offer1, offer2],
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
        price: undefined,
      },
      {
        id: product1.id,
        title: product1.title,
        image: product1.images[0],
        brand: BRAND,
        price: offer1.price,
      },
    ])
  })

  it("ignores products without offers", async ({ expect, db }) => {
    await db.load({ products: [PRODUCT] })

    const results = await db.searchProducts({ embedding: product2.embedding })

    expect(results.length).toBe(2)
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
        price: offer1.price,
      },
    ])
  })

  it("filters by category", async ({ expect, db }) => {
    const result = await db.searchProducts({
      embedding: product2.embedding,
      category: CATEGORY.name,
    })

    expect(result).toStrictEqual([
      {
        id: product1.id,
        title: product1.title,
        image: product1.images[0],
        brand: BRAND,
        price: offer1.price,
      },
    ])
  })

  it("filters by min price", async ({ expect, db }) => {
    await db.load({ products: [PRODUCT], offers: [OFFER], sellers: [SELLER] })

    const result = await db.searchProducts({
      embedding: product2.embedding,
      min: OFFER.price,
    })

    expect(result).toStrictEqual([
      {
        id: PRODUCT.id,
        title: PRODUCT.title,
        image: PRODUCT.images[0],
        brand: BRAND,
        price: OFFER.price,
      },
    ])
  })

  it("filters by max price", async ({ expect, db }) => {
    await db.load({ products: [PRODUCT], offers: [OFFER], sellers: [SELLER] })

    const result = await db.searchProducts({
      embedding: product2.embedding,
      max: offer1.price,
    })

    expect(result).toStrictEqual([
      {
        id: product1.id,
        title: product1.title,
        image: product1.images[0],
        brand: BRAND,
        price: offer1.price,
      },
    ])
  })

  describe.each([null, undefined])("handles %s filters", (value) => {
    it("ignores them", async ({ expect, db }) => {
      const results = await db.searchProducts({
        embedding: product2.embedding,
        category: value,
        brand: value,
        min: value,
        max: value,
      })
  
      expect(results.length).toBe(2)
    })
  })

  it("all filters", async ({ expect, db }) => {
    const act = db.searchProducts({
      embedding: product2.embedding,
      category: CATEGORY.name,
      brand: BRAND.name,
      max: OFFER.price,
      min: offer1.price,
    })

    await expect(act).resolves.not.toThrow()
  })
})
