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
  CATEGORY_NODE,
  LABEL_NODE,
  VALUE_NODE,
} from "#mocks"

type Fixtures = { db: dbFixture }
const it = test.extend<Fixtures>({
  db: dbFixture,
})

describe.concurrent("db", () => {
  describe("inference", () => {
    it.only("returns word-matching categories", async ({ expect, db }) => {
      const nonMatchingName = "foo"
      const nonMatchingCategory = {
        ...CATEGORY_NODE,
        id: "18399210-4ad5-41df-94b3-0f8fbf2c12c8",
        name: nonMatchingName,
      }
      const categoryWithoutLabels = {
        ...CATEGORY_NODE,
        id: "2f311f14-b613-4a0d-ba84-5094d06cf3b6",
        name: "labeless-category",
      }
      const labelWithoutValues = {
        ...LABEL_NODE,
        id: "2b3a9822-a8bd-4b13-9393-6640ce7bade3",
        name: "valueless-label",
      }
      const nonMatchingValue = {
        ...VALUE_NODE,
        id: "fc30fca9-2a82-4d65-bb04-7b12a2e1fa4a",
        name: nonMatchingName,
      }
      const lessFrequentValue = {
        ...VALUE_NODE,
        id: "36c65865-58b2-49ef-b1ae-6b09a9ab60f1",
        name: "unlikely value",
        tally: 1,
      }
      await db.load({
        nodes: [
          CATEGORY_NODE,
          LABEL_NODE,
          VALUE_NODE,
          nonMatchingCategory,
          categoryWithoutLabels,
          labelWithoutValues,
          nonMatchingValue,
          lessFrequentValue,
        ],
      })

      const result = await db.nodes.infer([
        CATEGORY_NODE.name,
        VALUE_NODE.name,
        categoryWithoutLabels.name,
        lessFrequentValue.name,
      ])

      expect(result).toStrictEqual([
        {
          id: categoryWithoutLabels.id,
          tally: categoryWithoutLabels.tally,
          properties: null,
        },
        {
          id: CATEGORY_NODE.id,
          tally: CATEGORY_NODE.tally,
          properties: [
            {
              id: LABEL_NODE.id,
              value: VALUE_NODE.id,
              probability: VALUE_NODE.tally / CATEGORY_NODE.tally,
            },
            {
              id: labelWithoutValues.id,
              probability: null,
              value: null,
            },
          ],
        },
      ])
    })
  })

  it("creates entities", async ({ expect, db }) => {
    await db.sites.create(SITE)
    await db.pages.create(PAGE)
    await db.sellers.create(SELLER)
    await db.brands.create(BRAND)
    await db.products.create(PRODUCT)
    await db.offers.create(OFFER)
    await db.attributes.create(ATTRIBUTE)
    await db.nodes.create(CATEGORY_NODE)

    const products = await db.products.getAll()
    const offers = await db.offers.getAll()
    const brands = await db.brands.getAll()
    const sellers = await db.sellers.getAll()
    const attributes = await db.attributes.getAll()
    const nodes = await db.nodes.getAll()

    expect(products).toStrictEqual([PRODUCT])
    expect(offers).toStrictEqual([OFFER])
    expect(brands).toStrictEqual([BRAND])
    expect(sellers).toStrictEqual([SELLER])
    expect(attributes).toStrictEqual([ATTRIBUTE])
    expect(nodes).toStrictEqual([CATEGORY_NODE])
  })

  describe("upsert node", () => {
    beforeEach<Fixtures>(async ({ db }) => {
      await db.load({
        nodes: [CATEGORY_NODE],
      })
    })

    it("creates new if it doesn't already exists", async ({ expect, db }) => {
      const newNode = {
        id: "bd11bd26-ea86-48c4-935d-2176dc91bd56",
        parent: CATEGORY_NODE.id,
        name: "tela",
        tally: 1,
      }

      await db.nodes.upsert(newNode)
      const nodes = await db.nodes.getAll()

      expect(nodes).toStrictEqual([CATEGORY_NODE, newNode])
    })

    it("updates tally if it already exists", async ({ expect, db }) => {
      const { id } = await db.nodes.upsert({ ...CATEGORY_NODE, tally: 1 })
      const nodes = await db.nodes.getAll()
      expect(id).toStrictEqual(CATEGORY_NODE.id)
      expect(nodes).toStrictEqual([
        { ...CATEGORY_NODE, tally: CATEGORY_NODE.tally + 1 },
      ])
    })

    it("ignores different id", async ({ expect, db }) => {
      const { id } = await db.nodes.upsert({
        ...CATEGORY_NODE,
        id: "bd11bd26-ea86-48c4-935d-2176dc91bd57",
        tally: 1,
      })
      const nodes = await db.nodes.getAll()
      expect(id).toStrictEqual(CATEGORY_NODE.id)
      expect(nodes).toStrictEqual([
        { ...CATEGORY_NODE, tally: CATEGORY_NODE.tally + 1 },
      ])
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
