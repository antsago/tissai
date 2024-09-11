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

export const Definitions = {
  attributes: sharedQueries<Attribute>("attributes"),
  schemas: sharedQueries<Schema>("schemas"),
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
