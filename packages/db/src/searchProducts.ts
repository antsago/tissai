import { sql } from "kysely"
import { Connection } from "./Connection.js"
import { Product, Offer, builder } from "./tables/index.js"

export type SearchParams = {
  query: string
  brand?: Product["brand"] | null
  category?: Product["category"] | null
  min?: Offer["price"] | null
  max?: Offer["price"] | null
  tags?: Product["tags"]
  attributes?: { [label: string]: string[] }
}

export const buildSearchQuery = ({
  query: searchQuery,
  min,
  max,
  tags = [],
  brand,
  category,
  attributes = {},
}: SearchParams) => {
  let query = builder
    .selectFrom("products")
    .innerJoin("offers", "offers.product", "products.id")
    .leftJoin("attributes", "attributes.product", "products.id")
    .select(({ fn, selectFrom, ref }) => [
      "products.id",
      "products.title",
      sql<string>`${ref("products.images")}[1]`.as("image"),
      fn.min<string>("offers.price").as("price"),
      selectFrom("brands")
        .select(({ fn }) => fn.jsonAgg("brands").as("brand"))
        .whereRef("brands.name", "=", "products.brand")
        .as("brand"),
    ])
    .groupBy("products.id")
    .orderBy(
      ({ val, fn }) =>
        fn<number>("ts_rank", [
          fn("to_tsvector", [val("spanish"), "products.title"]),
          fn("websearch_to_tsquery", [val("spanish"), val(searchQuery)]),
        ]),
      "desc",
    )
    .limit(24)

  query = query.where((eb) =>
        eb.and(
          Object.entries(attributes).map(([label, values]) =>
            eb.or(
              values.map((value) =>
                eb.and([
                  eb("attributes.label", "=", label),
                  eb("attributes.value", "=", value),
                ]),
              ),
            ),
          ),
        ),
      )
  query =
    category !== null && category !== undefined
      ? query.where("products.category", "=", category)
      : query
  query =
    brand !== null && brand !== undefined
      ? query.where("products.brand", "=", brand)
      : query
  query = tags.reduce(
    (q, t) => q.where((eb) => eb(eb.val(t), "=", eb.fn.any("products.tags"))),
    query,
  )
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

const searchProducts =
  (connection: Connection) => async (parameters: SearchParams) => {
    const response = await connection.query(buildSearchQuery(parameters))

    return response.map((p) => ({
      ...p,
      brand: p.brand?.[0],
      price: p.price ? parseFloat(p.price) : undefined,
    }))
  }

export type Search = Awaited<ReturnType<ReturnType<typeof searchProducts>>>
export default searchProducts
