import knex from "knex"
import { Connection } from "./Connection.js"
import {
  PRODUCTS,
  BRANDS,
  Product,
  Brand,
  formatEmbedding,
  OFFERS,
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
  price?: string,
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
      .select(`p.${PRODUCTS.id}`)
      .select(`p.${PRODUCTS.title}`)
      .select(`p.${PRODUCTS.images}[1] AS image`)
      .select(builder.raw("JSON_AGG(b.*) AS brand"))
      .min(`o.${OFFERS.price} AS price`)
      .from(`${PRODUCTS.toString()} AS p`)
      .leftJoin(`${BRANDS} AS b`, `b.${BRANDS.name}`, "=", `p.${PRODUCTS.brand}`)
      .join(`${OFFERS} AS o`, `o.${OFFERS.product}`, "=", `p.${PRODUCTS.id}`)
      .where(filters)
      .groupBy(`p.${PRODUCTS.id}`)
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
      price: p.price ? parseFloat(p.price) : undefined,
    }))
  }

export type Search = Awaited<ReturnType<ReturnType<typeof searchProducts>>>
export default searchProducts
