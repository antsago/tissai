import { randomUUID } from "node:crypto"
import { describe, test, beforeEach } from "vitest"
import {
  PRODUCT,
  BRAND,
  CATEGORY,
  TAG,
  dbFixture,
  OFFER,
  SITE,
  SELLER,
  ATTRIBUTE,
} from "#mocks"

type Fixtures = { db: dbFixture }
const it = test.extend<Fixtures>({
  db: dbFixture,
})

describe.concurrent("search", () => {
  const category2 = { name: "anothercategory" }
  const tag2 = { name: "anothertag" }
  const product1 = {
    id: randomUUID(),
    title: "Pantalones ajustados",
    images: PRODUCT.images,
    category: PRODUCT.category,
    brand: PRODUCT.brand,
    tags: [TAG.name, tag2.name],
  }
  const product2 = {
    id: randomUUID(),
    title: "Vaqueros prietos",
    images: PRODUCT.images,
    category: category2.name,
    tags: [tag2.name],
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
  const product1Result = {
    id: product1.id,
    title: product1.title,
    image: product1.images[0],
    brand: BRAND,
    price: offer1.price,
    attributes: [{ label: ATTRIBUTE.label, value: ATTRIBUTE.value }],
  }
  beforeEach<Fixtures>(async ({ db }) => {
    await db.load({
      sites: [SITE],
      categories: [CATEGORY, category2],
      tags: [TAG],
      brands: [BRAND],
      products: [product1, product2],
      offers: [offer1, offer2],
      attributes: [{ ...ATTRIBUTE, product: product1.id }],
    })
  })

  it("retrieves results", async ({ expect, db }) => {
    const result = await db.searchProducts({ query: product2.title })

    expect(result).toStrictEqual([
      {
        id: product2.id,
        title: product2.title,
        image: product2.images[0],
        brand: null,
        price: undefined,
        attributes: [],
      },
      product1Result,
    ])
  })

  it("ignores products without offers", async ({ expect, db }) => {
    await db.load({ products: [PRODUCT] })

    const result = await db.searchProducts({ query: product2.title })

    expect(result.length).toBe(2)
  })

  it("filters by brand", async ({ expect, db }) => {
    const result = await db.searchProducts({
      query: product2.title,
      brand: BRAND.name,
    })

    expect(result).toStrictEqual([product1Result])
  })

  it("filters by category", async ({ expect, db }) => {
    const result = await db.searchProducts({
      query: product2.title,
      category: CATEGORY.name,
    })

    expect(result).toStrictEqual([product1Result])
  })

  describe("attributes", () => {
    it("filters by string attribute", async ({ expect, db }) => {
      const result = await db.searchProducts({
        query: product2.title,
        attributes: { [ATTRIBUTE.label]: [ATTRIBUTE.value] },
      })

      expect(result).toStrictEqual([product1Result])
    })

    it("accepts multiple values", async ({ expect, db }) => {
      const OTHER_ATTRIBUTE = {
        id: randomUUID(),
        label: ATTRIBUTE.label,
        value: "asdf",
        product: PRODUCT.id,
      }
      await db.load({
        products: [PRODUCT],
        offers: [{ ...OFFER, seller: undefined }],
        attributes: [OTHER_ATTRIBUTE],
      })

      const result = await db.searchProducts({
        query: PRODUCT.title,
        attributes: {
          [ATTRIBUTE.label]: [OTHER_ATTRIBUTE.value, ATTRIBUTE.value],
        },
      })

      expect(result).toStrictEqual([
        {
          id: PRODUCT.id,
          title: PRODUCT.title,
          image: PRODUCT.images[0],
          brand: BRAND,
          price: OFFER.price,
          attributes: [
            {
              label: OTHER_ATTRIBUTE.label,
              value: OTHER_ATTRIBUTE.value,
            },
          ],
        },
        product1Result,
      ])
    })
  })

  it("filters by tag", async ({ expect, db }) => {
    const result = await db.searchProducts({
      query: product2.title,
      tags: [TAG.name],
    })

    expect(result).toStrictEqual([product1Result])
  })

  it("requires all tags", async ({ expect, db }) => {
    const result = await db.searchProducts({
      query: product2.title,
      tags: [TAG.name, tag2.name],
    })

    expect(result).toStrictEqual([product1Result])
  })

  it("filters by min price", async ({ expect, db }) => {
    await db.load({ products: [PRODUCT], offers: [OFFER], sellers: [SELLER] })

    const result = await db.searchProducts({
      query: product2.title,
      min: OFFER.price,
    })

    expect(result).toStrictEqual([
      {
        id: PRODUCT.id,
        title: PRODUCT.title,
        image: PRODUCT.images[0],
        brand: BRAND,
        price: OFFER.price,
        attributes: [],
      },
    ])
  })

  it("filters by max price", async ({ expect, db }) => {
    await db.load({ products: [PRODUCT], offers: [OFFER], sellers: [SELLER] })

    const result = await db.searchProducts({
      query: product2.title,
      max: offer1.price,
    })

    expect(result).toStrictEqual([product1Result])
  })

  it("handles empty filters", async ({ expect, db }) => {
    const results = await db.searchProducts({ query: "" })

    expect(results.length).toBe(2)
  })

  it("handles all filters", async ({ expect, db }) => {
    const act = db.searchProducts({
      query: product2.title,
      category: CATEGORY.name,
      brand: BRAND.name,
      max: OFFER.price,
      min: offer1.price,
      tags: [TAG.name],
      attributes: { [ATTRIBUTE.label]: [ATTRIBUTE.value] },
    })

    await expect(act).resolves.not.toThrow()
  })
})
