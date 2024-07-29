import type {
  Brand,
  Offer,
  Page,
  Product,
  Attribute,
  Seller,
  Site,
} from "../../types.js"
import sharedQueries from "./sharedQueries.js"
import createSeller from "./createSeller.js"
import * as brands from "./brands.js"
import getProductDetails from "./getProductDetails.js"
import searchProducts from "./searchProducts.js"

export const Definitions = {
  attributes: sharedQueries<Attribute>("attributes"),
  brands: {
    ...sharedQueries<Brand>("brands"),
    ...brands,
  },
  offers: sharedQueries<Offer>("offers"),
  pages: sharedQueries<Page>("pages"),
  products: {
    ...sharedQueries<Product>("products"),
    getDetails: getProductDetails,
    search: searchProducts,
  },
  sellers: {
    ...sharedQueries<Seller>("sellers"),
    create: createSeller,
  },
  sites: sharedQueries<Site>("sites"),
}
export type Definitions = typeof Definitions
