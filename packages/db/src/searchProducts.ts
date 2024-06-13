import { Connection } from "./Connection.js"
import { PRODUCTS, BRANDS, Product, Brand } from "./tables/index.js"

type SearchResult = {
  id: Product["id"]
  title: Product["title"]
  brand: [Brand | null]
  image?: string
}

const searchProducts =
  (connection: Connection) => async (embedding: Product["embedding"]) => {
    const response = await connection.query<SearchResult>(
      `
        SELECT
          ${PRODUCTS.id},
          ${PRODUCTS.title},
          ${PRODUCTS.images}[1] AS image,
          JSON_AGG(b.*) AS brand
        FROM
          ${PRODUCTS}
          LEFT JOIN ${BRANDS} AS b ON b.${BRANDS.name} = ${PRODUCTS.brand}
        GROUP BY ${PRODUCTS.id}
        ORDER BY ${PRODUCTS.embedding} <-> $1
        LIMIT 24;
      `,
      [`[${embedding.join(",")}]`],
    )

    return response.map((p) => ({
      ...p,
      brand: p.brand[0] ?? undefined,
    }))
  }

export type Search = Awaited<ReturnType<ReturnType<typeof searchProducts>>>
export default searchProducts
