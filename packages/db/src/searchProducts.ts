import { sql } from "kysely"
import { jsonBuildObject } from "kysely/helpers/postgres"
import { Connection } from "./Connection.js"
import { builder, Brand } from "./tables/index.js"
import { toJsonb } from "./getProductDetails.js"

export type SearchParams = {
  query: string
  brand?: string
  min?: number
  max?: number
  attributes?: { [label: string]: string[] }
}

export const buildSearchQuery = ({
  query: searchQuery,
  min,
  max,
  brand,
  attributes = {},
}: SearchParams) => {
  const PRODUCT_LIMIT = 20
  const SUGGESTION_LIMIT = 4

  type ProductResult = {
    id: string
    title: string
    brand: {
      logo?: string
      name: string
    } | null
    image?: string
    price?: string
  }
  type Suggestion = {
    frequency: number
    label: string
    values: string[]
  }

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
        .orderBy("tally", "desc")
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
      eb.fn
        .coalesce(
          eb
            .selectFrom("suggestions")
            .select(({ fn, ref }) => [
              fn
                .jsonAgg(
                  sql<Suggestion>`"suggestions" ORDER BY ${ref("suggestions.frequency")} desc`,
                )
                .as("suggestions"),
            ]),
          sql<Suggestion[]>`'[]'`,
        )
        .as("suggestions"),
      eb.fn
        .coalesce(
          eb.selectFrom("results").select(({ fn, ref }) =>
            fn
              .jsonAgg(
                sql<ProductResult>`${toJsonb(
                  jsonBuildObject({
                    id: ref("results.id"),
                    title: ref("results.title"),
                    brand: ref("results.brand"),
                    image: ref("results.image"),
                    price: ref("results.price"),
                  }),
                )} ORDER BY ${ref("results.rank")} desc`,
              )
              .as("products"),
          ),
          sql<ProductResult[]>`'[]'`,
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
