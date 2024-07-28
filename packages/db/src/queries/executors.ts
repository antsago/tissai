import type { CompiledQuery } from "kysely"
import { Connection } from "../Connection.js"
import { QUERY_GROUPINGS } from "./queries.js"

type Executors = {
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

const createExecutors = (connection: Connection) =>
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
  ) as Executors

export default createExecutors
