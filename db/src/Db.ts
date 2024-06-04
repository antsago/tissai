import { Connection } from "./Connection.js"
import Tables from "./tables/index.js"
import searchProducts from "./searchProducts.js"

export const Db = (database?: string) => {
  const connection = Connection(database)
  const tables = Tables(connection)

  const initialize = async () => {
    await connection.query("CREATE EXTENSION IF NOT EXISTS vector;")
    await tables.initialize()
  }

  return {
    ...connection,
    ...tables.crud,
    initialize,
    searchProducts: searchProducts(connection),
  }
}

export type Db = ReturnType<typeof Db>
