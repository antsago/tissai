import { type CompiledQuery, sql } from "kysely"
import { jsonBuildObject } from "kysely/helpers/postgres"
import { Product, Brand } from "../../../tables.js"
import builder, { toJsonb } from "../../builder.js"

const getDetails = {
  takeFirst: true,
  query: (productId: Product["id"]) =>
    builder
      .with("similars", (db) =>
        db
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
          .limit(4),
      )
      .selectFrom("products")
      .leftJoin("nodes as category", "category.id", "products.category")
      .leftJoin("offers", "offers.product", "products.id")
      .leftJoin("sites", "offers.site", "sites.id")
      .leftJoin("brands", "brands.name", "products.brand")
      .leftJoin("attributes", "attributes.product", "products.id")
      .leftJoin("nodes as values", "values.id", "attributes.value")
      .leftJoin("nodes as labels", "labels.id", "values.parent")
      .leftJoin("similars", (join) => join.onTrue())
      .select(({ fn, ref }) => [
        "products.title",
        "products.description",
        "products.images",
        "category.name as category",
        sql<Brand|null>`${fn.jsonAgg("brands")}->0`.as("brand"),
        fn
          .jsonAgg(
            toJsonb(
              jsonBuildObject({
                label: ref("labels.name"),
                value: ref("values.name"),
              }).$notNull(),
            ),
          )
          .filterWhere("values.name", "is not", null)
          .distinct()
          .$castTo<null | { label: string, value: string }[]>()
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
            ),
          )
          .filterWhere("offers.id", "is not", null)
          .distinct()
          .$castTo<null | {
            url: string,
            price: number | null,
            currency: string | null,
            seller: string | null,
            site: {
              name: string,
              icon: string,
            }
          }[]>()
          .as("offers"),
        fn.jsonAgg("similars")
        .filterWhere("similars.id", "is not", null)
        .$castTo<null | {
          id: string,
          title: string,
          image: null | string,
        }[]>()
        .distinct().as("similar"),
      ])
      .where("products.id", "=", productId)
      .groupBy([
        "products.id",
        "products.title",
        "products.description",
        "products.images",
        "category.id",
      ])
      .compile(),
}

type Query = ReturnType<(typeof getDetails)["query"]>
export type ProductDetails = Query extends CompiledQuery<infer T> ? T : never

export default getDetails
