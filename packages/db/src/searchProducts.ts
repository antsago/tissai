import { sql } from "kysely"
import { Connection } from "./Connection.js"
import {
  Product,
  Brand,
  formatEmbedding,
  Offer,
  builder,
} from "./tables/index.js"

export type SearchParams = {
  embedding: Product["embedding"]
  brand?: Product["brand"] | null
  category?: Product["category"] | null
  min?: Offer["price"] | null
  max?: Offer["price"] | null
  tags?: Product["tags"]
}
type SearchResult = {
  id: Product["id"]
  title: Product["title"]
  brand?: [Brand]
  image?: string
  price?: string
}

export const buildSearchQuery = ({
  embedding,
  min,
  max,
  tags = [],
  ...parameters
}: SearchParams) => {
  const filters = Object.fromEntries(
    Object.entries(parameters).filter(
      ([k, v]) => v !== undefined && v !== null,
    ),
  )
  let query = builder
    .selectFrom("products")
    .innerJoin("offers", "product", "products.id")
    .select(({ fn, selectFrom }) => [
      "products.id",
      "title",
      sql<string>`images[1]`.as("image"),
      fn.min<string>("price").as("price"),
      selectFrom("brands")
        .select(({ fn }) => [fn.jsonAgg("brands").as("brand")])
        .whereRef("brands.name", "=", "products.brand")
        .as("brand"),
    ])
    .where(({ and }) => and(filters))
    .groupBy("products.id")
    .orderBy(sql`embedding <-> ${formatEmbedding(embedding)}`)
    .limit(24)

  query = tags.reduce(
    (q, t) => q.where((eb) => eb(eb.val(t), "=", eb.fn.any("tags"))),
    query,
  )

  query =
    min !== null && min !== undefined ? query.where("price", ">=", min) : query
  query =
    max !== null && max !== undefined ? query.where("price", "<=", max) : query

  return query.compile()
}

const searchProducts =
  (connection: Connection) => async (parameters: SearchParams) => {
    const query = buildSearchQuery(parameters)

    const response = await connection.query<SearchResult>(
      query.sql,
      query.parameters as any[],
    )

    return response.map((p) => ({
      ...p,
      brand: p.brand?.[0],
      price: p.price ? parseFloat(p.price) : undefined,
    }))
  }

export type Search = Awaited<ReturnType<ReturnType<typeof searchProducts>>>
export default searchProducts
