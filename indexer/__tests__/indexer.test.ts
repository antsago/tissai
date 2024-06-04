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
  Db,
  TRACES,
  PRODUCTS,
  OFFERS,
  CATEGORIES,
  TAGS,
  SELLERS,
  BRANDS,
} from "@tissai/db"
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

const TEST_TABLE = "test"
const FULL_SCHEMA = {
  "@context": "https://schema.org/",
  "@type": "Product",
  name: PRODUCT.title,
  description: PRODUCT.description,
  image: PRODUCT.images[0],
  brand: {
    "@type": "Brand",
    name: BRAND.name,
    image: BRAND.logo,
  },
  offers: {
    "@type": "Offer",
    url: "https://example.com/offer",
    price: OFFER.price,
    priceCurrency: OFFER.currency,
    seller: {
      "@type": "Organization",
      name: OFFER.seller,
    },
  },
}

// Silence console
vi.mock("ora", async () => {
  const spinner = {
    start: vi.fn(),
    succeed: vi.fn(),
    fail: vi.fn(),
    text: "",
    prefixText: "",
  }
  spinner.start.mockReturnValue(spinner)
  spinner.succeed.mockReturnValue(spinner)
  spinner.fail.mockReturnValue(spinner)
  const ora = vi.fn().mockReturnValue(spinner)
  const realOra = await vi.importActual("ora")

  return { ...realOra, default: ora }
})

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
    await db.pages.create(pageWithSchema(FULL_SCHEMA))

    await import("../src/index.js")

    const products = await db.query(`SELECT * FROM ${PRODUCTS};`)
    expect(products).toStrictEqual([
      {
        id: expect.any(String),
        title: PRODUCT.title,
        description: PRODUCT.description,
        images: [PRODUCT.images[0]],
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
        currency: OFFER.currency,
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

  it("handles duplicates", async () => {
    await db.sites.create(SITE)
    await db.pages.create(pageWithSchema(FULL_SCHEMA))
    db.categories.create({ name: DERIVED_DATA.category })
    db.tags.create(PAGE.id, { name: DERIVED_DATA.tags[0] })
    db.sellers.create(PAGE.id, { name: OFFER.seller })
    db.brands.create(PAGE.id, { name: BRAND.name })

    await import("../src/index.js")

    const products = await db.query(`SELECT * FROM ${PRODUCTS};`)
    expect(products.length).toBe(1)
    const offers = await db.query(`SELECT * FROM ${OFFERS};`)
    expect(offers.length).toBe(1)
    const categories = await db.query(`SELECT * FROM ${CATEGORIES};`)
    expect(categories.length).toBe(1)
    const tags = await db.query(`SELECT * FROM ${TAGS};`)
    expect(tags.length).toBe(1)
    const brands = await db.query(`SELECT * FROM ${BRANDS};`)
    expect(brands.length).toBe(1)
    const sellers = await db.query(`SELECT * FROM ${SELLERS};`)
    expect(sellers.length).toBe(1)
    const traces = await db.query(`SELECT * FROM ${TRACES};`)
    expect(traces.length).toBe(3 + 6)
  })
})
