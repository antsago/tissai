import type { Brand } from "../../../tables.js"
import { type CompiledQuery, sql } from "kysely"
import builder from "../../builder.js"

export type SearchParams = {
  query: string
  brand?: string
  min?: number
  max?: number
  category?: string
  attributes?: string[]
}

const PRODUCT_LIMIT = 20

export const search = ({
  query: searchQuery,
  min,
  max,
  brand,
  category,
  attributes = [],
}: SearchParams) => {
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

  query =
    category !== null && category !== undefined
      ? query.where("products.category", "=", category)
      : query
  query = !!attributes?.length
    ? query
        .where("attributes.value", "in", attributes)
        .having(({ fn }) => fn.count("attributes.id"), "=", attributes.length)
    : query
  query =
    brand !== null && brand !== undefined
      ? query.where("products.brand", "=", brand)
      : query
  query =
    min !== null && min !== undefined
      ? query.where("offers.price", ">=", min)
      : query
  query =
    max !== null && max !== undefined
      ? query.where("offers.price", "<=", max)
      : query

  return query.compile()
}

type Query = ReturnType<typeof search>
export type Search = Query extends CompiledQuery<infer T> ? T : never

export default search
