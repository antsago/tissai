import knex from "knex"
import { Connection } from "./Connection.js"
import {
  PRODUCTS,
  BRANDS,
  Product,
  Brand,
  formatEmbedding,
} from "./tables/index.js"

export type SearchParams = {
  embedding: Product["embedding"]
  brand?: Product["brand"] | null
  category?: Product["category"] | null
}
type SearchResult = {
  id: Product["id"]
  title: Product["title"]
  brand: [Brand | null]
  image?: string
}

const builder = knex({ client: "pg" })

const searchProducts =
  (connection: Connection) =>
  async ({ embedding, ...parameters }: SearchParams) => {
    const filters = Object.fromEntries(
      Object.entries(parameters).filter(
        ([k, v]) => v !== undefined && v !== null,
      ),
    )
    const query = builder
      .select(PRODUCTS.id, PRODUCTS.title)
      .select(`${PRODUCTS.images}[1] AS image`)
      .select(builder.raw("JSON_AGG(b.*) AS brand"))
      .from(PRODUCTS.toString())
      .leftJoin(` ${BRANDS} AS b`, `b.${BRANDS.name}`, "=", PRODUCTS.brand)
      .where(filters)
      .groupBy(PRODUCTS.id)
      .orderByRaw(":column: <-> :value", {
        column: PRODUCTS.embedding,
        value: formatEmbedding(embedding),
      })
      .limit(24)
      .toString()

    const response = await connection.query<SearchResult>(query)

    return response.map((p) => ({
      ...p,
      brand: p.brand[0] ?? undefined,
    }))
  }

export type Search = Awaited<ReturnType<ReturnType<typeof searchProducts>>>
export default searchProducts
