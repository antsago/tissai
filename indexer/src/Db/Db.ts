import { Connection } from "./Connection.js"
import * as traces from "./traces.js"
import * as sellers from "./sellers.js"
import * as brands from "./brands.js"
import * as categories from "./categories.js"
import * as tags from "./tags.js"
import * as products from "./products.js"
import * as offers from "./offers.js"

const tables = {traces, sellers, brands, categories, tags, products, offers}
type TABLES = typeof tables
type CRUD_METHODS = {
  [T in keyof TABLES]: {
    create: ReturnType<TABLES[T]["create"]>
  }
}

export const Db = (database?: string) => {
  const connection = Connection(database)
  
  const initialize = async () => {
    await connection.query("CREATE EXTENSION vector;")
    await Promise.all(Object.values(tables).map(table => table.initialize(connection)))
  }
  const crudMethods = Object.values(tables).reduce((aggregate, table) => ({
    ...aggregate,
    [table.TABLE as keyof typeof tables]: { create: table.create(connection) },
  }), {} as CRUD_METHODS)

  return {
    ...connection,
    initialize,
    ...crudMethods,
  }
}

export type Db = ReturnType<typeof Db>
