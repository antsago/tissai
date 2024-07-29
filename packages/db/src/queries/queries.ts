import type {
  Brand,
  Offer,
  Page,
  Product,
  Attribute,
  Seller,
  Site,
} from "../types.js"
import sharedQueries from "./sharedQueries.js"
import createSeller from "./createSeller.js"
import * as brands from "./brands.js"
import getProductDetails from "./getProductDetails.js"

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
  },
  sellers: {
    ...sharedQueries<Seller>("sellers"),
    create: createSeller,
  },
  sites: sharedQueries<Site>("sites"),
}
export type Definitions = typeof Definitions

type Queries = {
  [T in keyof Definitions]: {
    [M in keyof Definitions[T]]: Definitions[T][M] extends {
      query: infer Q
      takeFirst: boolean
    }
      ? Q
      : Definitions[T][M]
  }
}

const builders = Object.fromEntries(
  Object.entries(Definitions).map(([tableName, table]) => [
    tableName,
    Object.fromEntries(
      Object.entries(table).map(([methodName, query]) => [
        methodName,
        typeof query === "function" ? query : query.query,
      ]),
    ),
  ]),
) as Queries

export default builders
