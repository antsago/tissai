import { randomUUID } from "node:crypto"
import { describe, test, beforeEach } from "vitest"
import { PRODUCT, BRAND, CATEGORY, TAG, dbFixture } from "#mocks"

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
  beforeEach<Fixtures>(async ({ db }) => {
    await db.load({
      categories: [CATEGORY, category2],
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
      },
    ])
  })

  it("all filters", async ({ expect, db }) => {
    const act = db.searchProducts({
      embedding: product2.embedding,
      category: CATEGORY.name,
      brand: BRAND.name,
    })

    await expect(act).resolves.not.toThrow()
  })
})
