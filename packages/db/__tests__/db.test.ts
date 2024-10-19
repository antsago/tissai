import { describe, test } from "vitest"
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
} from "#mocks"

type Fixtures = { db: dbFixture }
const it = test.extend<Fixtures>({
  db: dbFixture,
})

describe.concurrent("db", () => {
  it("creates entities", async ({ expect, db }) => {
    const attribute = {
      ...ATTRIBUTE,
      value: CATEGORY_NODE.id,
    }

    await db.sites.create(SITE)
    await db.pages.create(PAGE)
    await db.sellers.create(SELLER)
    await db.brands.create(BRAND)
    await db.nodes.create(CATEGORY_NODE)
    await db.products.create(PRODUCT)
    await db.offers.create(OFFER)
    await db.attributes.create(attribute)

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
    expect(attributes).toStrictEqual([attribute])
    expect(nodes).toStrictEqual([CATEGORY_NODE])
  })

  it("handles partial entities", async ({ expect, db }) => {
    db.load({ sites: [SITE], pages: [PAGE] })
    const brand = { name: BRAND.name }
    const product = { id: PRODUCT.id, title: PRODUCT.title }
    const offer = { id: OFFER.id, product: PRODUCT.id, url: PAGE.url, site: SITE.id }

    await db.brands.create(brand)
    await db.products.create(product)
    await db.offers.create(offer)

    const brands = await db.brands.getAll()
    const products = await db.products.getAll()
    const offers = await db.offers.getAll()

    expect(brands).toStrictEqual([{ ...brand, logo: null }])
    expect(products).toStrictEqual([{ ...product, brand: null, images: null, description: null, category: null }])
    expect(offers).toStrictEqual([{...offer, currency: null, price: null, seller: null }])
  })

  it("handles duplicated sellers", async ({ expect, db }) => {
    await db.load({ sellers: [SELLER]})

    await db.sites.create(SITE)

    const sellers = await db.sellers.getAll()
    expect(sellers).toStrictEqual([SELLER])
  })
})
