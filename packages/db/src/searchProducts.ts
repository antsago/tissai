import { Connection } from "./Connection.js"
import { PRODUCTS, Product } from "./tables/index.js"

type SearchResult = {
  id: Product["id"]
  name: Product["title"]
  image?: string
}

const searchProducts =
  (connection: Connection) => async (embedding: Product["embedding"]) =>
    connection.query<SearchResult>(
      `
        SELECT
          ${PRODUCTS.id},
          ${PRODUCTS.title} AS name,
          ${PRODUCTS.images}[1] AS image
        FROM ${PRODUCTS}
        ORDER BY ${PRODUCTS.embedding} <-> $1
        LIMIT 24;
      `,
      [`[${embedding.join(",")}]`],
    )

export default searchProducts
