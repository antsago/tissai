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

type Fixtures = { db: dbFixture }
const it = test.extend<Fixtures>({
  db: dbFixture,
})

const ATTRIBUTE = {
  id: "5f592540-9e7b-465b-89df-83527c2b7df0",
  label: "modelo",
  value: "BL 900",
  page: PAGE.id,
}
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
    await db.attributes.create(ATTRIBUTE)

    const products = await db.products.getAll()
    const offers = await db.offers.getAll()
    const categories = await db.categories.getAll()
    const tags = await db.tags.getAll()
    const brands = await db.brands.getAll()
    const sellers = await db.sellers.getAll()
    const attributes = await db.attributes.getAll()

    expect(products).toStrictEqual([PRODUCT])
    expect(offers).toStrictEqual([OFFER])
    expect(categories).toStrictEqual([CATEGORY])
    expect(tags).toStrictEqual([TAG])
    expect(brands).toStrictEqual([BRAND])
    expect(sellers).toStrictEqual([SELLER])
    expect(attributes).toStrictEqual([ATTRIBUTE])
  })

  describe("brands", () => {
    it("searches for brand by name", async ({ expect, db }) => {
      await db.load({
        brands: [BRAND],
      })

      const found = await db.brands.byName(BRAND.name.toLowerCase())

      expect(found).toStrictEqual(BRAND)
    })

    it("ignores brands with different names", async ({ expect, db }) => {
      await db.load({
        brands: [BRAND],
      })

      const found = await db.brands.byName("foo")

      expect(found).toBe(undefined)
    })

    it("updates brand details", async ({ expect, db }) => {
      await db.load({
        brands: [{ name: BRAND.name }],
      })

      await db.brands.update(BRAND)
      const brands = await db.brands.getAll()

      expect(brands).toStrictEqual([BRAND])
    })
  })

  it("gets product details", async ({ expect, db }) => {
    const SIMILAR = {
      id: "92b15b90-3673-4a0e-b57c-8f9835a4f4d9",
      title: PRODUCT.title,
      images: PRODUCT.images,
      category: PRODUCT.category,
      tags: PRODUCT.tags,
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
