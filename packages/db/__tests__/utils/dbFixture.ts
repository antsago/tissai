import { randomUUID } from "node:crypto"
import { TaskContext, TestContext } from "vitest"
import { Brand, Category, Db, Offer, Page, Product, Seller, Site, Tag } from "../../src/index.js"

type State = Partial<{
  sites: Site[]
  pages: Page[]
  categories: Category[]
  tags: Tag[]
  sellers: Seller[]
  brands: Brand[]
  products: Product[]
  offers: Offer[]
}>

const load = (db: Db) => async (state: State) => {
  await Promise.all([
    state.sites?.map(s => db.sites.create(s)),
    state.categories?.map(c => db.categories.create(c)),
    state.tags?.map(t => db.tags.create(t)),
    state.sellers?.map(s => db.sellers.create(s)),
    state.brands?.map(b => db.brands.create(b)),
  ].flat())

  await Promise.all([
    state.pages?.map(p => db.pages.create(p)),
    state.products?.map(p => db.products.create(p)),
  ].flat())

  await Promise.all(state.offers?.map(o => db.offers.create(o)) ?? [])
}

export type dbFixture = Db & { name: string, load: ReturnType<typeof load> } 

export const dbFixture = async ({}: TaskContext & TestContext, use: (db: dbFixture) => any) => {
  const masterDb = Db()
  const TEST_DB = randomUUID()
  await masterDb.query(`CREATE DATABASE "${TEST_DB}";`)
  const db = Db(TEST_DB)
  await db.initialize()

  await use({ name: TEST_DB, load: load(db), ...db })

  await db.close()
  await masterDb.query(`DROP DATABASE "${TEST_DB}";`)
  await masterDb.close()
}

