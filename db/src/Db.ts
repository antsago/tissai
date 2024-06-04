import { Connection } from "./Connection.js"
import Tables, { PRODUCTS, Product } from "./tables/index.js"

export const Db = (database?: string) => {
  const connection = Connection(database)
  const tables = Tables(connection)

  const initialize = async () => {
    await connection.query("CREATE EXTENSION IF NOT EXISTS vector;")
    await tables.initialize()
  }
  
  type SearchResult = Pick<Product, "id" | "title"> & { image: string }

  const searchProducts = async (embedding: Product["embedding"]) => {
    return connection.query<SearchResult>(
      `
        SELECT
          ${PRODUCTS.id},
          ${PRODUCTS.title},
          ${PRODUCTS.images}[1] AS image
        FROM ${PRODUCTS}
        ORDER BY ${PRODUCTS.embedding} <-> $1
        LIMIT 24;
      `,
      [`[${embedding.join(",")}]`],
    )
  }

  return {
    ...connection,
    ...tables.crud,
    initialize,
    searchProducts,
  }
}

export type Db = ReturnType<typeof Db>
