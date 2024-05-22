import { Connection } from "../Connection.js"
import * as traces from "./traces.js"
import * as sellers from "./sellers.js"
import * as brands from "./brands.js"
import * as categories from "./categories.js"
import * as tags from "./tags.js"
import * as products from "./products.js"
import * as offers from "./offers.js"
import * as sites from "./sites.js"
import * as pages from "./pages.js"

const TABLE_MODULES = {
  brands,
  categories,
  offers,
  pages,
  products,
  sellers,
  sites,
  tags,
  traces,
}
type TABLE_MODULES = typeof TABLE_MODULES

type CRUD_METHODS = {
  [T in keyof TABLE_MODULES]: {
    create: ReturnType<TABLE_MODULES[T]["create"]>
  }
}

const Tables = (connection: Connection) => ({
  initialize: async () => {
    const { sites, ...others } = TABLE_MODULES

    sites.initialize(connection)
    await Promise.all(
      Object.values(others).map((table) => table.initialize(connection)),
    )
  },
  crud: Object.values(TABLE_MODULES).reduce(
    (aggregate, table) => ({
      ...aggregate,
      [table.TABLE]: { create: table.create(connection) },
    }),
    {} as CRUD_METHODS,
  ),
})

export default Tables
