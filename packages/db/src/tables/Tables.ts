import { Connection } from "../Connection.js"
import * as sellers from "./sellers.js"
import * as brands from "./brands.js"
import * as products from "./products.js"
import * as offers from "./offers.js"
import * as sites from "./sites.js"
import * as pages from "./pages.js"
import * as attributes from "./attributes.js"

const TABLE_MODULES = {
  attributes,
  brands,
  offers,
  pages,
  products,
  sellers,
  sites,
}
type TABLE_MODULES = typeof TABLE_MODULES

type CRUD_METHODS = {
  [T in keyof TABLE_MODULES]: ReturnType<TABLE_MODULES[T]["crud"]>
}

const Tables = (connection: Connection) => ({
  initialize: async () => {
    const initializeInParalel = (tables: Partial<TABLE_MODULES>) =>
      Promise.all(
        Object.values(tables).map((table) => table.initialize(connection)),
      )

    const { sites, brands, sellers, pages, products, ...others } =
      TABLE_MODULES

    await initializeInParalel({ sites, brands, sellers })
    await initializeInParalel({ pages, products })
    await initializeInParalel(others)
  },
  crud: Object.values(TABLE_MODULES).reduce(
    (aggregate, table) => ({
      ...aggregate,
      [table.TABLE]: table.crud(connection),
    }),
    {} as CRUD_METHODS,
  ),
})

export default Tables
