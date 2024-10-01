import type {
  Brand,
  Offer,
  Page,
  Product,
  Attribute,
  Seller,
  Site,
  Node,
} from "../../tables.js"
import sharedQueries from "./sharedQueries.js"
import * as sellers from "./sellers.js"
import * as brands from "./brands.js"
import * as products from "./products/index.js"
import * as nodes from "./nodes.js"
import * as suggestions from "./suggestions.js"

export const Definitions = {
  attributes: sharedQueries<Attribute>("attributes"),
  brands: {
    ...sharedQueries<Brand>("brands"),
    ...brands,
  },
  nodes: {
    ...sharedQueries<Node>("nodes"),
    ...nodes,
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
  suggestions,
}
export type Definitions = typeof Definitions
