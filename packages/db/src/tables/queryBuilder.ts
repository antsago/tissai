import type { Brand } from "./brands.js"
import type { Product } from "./products.js"
import type { Offer } from "./offers.js"
import type { Page } from "./pages.js"
import type { Seller } from "./sellers.js"
import type { Site } from "./sites.js"
import type { Attribute } from "./attributes.js"
import {
  DummyDriver,
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from "kysely"

type Database = {
  attributes: Attribute
  brands: Brand
  offers: Offer
  pages: Page
  products: Product
  sellers: Seller
  sites: Site
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
