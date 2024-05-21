import createInserts from "./createInserts.js"
import { Connection } from "./Connection.js"

export const Db = (database?: string) => {
  const connection = Connection(database)

  const insert = createInserts(connection)
  const createTracesTable = () => connection.query(`
    CREATE TABLE traces (
      id              uuid PRIMARY KEY,
      timestamp       timestamp with time zone,
      page_of_origin  uuid,
      object_table    text,
      object_id       text
    );`
  )
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
