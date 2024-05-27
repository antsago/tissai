import {
  expect,
  describe,
  it,
  beforeEach,
  afterEach,
  vi,
  afterAll,
} from "vitest"
import {
  PRODUCT,
  DERIVED_DATA,
  SITE,
  PAGE,
  pageWithSchema,
  OFFER,
  BRAND,
  EMBEDDING_FROM_PG,
} from "#mocks"
import {
  Db,
  TRACES,
  PRODUCTS,
  OFFERS,
  CATEGORIES,
  TAGS,
  SELLERS,
  BRANDS,
} from "../src/Db/index.js"

const TEST_TABLE = "test"
describe("indexer", () => {
  const masterDb = Db()
  vi.stubEnv("PG_DATABASE", TEST_TABLE)

  let db: Db
  beforeEach(async () => {
    vi.resetModules()

    await masterDb.query(`CREATE DATABASE ${TEST_TABLE};`)

    db = Db()
    await db.initialize()
  })

  afterEach(async () => {
    await db.close()

    await masterDb.query(`DROP DATABASE ${TEST_TABLE};`)
  })

  afterAll(async () => {
    await masterDb.close()
  })

  it("extracts and stores page entities", async () => {
    await db.sites.create(SITE)
    await db.pages.create(
      pageWithSchema({
        "@context": "https://schema.org/",
        "@type": "Product",
        name: PRODUCT.title,
        description: PRODUCT.description,
        image: PRODUCT.image,
        brand: {
          "@type": "Brand",
          name: BRAND.name,
          image: BRAND.logo,
        },
        offers: {
          "@type": "Offer",
          url: "https://example.com/offer",
          price: OFFER.price,
          priceCurrency: OFFER.curency,
          seller: {
            "@type": "Organization",
            name: OFFER.seller,
          },
        },
      }),
    )

    await import("../src/index.js")

    const products = await db.query(`SELECT * FROM ${PRODUCTS};`)
    expect(products).toStrictEqual([
      {
        id: expect.any(String),
        title: PRODUCT.title,
        description: PRODUCT.description,
        images: [PRODUCT.image],
        embedding: EMBEDDING_FROM_PG,
        category: DERIVED_DATA.category,
        tags: DERIVED_DATA.tags,
        brand: BRAND.name,
      },
    ])
    const offers = await db.query(`SELECT * FROM ${OFFERS};`)
    expect(offers).toStrictEqual([
      {
        id: expect.any(String),
        product: products[0].id,
        site: PAGE.site,
        url: PAGE.url,
        seller: OFFER.seller,
        price: String(OFFER.price),
        currency: OFFER.curency,
      },
    ])
    const categories = await db.query(`SELECT * FROM ${CATEGORIES};`)
    expect(categories).toStrictEqual([{ name: DERIVED_DATA.category }])
    const tags = await db.query(`SELECT * FROM ${TAGS};`)
    expect(tags).toStrictEqual([{ name: DERIVED_DATA.tags[0] }])
    const brands = await db.query(`SELECT * FROM ${BRANDS};`)
    expect(brands).toStrictEqual([{ name: BRAND.name, logo: BRAND.logo }])
    const sellers = await db.query(`SELECT * FROM ${SELLERS};`)
    expect(sellers).toStrictEqual([{ name: OFFER.seller }])
    const traces = await db.query(`SELECT * FROM ${TRACES};`)
    expect(traces).toContainEqual({
      id: expect.any(String),
      [TRACES.pageId]: PAGE.id,
      [TRACES.objectTable]: PRODUCTS.toString(),
      [TRACES.objectId]: products[0].id,
      [TRACES.timestamp]: expect.any(Date),
    })
    expect(traces).toContainEqual({
      id: expect.any(String),
      [TRACES.pageId]: PAGE.id,
      [TRACES.objectTable]: OFFERS.toString(),
      [TRACES.objectId]: offers[0].id,
      [TRACES.timestamp]: expect.any(Date),
    })
    expect(traces).toContainEqual({
      id: expect.any(String),
      [TRACES.pageId]: PAGE.id,
      [TRACES.objectTable]: CATEGORIES.toString(),
      [TRACES.objectId]: categories[0].name,
      [TRACES.timestamp]: expect.any(Date),
    })
    expect(traces).toContainEqual({
      id: expect.any(String),
      [TRACES.pageId]: PAGE.id,
      [TRACES.objectTable]: TAGS.toString(),
      [TRACES.objectId]: tags[0].name,
      [TRACES.timestamp]: expect.any(Date),
    })
    expect(traces).toContainEqual({
      id: expect.any(String),
      [TRACES.pageId]: PAGE.id,
      [TRACES.objectTable]: BRANDS.toString(),
      [TRACES.objectId]: brands[0].name,
      [TRACES.timestamp]: expect.any(Date),
    })
    expect(traces).toContainEqual({
      id: expect.any(String),
      [TRACES.pageId]: PAGE.id,
      [TRACES.objectTable]: SELLERS.toString(),
      [TRACES.objectId]: sellers[0].name,
      [TRACES.timestamp]: expect.any(Date),
    })
  })

  it.only("stores multiples of each entity", async () => {
    const seller2 = `${OFFER.seller} 2`
    await db.sites.create(SITE)
    await db.pages.create(
      pageWithSchema({
        "@context": "https://schema.org/",
        "@type": "Product",
        name: PRODUCT.title,
        offers: [
          {
            "@type": "Offer",
            seller: {
              "@type": "Organization",
              name: OFFER.seller,
            },
          },
          {
            "@type": "Offer",
            seller: {
              "@type": "Organization",
              name: seller2,
            },
          },
        ],
      }),
    )

    await import("../src/index.js")

    const offers = await db.query(`SELECT * FROM ${OFFERS};`)
    expect(offers).toStrictEqual([
      expect.objectContaining({ seller: OFFER.seller }),
      expect.objectContaining({ seller: seller2 }),
    ])
    const sellers = await db.query(`SELECT * FROM ${SELLERS};`)
    expect(sellers).toStrictEqual([
      { name: OFFER.seller },
      { name: seller2 },
    ])
    // const tags = await db.query(`SELECT * FROM ${TAGS};`)
    // expect(tags).toStrictEqual([{ name: DERIVED_DATA.tags[0] }])
  })
})
