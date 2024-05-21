import { Connection } from "./Connection.js"
import * as traces from "./traces.js"
import * as sellers from "./sellers.js"
import * as brands from "./brands.js"
import * as categories from "./categories.js"
import * as tags from "./tags.js"
import * as products from "./products.js"
import * as offers from "./offers.js"

const TABLE_MODULES = {
  brands,
  categories,
  offers,
  products,
  sellers,
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
  initialize: () => Promise.all(Object.values(TABLE_MODULES).map(table => table.initialize(connection))),
  crud: Object.values(TABLE_MODULES).reduce((aggregate, table) => ({
    ...aggregate,
    [table.TABLE]: { create: table.create(connection) },
  }), {} as CRUD_METHODS)
})

export default Tables
