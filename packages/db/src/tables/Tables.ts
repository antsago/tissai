import type { CompiledQuery } from "kysely"
import { Connection } from "../Connection.js"
import * as sellers from "./sellers.js"
import * as brands from "./brands.js"
import * as products from "./products.js"
import * as offers from "./offers.js"
import * as sites from "./sites.js"
import * as pages from "./pages.js"
import * as attributes from "./attributes.js"

const TABLE_MODULES = {
  attributes,
  brands,
  offers,
  pages,
  products,
  sellers,
  sites,
}
type TABLE_MODULES = typeof TABLE_MODULES

type Queries = {
  [T in keyof TABLE_MODULES]: {
    [M in keyof TABLE_MODULES[T]["queries"]]: TABLE_MODULES[T]["queries"][M] extends {
      query: infer Q
      takeFirst: boolean
    }
      ? Q
      : TABLE_MODULES[T]["queries"][M]
  }
}
export const queries = Object.fromEntries(
  Object.entries(TABLE_MODULES).map(([tableName, table]) => [
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
  [T in keyof TABLE_MODULES]: {
    [M in keyof TABLE_MODULES[T]["queries"]]: TABLE_MODULES[T]["queries"][M] extends {
      query: any
      takeFirst: boolean
    }
      ? TABLE_MODULES[T]["queries"][M]["query"] extends (
          ...args: infer I
        ) => CompiledQuery<infer R>
        ? (...args: I) => Promise<R>
        : never
      : TABLE_MODULES[T]["queries"][M] extends (
            ...args: infer I
          ) => CompiledQuery<infer R>
        ? (...args: I) => Promise<R[]>
        : never
  }
}

export const methods = (connection: Connection) =>
  Object.fromEntries(
    Object.entries(TABLE_MODULES).map(([tableName, table]) => [
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

const Tables = (connection: Connection) => ({
  initialize: async () => {
    const initializeInParalel = (tables: Partial<TABLE_MODULES>) =>
      Promise.all(
        Object.values(tables).map((table) => table.initialize(connection)),
      )

    const { sites, brands, sellers, pages, products, ...others } = TABLE_MODULES

    await initializeInParalel({ sites, brands, sellers })
    await initializeInParalel({ pages, products })
    await initializeInParalel(others)
  },
})

export default Tables
