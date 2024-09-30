import type { Connection } from "../Connection.js"
import * as sellers from "./sellers.js"
import * as brands from "./brands.js"
import * as products from "./products.js"
import * as offers from "./offers.js"
import * as sites from "./sites.js"
import * as pages from "./pages.js"
import * as attributes from "./attributes.js"
import * as schemas from "./schemas.js"
import * as nodes from "./nodes.js"

const Tables = {
  attributes,
  brands,
  nodes,
  offers,
  pages,
  products,
  schemas,
  sellers,
  sites,
}

const initializeExtensions = async (connection: Connection) => {
  await connection.raw("CREATE EXTENSION IF NOT EXISTS vector;")
  await connection.raw("CREATE EXTENSION IF NOT EXISTS pg_trgm;")
  await connection.raw(
    "DROP AGGREGATE IF EXISTS mul(numeric); CREATE AGGREGATE mul(numeric) ( SFUNC = numeric_mul, STYPE=numeric );",
  )
}

const initializeTables = async (connection: Connection) => {
  const initializeInParalel = (tables: Partial<typeof Tables>) =>
    Promise.all(
      Object.values(tables).map((table) => table.initialize(connection)),
    )

  const { pages, products, attributes, offers, ...others } = Tables

  await initializeInParalel(others)
  await initializeInParalel({ pages, products })
  await initializeInParalel({ attributes, offers })
}

const initializeDb = async (connection: Connection) => {
  await initializeExtensions(connection)
  await initializeTables(connection)
}

export default initializeDb
