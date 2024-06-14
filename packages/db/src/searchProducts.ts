import { PRODUCT } from "../__tests__/utils/fakes.js"
import { Connection } from "./Connection.js"
import { PRODUCTS, BRANDS, Product, Brand } from "./tables/index.js"

type Input = {
  embedding: Product["embedding"]
  brand?: Product["brand"]
}
type SearchResult = {
  id: Product["id"]
  title: Product["title"]
  brand: [Brand | null]
  image?: string
}

const searchProducts =
  (connection: Connection) => async ({ embedding, brand }: Input) => {
    const inputs = brand ? [`[${embedding.join(",")}]`, brand] : [`[${embedding.join(",")}]`]
    const filter =  brand ? `WHERE ${PRODUCTS.brand} = $2` : ""
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
        ${filter}
        GROUP BY ${PRODUCTS.id}
        ORDER BY ${PRODUCTS.embedding} <-> $1
        LIMIT 24;
      `,
      inputs,
    )

    return response.map((p) => ({
      ...p,
      brand: p.brand[0] ?? undefined,
    }))
  }

export type Search = Awaited<ReturnType<ReturnType<typeof searchProducts>>>
export default searchProducts
