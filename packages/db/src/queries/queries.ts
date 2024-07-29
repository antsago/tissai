import { Definitions } from "./definitions.js"

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
