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
      const result = await db.searchProducts({ query: product2.title })

      expect(result.products).toStrictEqual([product2Result, product1Result])
    })

    it("ignores products without offers", async ({ expect, db }) => {
      await db.load({ products: [PRODUCT] })

      const result = await db.searchProducts({ query: product2.title })

      expect(result.products.length).toBe(2)
    })

    it("filters by brand", async ({ expect, db }) => {
      const result = await db.searchProducts({
        query: product2.title,
        brand: BRAND.name,
      })

      expect(result.products).toStrictEqual([product1Result])
    })

    describe("attributes", () => {
      it("filters by string attribute", async ({ expect, db }) => {
        const result = await db.searchProducts({
          query: product2.title,
          attributes: { [attribute1.label]: [attribute1.value] },
        })

        expect(result.products).toStrictEqual([product1Result])
      })

      it("accepts multiple values", async ({ expect, db }) => {
        await db.load({
          products: [PRODUCT],
          offers: [{ ...OFFER, seller: undefined }],
        })

        const result = await db.searchProducts({
          query: product2.title,
          attributes: {
            [ATTRIBUTE.label]: [attribute2.value, attribute1.value],
          },
        })

        expect(result.products).toStrictEqual([product2Result, product1Result])
      })
    })

    it("filters by min price", async ({ expect, db }) => {
      await db.load({ products: [PRODUCT], offers: [OFFER], sellers: [SELLER] })

      const result = await db.searchProducts({
        query: product2.title,
        min: OFFER.price,
      })

      expect(result.products).toStrictEqual([
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
        query: product2.title,
        max: offer1.price,
      })

      expect(result.products).toStrictEqual([product1Result])
    })

    it("handles empty filters", async ({ expect, db }) => {
      const results = await db.searchProducts({ query: "" })

      expect(results.products.length).toBe(2)
    })

    it("handles all filters", async ({ expect, db }) => {
      const act = db.searchProducts({
        query: product2.title,
        brand: BRAND.name,
        max: OFFER.price,
        min: offer1.price,
        attributes: { [attribute1.label]: [attribute1.value] },
      })

      await expect(act).resolves.not.toThrow()
    })
  })

  describe("suggestions", () => {
    it("retrieves suggestions", async ({ expect, db }) => {
      const result = await db.searchProducts({ query: product2.title })

      expect(result.suggestions).toStrictEqual([
        {
          label: attribute1.label,
          frequency: 1,
          values: [attribute2.value, attribute1.value],
        },
      ])
    })

    it("includes values from other attributes", async ({ expect, db }) => {
      const result = await db.searchProducts({
        query: product1.title,
        brand: product1.brand,
      })

      expect(result.suggestions).toStrictEqual([
        {
          label: attribute1.label,
          frequency: 1,
          values: [attribute2.value, attribute1.value],
        },
      ])
    })

    it("only returns most frequent attributes", async ({ expect, db }) => {
      await db.load({
        attributes: [
          {
            id: "e62d7696-945f-4d1a-9486-3429b6e1df77",
            label: "label1",
            value: "value1",
            product: product1.id,
          },
          {
            id: "f6706010-9307-4972-aac3-1590a67d2383",
            label: "label2",
            value: "value2",
            product: product1.id,
          },
          {
            id: "03676c45-4715-4552-a054-6690b2196a10",
            label: "label3",
            value: "value3",
            product: product1.id,
          },
          {
            id: "b16108a4-cfb2-417b-a02b-3dc36219550c",
            label: "label4",
            value: "value4",
            product: product1.id,
          },
        ],
      })

      const result = await db.searchProducts({
        query: product1.title,
      })

      expect(result.suggestions).toHaveLength(4)
      expect(result.suggestions[0]).toStrictEqual({
        label: attribute1.label,
        frequency: 1,
        values: [attribute2.value, attribute1.value],
      })
    })

    it("calculates frequency", async ({ expect, db }) => {
      await db.load({ products: [PRODUCT], offers: [OFFER], sellers: [SELLER] })

      const result = await db.searchProducts({
        query: product1.title,
        brand: product1.brand,
      })

      expect(result.suggestions).toStrictEqual([
        {
          label: attribute1.label,
          frequency: 0.5,
          values: [attribute2.value, attribute1.value],
        },
      ])
    })

    it("sorts by frequency", async ({ expect, db }) => {
      const otherAttribute = {
        id: "d50bc19c-14a6-4edd-890f-aab73fe6ce7f",
        label: "foo",
        value: "bar",
        product: product1.id,
      }

      await db.load({ attributes: [otherAttribute] })

      const result = await db.searchProducts({ query: product1.title })

      expect(result.suggestions).toStrictEqual([
        {
          label: attribute1.label,
          frequency: 1,
          values: [attribute2.value, attribute1.value],
        },
        {
          label: otherAttribute.label,
          frequency: 0.5,
          values: [otherAttribute.value],
        },
      ])
    })

    it("ignores attributes not on returned products", async ({
      expect,
      db,
    }) => {
      const otherAttribute = {
        id: "d50bc19c-14a6-4edd-890f-aab73fe6ce7f",
        label: "foo",
        value: "bar",
        product: PRODUCT.id,
      }
      await db.load({ products: [PRODUCT], attributes: [otherAttribute] })

      const result = await db.searchProducts({ query: product1.title })

      expect(result.suggestions).toStrictEqual([
        {
          label: attribute1.label,
          frequency: 1,
          values: [attribute2.value, attribute1.value],
        },
      ])
    })
  })

  it("handles no results found", async ({ expect, db }) => {
    const result = await db.searchProducts({
      query: product1.title,
      brand: "non-existing",
    })

    expect(result).toStrictEqual({
      products: [],
      suggestions: [],
    })
  })
})
