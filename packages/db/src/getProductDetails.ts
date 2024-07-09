import { sql, RawBuilder } from "kysely"
import { jsonBuildObject } from "kysely/helpers/postgres"
import { Connection } from "./Connection.js"
import { Product, Brand, builder, Attribute } from "./tables/index.js"

function toJsonb<T>(value: RawBuilder<T>): RawBuilder<T> {
  return sql<T>`to_jsonb(${value})`
}

const getProductDetails =
  (connection: Connection) => async (productId: Product["id"]) => {
    const [details] = await connection.query(
      builder
        .selectFrom("products")
        .leftJoin("offers", "offers.product", "products.id")
        .innerJoin("sites", "offers.site", "sites.id")
        .leftJoin("brands", "brands.name", "products.brand")
        .leftJoin("attributes", "attributes.product", "products.id")
        .select(({ fn, ref }) => [
          "products.title",
          "products.description",
          "products.images",
          "products.category",
          "products.tags",
          sql<Brand>`${fn.jsonAgg("brands")}->0`.as("brand"),
          fn
            .jsonAgg(
              toJsonb(jsonBuildObject({
                label: ref("attributes.label"),
                value: ref("attributes.value"),
              }))
            )
            .distinct()
            .as("attributes"),
          fn
            .jsonAgg(
              toJsonb(
              jsonBuildObject({
                url: ref("offers.url"),
                price: ref("offers.price"),
                currency: ref("offers.currency"),
                seller: ref("offers.seller"),
                site: jsonBuildObject({
                  name: ref("sites.name"),
                  icon: ref("sites.icon"),
                }),
              }),
              )
            )
            .distinct()
            .as("offers"),
        ])
        .where("products.id", "=", productId)
        .groupBy("products.id")
        .compile(),
    )
    const similar = await connection.query(
      builder
        .selectFrom("products")
        .select(({ ref }) => [
          "id",
          "title",
          sql<string | undefined>`${ref("images")}[1]`.as("image"),
        ])
        .where("products.id", "!=", productId)
        .orderBy(
          ({ fn, val, ref, eb }) =>
            fn("ts_rank_cd", [
              fn("to_tsvector", [val("spanish"), ref("products.title")]),
              sql`replace(${fn("plainto_tsquery", [
                val("spanish"),
                eb
                  .selectFrom("products")
                  .select("title")
                  .where("products.id", "=", productId),
              ])}::text, '&', '|')::tsquery`,
            ]),
          "desc",
        )
        .limit(4)
        .compile(),
    )

    return {
      ...details,
      similar,
    }
  }

export type ProductDetails = Awaited<
  ReturnType<ReturnType<typeof getProductDetails>>
>
export default getProductDetails
