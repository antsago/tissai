import { Connection } from "./Connection.js"
import Tables from "./tables/index.js"
import searchProducts from "./searchProducts.js"
import getProductDetails from "./getProductDetails.js"

export const Db = (database?: string) => {
  const connection = Connection(database)
  const tables = Tables(connection)

  const initialize = async () => {
    await connection.raw("CREATE EXTENSION IF NOT EXISTS vector;")
    await connection.raw("CREATE EXTENSION IF NOT EXISTS pg_trgm;")
    await tables.initialize()
  }

  return {
    ...connection,
    ...tables.crud,
    initialize,
    searchProducts: searchProducts(connection),
    getProductDetails: getProductDetails(connection),
  }
}

export type Db = ReturnType<typeof Db>
