import type { Brand } from "./brands.js"
import type { Category } from "./categories.js"
import type { Product } from "./products.js"
import type { Offer } from "./offers.js"
import type { Page } from "./pages.js"
import type { Seller } from "./sellers.js"
import type { Site } from "./sites.js"
import type { Tag } from "./tags.js"
import {
  DummyDriver,
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from "kysely"

type Database = {
  brands: Brand
  categories: Category
  offers: Offer
  pages: Page
  products: Product
  sellers: Seller
  sites: Site
  tags: Tag
}

const builder = new Kysely<Database>({
  dialect: {
    createAdapter: () => new PostgresAdapter(),
    createDriver: () => new DummyDriver(),
    createIntrospector: (db) => new PostgresIntrospector(db),
    createQueryCompiler: () => new PostgresQueryCompiler(),
  },
})

export default builder
