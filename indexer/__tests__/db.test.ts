import {
  expect,
  describe,
  it,
  beforeEach,
  afterEach,
  vi,
  afterAll,
} from "vitest"
import { PRODUCT, AUGMENTED_DATA, SITE, PAGE, pageWithSchema } from "#mocks"
import {
  Db,
  TRACES,
  PRODUCTS,
  OFFERS,
  CATEGORIES,
  TAGS,
} from "../src/Db/index.js"

const TEST_TABLE = "test"
describe("DB", () => {
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

  it("extracts product details", async () => {
    await db.sites.create(SITE)
    await db.pages.create(pageWithSchema({
      "@type": "Product",
      name: PRODUCT.title,
      description: PRODUCT.description,
      image: PRODUCT.image,
    }))

    await import("../src/index.js")

    const products = await db.query(`SELECT * FROM ${PRODUCTS};`)
    expect(products).toStrictEqual([
      {
        id: expect.any(String),
        title: PRODUCT.title,
        description: PRODUCT.description,
        images: [PRODUCT.image],
        embedding: AUGMENTED_DATA.embedding,
        category: AUGMENTED_DATA.category,
        tags: AUGMENTED_DATA.tags,
        brand: null,
      },
    ])
    const offers = await db.query(`SELECT * FROM ${OFFERS};`)
    expect(offers).toStrictEqual([
      {
        id: expect.any(String),
        product: products[0].id,
        site: PAGE.site,
        url: PAGE.url,
        seller: null,
        price: null,
        currency: null,
      },
    ])
    const categories = await db.query(`SELECT * FROM ${CATEGORIES};`)
    expect(categories).toStrictEqual([{ name: AUGMENTED_DATA.category }])
    const tags = await db.query(`SELECT * FROM ${TAGS};`)
    expect(tags).toStrictEqual([{ name: AUGMENTED_DATA.tags[0] }])
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
  })
})
