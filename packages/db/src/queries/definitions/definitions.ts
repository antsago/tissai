import { sql } from "kysely"
import {
  type Brand,
  type Offer,
  type Page,
  type Product,
  type Attribute,
  type Seller,
  type Site,
  type Schema,
} from "../../types.js"
import sharedQueries from "./sharedQueries.js"
import * as sellers from "./sellers.js"
import * as brands from "./brands.js"
import * as products from "./products/index.js"
import builder from "../builder.js"

export const Definitions = {
  attributes: sharedQueries<Attribute>("attributes"),
  schemas: {
    ...sharedQueries<Schema>("schemas"),
    upsert: (schema: Schema) =>
      builder
        .insertInto("schemas")
        .onConflict((oc) =>
          oc
            .columns(["category", "label", "value"])
            .doUpdateSet({
              tally: ({ ref }) =>
                sql`${ref("schemas.tally")} + ${ref("excluded.tally")}`,
            }),
        )
        .values(schema)
        .compile(),
  },
  brands: {
    ...sharedQueries<Brand>("brands"),
    ...brands,
  },
  offers: sharedQueries<Offer>("offers"),
  pages: sharedQueries<Page>("pages"),
  products: {
    ...sharedQueries<Product>("products"),
    ...products,
  },
  sellers: {
    ...sharedQueries<Seller>("sellers"),
    ...sellers,
  },
  sites: sharedQueries<Site>("sites"),
}
export type Definitions = typeof Definitions
