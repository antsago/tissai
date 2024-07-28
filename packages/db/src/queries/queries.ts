import * as sellers from "./sellers.js"
import * as brands from "./brands.js"
import * as products from "./products.js"
import * as offers from "./offers.js"
import * as sites from "./sites.js"
import * as pages from "./pages.js"
import * as attributes from "./attributes.js"

export const Definitions = {
  attributes,
  brands,
  offers,
  pages,
  products,
  sellers,
  sites,
}
export type Definitions = typeof Definitions

type Queries = {
  [T in keyof Definitions]: {
    [M in keyof Definitions[T]["queries"]]: Definitions[T]["queries"][M] extends {
      query: infer Q
      takeFirst: boolean
    }
      ? Q
      : Definitions[T]["queries"][M]
  }
}

const builders = Object.fromEntries(
  Object.entries(Definitions).map(([tableName, table]) => [
    tableName,
    Object.fromEntries(
      Object.entries(table.queries).map(([methodName, query]) => [
        methodName,
        typeof query === "function" ? query : query.query,
      ]),
    ),
  ]),
) as Queries

export default builders
