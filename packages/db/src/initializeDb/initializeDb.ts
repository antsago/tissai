import type { Connection } from "../Connection.js"
import * as sellers from "./sellers.js"
import * as brands from "./brands.js"
import * as products from "./products.js"
import * as offers from "./offers.js"
import * as sites from "./sites.js"
import * as pages from "./pages.js"
import * as attributes from "./attributes.js"

const Tables = {
  attributes,
  brands,
  offers,
  pages,
  products,
  sellers,
  sites,
}

const initializeExtensions = async (connection: Connection) => {
  await connection.raw("CREATE EXTENSION IF NOT EXISTS vector;")
  await connection.raw("CREATE EXTENSION IF NOT EXISTS pg_trgm;")
}

const initializeTables = async (connection: Connection) => {
  const initializeInParalel = (tables: Partial<typeof Tables>) =>
    Promise.all(
      Object.values(tables).map((table) => table.initialize(connection)),
    )

  const { sites, brands, sellers, pages, products, ...others } = Tables

  await initializeInParalel({ sites, brands, sellers })
  await initializeInParalel({ pages, products })
  await initializeInParalel(others)
}

const initializeDb = async (connection: Connection) => {
  await initializeExtensions(connection)
  await initializeTables(connection)
}

export default initializeDb
