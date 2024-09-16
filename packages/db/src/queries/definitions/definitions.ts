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
import * as schemas from "./schemas.js"
import builder from "../builder.js"

export const Definitions = {
  attributes: sharedQueries<Attribute>("attributes"),
  schemas: {
    ...sharedQueries<Schema>("schemas"),
    ...schemas,
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
  suggestions: {
    category: {
      takeFirst: true,
      query: (words: string[]) => builder
    .with("category_counts", (db) => db
      .selectFrom("schemas")
      .select(
        "schemas.category",
      )
      .where("schemas.label", "=", "categoría")
      .where((eb) => eb("schemas.value", "=", eb.fn.any(eb.val(words))))
      .orderBy(({ fn }) => fn.agg("mul", ["schemas.tally"]), "desc")
      .groupBy("category")
    )
    .selectFrom("category_counts")
    .select(({ fn, ref, val }) => [
      fn.agg("array_agg", [ref("category_counts.category")]).as("values"),
      val("categoría").as("label"),
    ])
    .compile()
    }
  }
}
export type Definitions = typeof Definitions
