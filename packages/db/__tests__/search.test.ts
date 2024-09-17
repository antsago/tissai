import { randomUUID } from "node:crypto"
import { describe, test, beforeEach } from "vitest"
import {
  PRODUCT,
  BRAND,
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
  const product1 = {
    id: randomUUID(),
    title: "Pantalones ajustados",
    images: PRODUCT.images,
    brand: PRODUCT.brand,
  }
  const product2 = {
    id: randomUUID(),
    title: "Vaqueros prietos",
    images: PRODUCT.images,
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
  }
  const product2Result = {
    id: product2.id,
    title: product2.title,
    image: product2.images[0],
    brand: null,
    price: null,
  }
  const attribute1 = { ...ATTRIBUTE, product: product1.id }
  const attribute2 = {
    id: "3ac16032-426e-4db3-bd71-cb6c2567387c",
    label: ATTRIBUTE.label,
    value: "asdf",
    product: product2.id,
  }
  beforeEach<Fixtures>(async ({ db }) => {
    await db.load({
      sites: [SITE],
      brands: [BRAND],
      products: [product1, product2],
      offers: [offer1, offer2],
      attributes: [attribute1, attribute2],
    })
  })

  describe("products", () => {
    it("retrieves results", async ({ expect, db }) => {
      const result = await db.products.search({ query: product2.title })

      expect(result).toStrictEqual([product2Result, product1Result])
    })

    it("ignores products without offers", async ({ expect, db }) => {
      await db.load({ products: [PRODUCT] })

      const result = await db.products.search({ query: product2.title })

      expect(result.length).toBe(2)
    })

    it("filters by brand", async ({ expect, db }) => {
      const result = await db.products.search({
        query: product2.title,
        brand: BRAND.name,
      })

      expect(result).toStrictEqual([product1Result])
    })

    describe("attributes", () => {
      it("filters by string attribute", async ({ expect, db }) => {
        const result = await db.products.search({
          query: product2.title,
          attributes: { [attribute1.label]: [attribute1.value] },
        })

        expect(result).toStrictEqual([product1Result])
      })

      it("accepts multiple values", async ({ expect, db }) => {
        await db.load({
          products: [PRODUCT],
          offers: [{ ...OFFER, seller: undefined }],
        })

        const result = await db.products.search({
          query: product2.title,
          attributes: {
            [ATTRIBUTE.label]: [attribute2.value, attribute1.value],
          },
        })

        expect(result).toStrictEqual([product2Result, product1Result])
      })
    })

    it("filters by min price", async ({ expect, db }) => {
      await db.load({ products: [PRODUCT], offers: [OFFER], sellers: [SELLER] })

      const result = await db.products.search({
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
        },
      ])
    })

    it("filters by max price", async ({ expect, db }) => {
      await db.load({ products: [PRODUCT], offers: [OFFER], sellers: [SELLER] })

      const result = await db.products.search({
        query: product2.title,
        max: offer1.price,
      })

      expect(result).toStrictEqual([product1Result])
    })

    it("handles empty filters", async ({ expect, db }) => {
      const results = await db.products.search({ query: "" })

      expect(results.length).toBe(2)
    })

    it("handles all filters", async ({ expect, db }) => {
      const act = db.products.search({
        query: product2.title,
        brand: BRAND.name,
        max: OFFER.price,
        min: offer1.price,
        attributes: { [attribute1.label]: [attribute1.value] },
      })

      await expect(act).resolves.not.toThrow()
    })
  })

  it("handles no results found", async ({ expect, db }) => {
    const result = await db.products.search({
      query: product1.title,
      brand: "non-existing",
    })

    expect(result).toStrictEqual([])
  })
})
