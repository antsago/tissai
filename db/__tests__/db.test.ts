import { randomUUID } from "node:crypto"
import { describe, it, beforeEach, afterEach, afterAll } from "vitest"
import {
  PRODUCT,
  SITE,
  PAGE,
  OFFER,
  BRAND,
  CATEGORY,
  TAG,
  SELLER,
} from "#mocks"
import { Db, PRODUCTS } from "../src"

describe("db", () => {
  const masterDb = Db()

  let db: Db
  let TEST_TABLE: string
  beforeEach(async () => {
    TEST_TABLE = randomUUID()
    await masterDb.query(`CREATE DATABASE "${TEST_TABLE}";`)

    db = Db(TEST_TABLE)
    await db.initialize()
  })

  afterEach(async () => {
    await db.close()

    await masterDb.query(`DROP DATABASE "${TEST_TABLE}";`)
  })

  afterAll(async () => {
    await masterDb.close()
  })

  it("creates entities", async ({ expect }) => {
    await db.sites.create(SITE)
    await db.pages.create(PAGE)
    await db.categories.create(CATEGORY)
    await db.tags.create(TAG)
    await db.sellers.create(SELLER)
    await db.brands.create(BRAND)
    await db.products.create(PRODUCT)
    await db.offers.create(OFFER)
    await db.traces.create(PAGE.id, PRODUCTS.toString(), PRODUCT.id)

    const products = await db.products.getAll()
    const offers = await db.offers.getAll()
    const categories = await db.categories.getAll()
    const tags = await db.tags.getAll()
    const brands = await db.brands.getAll()
    const sellers = await db.sellers.getAll()
    const traces = await db.traces.getAll()

    expect(products).toStrictEqual([PRODUCT])
    expect(offers).toStrictEqual([OFFER])
    expect(categories).toStrictEqual([CATEGORY])
    expect(tags).toStrictEqual([TAG])
    expect(brands).toStrictEqual([BRAND])
    expect(sellers).toStrictEqual([SELLER])
    expect(traces).toStrictEqual([
      {
        id: expect.any(String),
        timestamp: expect.any(Date),
        pageId: PAGE.id,
        objectTable: PRODUCTS.toString(),
        objectId: PRODUCT.id,
      },
    ])
  })
})
