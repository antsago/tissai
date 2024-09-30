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

  describe("category suggestion", () => {
    const SCHEMA = {
      category: "category",
      label: CATEGORY_LABEL,
      value: "value",
      tally: 2,
    }

    beforeEach<Fixtures>(async ({ db }) => {
      await db.load({ schemas: [SCHEMA] })
    })

    it("suggests most likely categories", async ({ expect, db }) => {
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

      const suggestions = await db.suggestions.category()

      expect(suggestions).toStrictEqual({
        label: CATEGORY_LABEL,
        values: [otherCategory, SCHEMA.category],
      })
    })

    it("ignores non-category counts", async ({ expect, db }) => {
      const otherCategory = "category2"
      await db.load({
        schemas: [
          {
            category: otherCategory,
            label: CATEGORY_LABEL,
            value: SCHEMA.value,
            tally: 4,
          },
          {
            ...SCHEMA,
            label: "non-category-label",
            tally: 4,
          },
        ],
      })

      const suggestions = await db.suggestions.category()

      expect(suggestions).toStrictEqual({
        label: CATEGORY_LABEL,
        values: [otherCategory, SCHEMA.category],
      })
    })

    it("limits suggested values", async ({ expect, db }) => {
      const limit = 5
      await db.load({
        schemas: new Array(limit + 1).fill(null).map((_, i) => ({
          category: `${SCHEMA.category}${i}`,
          label: CATEGORY_LABEL,
          value: SCHEMA.value,
          tally: 4,
        })),
      })

      const suggestions = await db.suggestions.category(limit)

      expect(suggestions.values.length).toStrictEqual(limit)
    })
  })

  describe("atttributes suggestions", () => {
    const SCHEMA = {
      category: "category",
      label: "label",
      value: "value",
      tally: 2,
    }

    beforeEach<Fixtures>(async ({ db }) => {
      await db.load({ schemas: [SCHEMA] })
    })

    it("suggests most likely labels", async ({ expect, db }) => {
      const otherLabel = "label2"
      await db.load({
        schemas: [
          {
            category: SCHEMA.category,
            label: otherLabel,
            value: SCHEMA.value,
            tally: 4,
          },
        ],
      })

      const suggestions = await db.suggestions.attributes(SCHEMA.category)

      expect(suggestions).toStrictEqual([
        {
          label: otherLabel,
          values: [SCHEMA.value],
        },
        {
          label: SCHEMA.label,
          values: [SCHEMA.value],
        },
      ])
    })

    it("ignores other categories", async ({ expect, db }) => {
      const otherCategory = "category2"
      const otherLabel = "label2"
      await db.load({
        schemas: [
          {
            category: SCHEMA.category,
            label: otherLabel,
            value: SCHEMA.value,
            tally: 3,
          },
          {
            ...SCHEMA,
            category: otherCategory,
          },
          {
            ...SCHEMA,
            category: otherCategory,
            label: "label3",
          },
          {
            ...SCHEMA,
            category: otherCategory,
            value: "value2",
          },
        ],
      })

      const suggestions = await db.suggestions.attributes(SCHEMA.category)

      expect(suggestions).toStrictEqual([
        {
          label: otherLabel,
          values: [SCHEMA.value],
        },
        {
          label: SCHEMA.label,
          values: [SCHEMA.value],
        },
      ])
    })

    it("ignores category label", async ({ expect, db }) => {
      await db.load({
        schemas: [
          {
            category: SCHEMA.category,
            label: CATEGORY_LABEL,
            value: SCHEMA.value,
            tally: 4,
          },
        ],
      })

      const suggestions = await db.suggestions.attributes(SCHEMA.category)

      expect(suggestions).toStrictEqual([
        {
          label: SCHEMA.label,
          values: [SCHEMA.value],
        },
      ])
    })

    it("limits number of suggestions", async ({ expect, db }) => {
      const limit = 3
      await db.load({
        schemas: new Array(limit + 1).fill(null).map((_, i) => ({
          category: SCHEMA.category,
          label: `${SCHEMA.label}_${i}`,
          value: SCHEMA.value,
          tally: 4,
        })),
      })

      const suggestions = await db.suggestions.attributes(
        SCHEMA.category,
        limit,
      )

      expect(suggestions.length).toStrictEqual(limit)
    })

    it("returns most likely values", async ({ expect, db }) => {
      const otherValue = "value1"
      await db.load({
        schemas: [
          {
            ...SCHEMA,
            value: otherValue,
            tally: 4,
          },
        ],
      })

      const suggestions = await db.suggestions.attributes(SCHEMA.category)

      expect(suggestions).toStrictEqual([
        {
          label: SCHEMA.label,
          values: [otherValue, SCHEMA.value],
        },
      ])
    })

    it("limits suggested values", async ({ expect, db }) => {
      const limit = 5
      await db.load({
        schemas: new Array(limit + 1).fill(null).map((_, i) => ({
          ...SCHEMA,
          value: `${SCHEMA.value}${i}`,
        })),
      })

      const suggestions = await db.suggestions.attributes(SCHEMA.category, undefined, limit)

      expect(suggestions[0].values.length).toStrictEqual(limit)
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
