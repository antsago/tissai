import type { CompiledQuery } from "kysely"
import { Connection } from "../Connection.js"
import { Definitions } from "./definitions/index.js"

type Executors = {
  [T in keyof Definitions]: {
    [M in keyof Definitions[T]]: Definitions[T][M] extends {
      query: any
      takeFirst: boolean
    }
      ? Definitions[T][M]["query"] extends (
          ...args: infer I
        ) => CompiledQuery<infer R>
        ? (...args: I) => Promise<R>
        : never
      : Definitions[T][M] extends (...args: infer I) => CompiledQuery<infer R>
        ? (...args: I) => Promise<R[]>
        : never
  }
}

const createExecutors = (connection: Connection) =>
  Object.fromEntries(
    Object.entries(Definitions).map(([tableName, table]) => [
      tableName,
      Object.fromEntries(
        Object.entries(table).map(([methodName, definition]) => [
          methodName,
          async (...args: any[]) => {
            const query = "query" in definition ? definition.query : definition
            const result = await connection.query(query(...args))
            return definition.takeFirst ? result[0] : result
          },
        ]),
      ),
    ]),
  ) as Executors

export default createExecutors
