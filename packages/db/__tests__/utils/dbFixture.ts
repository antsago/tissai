import { randomUUID } from "node:crypto"
import { TaskContext, TestContext } from "vitest"
import {
  Attribute,
  Brand,
  Db,
  Offer,
  Page,
  Product,
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
}>

const load = (db: Db) => async (state: State) => {
  await Promise.all(
    [
      state.sites?.map((s) => db.sites.create(s)),
      state.sellers?.map((s) => db.sellers.create(s)),
      state.brands?.map((b) => db.brands.create(b)),
    ].flat(),
  )

  await Promise.all(
    [
      state.pages?.map((p) => db.pages.create(p)),
      state.products?.map((p) => db.products.create(p)),
    ].flat(),
  )

  await Promise.all(
    [
      state.offers?.map((o) => db.offers.create(o)),
      state.attributes?.map((a) => db.attributes.create(a)),
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
