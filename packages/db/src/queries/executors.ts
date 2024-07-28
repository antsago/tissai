import type { CompiledQuery } from "kysely"
import { Connection } from "../Connection.js"
import { Definitions } from "./queries.js"

type Executors = {
  [T in keyof Definitions]: {
    [M in keyof Definitions[T]["queries"]]: Definitions[T]["queries"][M] extends {
      query: any
      takeFirst: boolean
    }
      ? Definitions[T]["queries"][M]["query"] extends (
          ...args: infer I
        ) => CompiledQuery<infer R>
        ? (...args: I) => Promise<R>
        : never
      : Definitions[T]["queries"][M] extends (
            ...args: infer I
          ) => CompiledQuery<infer R>
        ? (...args: I) => Promise<R[]>
        : never
  }
}

const createExecutors = (connection: Connection) =>
  Object.fromEntries(
    Object.entries(Definitions).map(([tableName, table]) => [
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
