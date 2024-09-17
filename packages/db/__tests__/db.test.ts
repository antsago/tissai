import { describe, test, beforeEach } from "vitest"
import {
  PRODUCT,
  SITE,
  PAGE,
  OFFER,
  BRAND,
  SELLER,
  ATTRIBUTE,
  dbFixture,
  SCHEMA,
} from "#mocks"
import { CATEGORY_LABEL } from "../src"

type Fixtures = { db: dbFixture }
const it = test.extend<Fixtures>({
  db: dbFixture,
})

describe.concurrent("db", () => {
  it("creates entities", async ({ expect, db }) => {
    await db.sites.create(SITE)
    await db.pages.create(PAGE)
    await db.sellers.create(SELLER)
    await db.brands.create(BRAND)
    await db.products.create(PRODUCT)
    await db.offers.create(OFFER)
    await db.attributes.create(ATTRIBUTE)
    await db.schemas.create(SCHEMA)

    const products = await db.products.getAll()
    const offers = await db.offers.getAll()
    const brands = await db.brands.getAll()
    const sellers = await db.sellers.getAll()
    const attributes = await db.attributes.getAll()
    const schemas = await db.schemas.getAll()

    expect(products).toStrictEqual([PRODUCT])
    expect(offers).toStrictEqual([OFFER])
    expect(brands).toStrictEqual([BRAND])
    expect(sellers).toStrictEqual([SELLER])
    expect(attributes).toStrictEqual([ATTRIBUTE])
    expect(schemas).toStrictEqual([SCHEMA])
  })

  describe("suggestions", () => {
    const SCHEMA = {
      category: "category1",
      label: CATEGORY_LABEL,
      value: "word1",
      tally: 2,
    }

    beforeEach<Fixtures>(async ({ db }) => {
      await db.load({ schemas: [SCHEMA] })
    })

    it("suggests most likely categories", async ({ expect, db }) => {
      const irrelevantWord = "Non-relevant-word"
      const otherCategory = "category2"
      await db.load({
        schemas: [
          {
            category: otherCategory,
            label: CATEGORY_LABEL,
            value: SCHEMA.value,
            tally: 4,
          },
        ],
      })

      const suggestions = await db.suggestions.category([
        SCHEMA.value,
        irrelevantWord,
      ])

      expect(suggestions).toStrictEqual({
        label: CATEGORY_LABEL,
        values: [otherCategory, SCHEMA.category],
      })
    })

    it("discounts word frequency", async ({ expect, db }) => {
      const otherCategory = "category2"
      const otherWord = "word2"
      await db.load({
        schemas: [
          {
            category: otherCategory,
            label: CATEGORY_LABEL,
            value: otherWord,
            tally: 4,
          },
          {
            category: otherCategory,
            label: "fodder",
            value: otherWord,
            tally: 4,
          },
        ],
      })

      const suggestions = await db.suggestions.category([
        SCHEMA.value,
        otherWord,
      ])

      expect(suggestions).toStrictEqual({
        label: CATEGORY_LABEL,
        values: [SCHEMA.category, otherCategory],
      })
    })

    it("only considers most likely word per category", async ({
      expect,
      db,
    }) => {
      const otherCategory = "category2"
      const otherWord = "word2"
      await db.load({
        schemas: [
          {
            category: otherCategory,
            label: CATEGORY_LABEL,
            value: SCHEMA.value,
            tally: 5,
          },
          {
            category: otherCategory,
            label: CATEGORY_LABEL,
            value: otherWord,
            tally: 2,
          },
          {
            category: otherCategory,
            label: "fodder",
            value: otherWord,
            tally: 10,
          },
        ],
      })

      const suggestions = await db.suggestions.category([
        SCHEMA.value,
        otherWord,
      ])

      expect(suggestions).toStrictEqual({
        label: CATEGORY_LABEL,
        values: [otherCategory, SCHEMA.category],
      })
    })
  })

  describe("upsert schema", () => {
    const SCHEMA = {
      category: "myCategory",
      label: "theLabel",
      value: "a value",
      tally: 4,
    }

    beforeEach<Fixtures>(async ({ db }) => {
      await db.load({
        schemas: [SCHEMA],
      })
    })

    it("creates new if it doesn't already exists", async ({ expect, db }) => {
      const newSchema = { ...SCHEMA, label: "new label" }

      await db.schemas.upsert(newSchema)
      const schemas = await db.schemas.getAll()

      expect(schemas).toStrictEqual([SCHEMA, newSchema])
    })

    it("updates tally if it already exists", async ({ expect, db }) => {
      await db.schemas.upsert({ ...SCHEMA, tally: 1 })
      const schemas = await db.schemas.getAll()
      expect(schemas).toStrictEqual([{ ...SCHEMA, tally: SCHEMA.tally + 1 }])
    })
  })

  it("gets product details", async ({ expect, db }) => {
    const SIMILAR = {
      id: "92b15b90-3673-4a0e-b57c-8f9835a4f4d9",
      title: PRODUCT.title,
      images: PRODUCT.images,
    }
    await db.load({
      brands: [BRAND],
      sites: [SITE],
      sellers: [SELLER],
      products: [SIMILAR, PRODUCT],
      offers: [
        OFFER,
        {
          ...OFFER,
          price: OFFER.price + 10,
          id: "3931b158-a7d2-41d5-9b13-7266fe976a2a",
        },
      ],
      attributes: [ATTRIBUTE],
    })

    const result = await db.products.getDetails(PRODUCT.id)

    expect(result).toStrictEqual({
      title: PRODUCT.title,
      description: PRODUCT.description,
      images: PRODUCT.images,
      attributes: [{ label: ATTRIBUTE.label, value: ATTRIBUTE.value }],
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
          price: OFFER.price + 10,
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
