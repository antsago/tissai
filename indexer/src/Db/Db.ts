import createInserts from "./createInserts.js"
import { Connection } from "./Connection.js"
import * as traces from "./traces.js"

export const Db = (database?: string) => {
  const connection = Connection(database)

  const insert = createInserts(connection)
  const createTracesTable = traces.initialize(connection)
  const createSellersTable = () => connection.query(`
    CREATE TABLE sellers (
      name            text PRIMARY KEY
    );`
  )
  const initialize = () => Promise.all([
    createTracesTable(),
    createSellersTable(),
  ])

  return {
    ...connection,
    insert,
    initialize,
  }
}

export type Db = ReturnType<typeof Db>
