import { randomUUID } from "node:crypto"
import { TaskContext, TestContext } from "vitest"
import {
  Attribute,
  Brand,
  Db,
  Entities,
  Offer,
  Page,
  Product,
  Schema,
  Seller,
  Site,
} from "../../src/index.js"

type State = Partial<{
  sites: Site[]
  pages: Page[]
  sellers: Seller[]
  brands: Brand[]
  products: Product[]
  offers: Offer[]
  attributes: Attribute[]
  schemas: Schema[]
}>

const load = (db: Db) => async (state: State) => {
  const { pages, products, attributes, offers, ...others } = state

  await Promise.all(
    Object.entries(others).flatMap(([entityName, entities]) =>
      entities.map((e) => db[entityName].create(e)),
    ),
  )

  await Promise.all(
    [
      pages?.map((p) => db.pages.create(p)),
      products?.map((p) => db.products.create(p)),
    ].flat(),
  )

  await Promise.all(
    [
      offers?.map((o) => db.offers.create(o)),
      attributes?.map((a) => db.attributes.create(a)),
    ].flat(),
  )
}

export type dbFixture = Db & { name: string; load: ReturnType<typeof load> }

export const dbFixture = async (
  {}: TaskContext & TestContext,
  use: (db: dbFixture) => any,
) => {
  const masterDb = Db()
  const TEST_DB = randomUUID()
  await masterDb.raw(`CREATE DATABASE "${TEST_DB}";`)
  const db = Db(TEST_DB)
  await db.initialize()

  await use({ name: TEST_DB, load: load(db), ...db })

  await db.close()
  await masterDb.raw(`DROP DATABASE "${TEST_DB}";`)
  await masterDb.close()
}
