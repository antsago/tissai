import { Connection } from "../Connection.js"
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
}
type TABLE_MODULES = typeof TABLE_MODULES

type CRUD_METHODS = {
  [T in keyof TABLE_MODULES]: {
    create: ReturnType<TABLE_MODULES[T]["create"]>
    getAll: ReturnType<TABLE_MODULES[T]["getAll"]>
  }
} & {
  brands: {
    byName: ReturnType<TABLE_MODULES['brands']['byName']>
    update: ReturnType<TABLE_MODULES['brands']['update']>
  }
}

const Tables = (connection: Connection) => ({
  initialize: async () => {
    const initializeInParalel = (tables: Partial<TABLE_MODULES>) =>
      Promise.all(
        Object.values(tables).map((table) => table.initialize(connection)),
      )

    const { sites, categories, brands, sellers, pages, products, ...others } =
      TABLE_MODULES

    await initializeInParalel({ sites, categories, brands, sellers })
    await initializeInParalel({ pages, products })
    await initializeInParalel(others)
  },
  crud: Object.values(TABLE_MODULES).reduce(
    (aggregate, table) => {
      const toAdd = 'byName' in table ? {
        byName: table.byName(connection),
        update: table.update(connection),
      } : {}

      return ({
        ...aggregate,
        [table.TABLE]: {
          create: table.create(connection),
          getAll: table.getAll(connection),
          ...toAdd,
        },
      })
    },
    {} as CRUD_METHODS,
  ),
})

export default Tables
