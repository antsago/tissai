import type { Brand } from "../../../tables.js"
import { type CompiledQuery, sql } from "kysely"
import builder from "../../builder.js"

export type Filters = {
  brand?: string
  max?: number
  min?: number
  category?: {
    id: string
    name: string
  }
  attributes?: {
    label: string
    id: string
    name: string
  }[]
}

const PRODUCT_LIMIT = 20

export const search = (searchQuery: string, filters: Filters = {}) => {
  let query = builder
    .selectFrom("products")
    .innerJoin("offers", "offers.product", "products.id")
    .leftJoin("attributes", "attributes.product", "products.id")
    .select(({ fn, selectFrom, ref }) => [
      "products.id",
      "products.title",
      sql<string | null>`${ref("products.images")}[1]`.as("image"),
      fn.min<number | null>("offers.price").as("price"),
      selectFrom("brands")
        .select(({ fn }) => sql<Brand>`${fn.jsonAgg("brands")}->0`.as("brand"))
        .whereRef("brands.name", "=", "products.brand")
        .as("brand"),
    ])
    .groupBy("products.id")
    .orderBy(
      ({ fn, val }) =>
        fn<number>("ts_rank", [
          fn("to_tsvector", [val("spanish"), "products.title"]),
          fn("websearch_to_tsquery", [val("spanish"), val(searchQuery)]),
        ]),
      "desc",
    )
    .limit(PRODUCT_LIMIT)

  const { min, max, brand, category, attributes } = filters

  query =
    category !== undefined
      ? query.where("products.category", "=", category.id)
      : query
  query = !!attributes?.length
    ? query
        .where(
          "attributes.value",
          "in",
          attributes.map((a) => a.id),
        )
        .having(({ fn }) => fn.count("attributes.id").distinct(), "=", attributes.length)
    : query
  query =
    brand !== undefined ? query.where("products.brand", "=", brand) : query
  query = min !== undefined ? query.where("offers.price", ">=", min) : query
  query = max !== undefined ? query.where("offers.price", "<=", max) : query

  return query.compile()
}

type Query = ReturnType<typeof search>
export type Search = Query extends CompiledQuery<infer T> ? T : never

export default search
