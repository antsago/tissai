import { queries as sellers } from "./sellers.js"
import { queries as brands } from "./brands.js"
import { queries as products } from "./products.js"
import { queries as offers } from "./offers.js"
import { queries as sites } from "./sites.js"
import { queries as pages } from "./pages.js"
import { queries as attributes } from "./attributes.js"

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
