import { sql } from "kysely"
import { Connection } from "./Connection.js"
import { builder, Brand } from "./tables/index.js"

export type SearchParams = {
  query: string
  brand?: string
  category?: string
  min?: number
  max?: number
  tags?: string[]
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
  const PRODUCT_LIMIT = 20
  const SUGGESTION_LIMIT = 4

  let fullQuery = builder
    .with("results", (db) => {
      let query = db
        .selectFrom("products")
        .innerJoin("offers", "offers.product", "products.id")
        .leftJoin("attributes", "attributes.product", "products.id")
        .select(({ fn, selectFrom, ref, val }) => [
          "products.id",
          "products.title",
          sql<string>`${ref("products.images")}[1]`.as("image"),
          fn.min<string>("offers.price").as("price"),
          selectFrom("brands")
            .select(({ fn }) =>
              sql<Brand>`${fn.jsonAgg("brands")}->0`.as("brand"),
            )
            .whereRef("brands.name", "=", "products.brand")
            .as("brand"),
          fn<number>("ts_rank", [
            fn("to_tsvector", [val("spanish"), "products.title"]),
            fn("websearch_to_tsquery", [val("spanish"), val(searchQuery)]),
          ]).as("rank"),
        ])
        .groupBy("products.id")
        .orderBy("rank", "desc")
        .limit(PRODUCT_LIMIT)

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
        (q, t) =>
          q.where((eb) => eb(eb.val(t), "=", eb.fn.any("products.tags"))),
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

      return query
    })
    .with("present_attributes", (db) =>
      db
        .selectFrom("attributes")
        .innerJoin("results", "attributes.product", "results.id")
        .select(({ fn }) => [
          "attributes.label",
          fn.count("results.id").as("tally"),
        ])
        .groupBy("attributes.label")
        .whereRef("attributes.product", "=", "results.id")
        .orderBy("tally")
        .limit(SUGGESTION_LIMIT),
    )
    .with("suggestions", (db) =>
      db
        .selectFrom("present_attributes")
        .innerJoin("results", (join) => join.onTrue())
        .leftJoin("attributes", "attributes.label", "present_attributes.label")
        .select(({ fn, ref }) => [
          "present_attributes.label",
          sql<number>`${ref("present_attributes.tally")}::decimal / ${fn.count("results.id").distinct()}`.as(
            "frequency",
          ),
          fn
            .agg("array_agg", [ref("attributes.value")])
            .distinct()
            .as("values"),
        ])
        .groupBy(["present_attributes.label", "present_attributes.tally"]),
    )
    .selectNoFrom((eb) => [
      eb
        .selectFrom("suggestions")
        .select(({ fn }) => [
          fn.jsonAgg("suggestions").distinct().as("suggestions"),
        ])
        .as("suggestions"),
      eb.fn
        .coalesce(
          eb
            .selectFrom((eb) =>
              eb
                .selectFrom("results")
                .select([
                  "results.id",
                  "results.title",
                  "results.brand",
                  "results.image",
                  "results.price",
                ])
                .orderBy("rank")
                .as("results"),
            )
            .select(({ fn }) => [
              fn.jsonAgg("results").distinct().as("products"),
            ]),
          eb.val([]),
        )
        .as("products"),
    ])

  return fullQuery.compile()
}

const searchProducts =
  (connection: Connection) =>
  async (parameters: Parameters<typeof buildSearchQuery>[0]) => {
    const [response] = await connection.query(buildSearchQuery(parameters))

    return {
      ...response,
      products: response.products?.map((p) => ({
        ...p,
        price: p.price ? parseFloat(p.price) : undefined,
      })),
    }
  }

export type Search = Awaited<ReturnType<ReturnType<typeof searchProducts>>>
export default searchProducts
