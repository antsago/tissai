import type { CompiledQuery } from "kysely"
import { Connection } from "../Connection.js"
import * as sellers from "./sellers.js"
import * as brands from "./brands.js"
import * as products from "./products.js"
import * as offers from "./offers.js"
import * as sites from "./sites.js"
import * as pages from "./pages.js"
import * as attributes from "./attributes.js"

export const QUERY_GROUPINGS = {
  attributes,
  brands,
  offers,
  pages,
  products,
  sellers,
  sites,
}
export type QUERY_GROUPINGS = typeof QUERY_GROUPINGS

type Queries = {
  [T in keyof QUERY_GROUPINGS]: {
    [M in keyof QUERY_GROUPINGS[T]["queries"]]: QUERY_GROUPINGS[T]["queries"][M] extends {
      query: infer Q
      takeFirst: boolean
    }
      ? Q
      : QUERY_GROUPINGS[T]["queries"][M]
  }
}
export const queries = Object.fromEntries(
  Object.entries(QUERY_GROUPINGS).map(([tableName, table]) => [
    tableName,
    Object.fromEntries(
      Object.entries(table.queries).map(([methodName, query]) => [
        methodName,
        typeof query === "function" ? query : query.query,
      ]),
    ),
  ]),
) as Queries

type Methods = {
  [T in keyof QUERY_GROUPINGS]: {
    [M in keyof QUERY_GROUPINGS[T]["queries"]]: QUERY_GROUPINGS[T]["queries"][M] extends {
      query: any
      takeFirst: boolean
    }
      ? QUERY_GROUPINGS[T]["queries"][M]["query"] extends (
          ...args: infer I
        ) => CompiledQuery<infer R>
        ? (...args: I) => Promise<R>
        : never
      : QUERY_GROUPINGS[T]["queries"][M] extends (
            ...args: infer I
          ) => CompiledQuery<infer R>
        ? (...args: I) => Promise<R[]>
        : never
  }
}

export const methods = (connection: Connection) =>
  Object.fromEntries(
    Object.entries(QUERY_GROUPINGS).map(([tableName, table]) => [
      tableName,
      Object.fromEntries(
        Object.entries(table.queries).map(([methodName, queryBuilder]) => [
          methodName,
          async (...args: any[]) => {
            if ("takeFirst" in queryBuilder) {
              const [result] = await connection.query(
                queryBuilder.query(...args),
              )
              return result
            }
            return connection.query(queryBuilder(...args))
          },
        ]),
      ),
    ]),
  ) as Methods
