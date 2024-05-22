import { Connection } from "./Connection.js"
import Tables from "./tables/index.js"

export const Db = (database?: string) => {
  const connection = Connection(database)
  const tables = Tables(connection)

  const initialize = async () => {
    await connection.query("CREATE EXTENSION vector;")
    await tables.initialize()
  }

  return {
    ...connection,
    ...tables.crud,
    initialize,
  }
}

export type Db = ReturnType<typeof Db>
