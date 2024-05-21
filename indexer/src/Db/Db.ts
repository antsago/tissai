import createInserts from "./createInserts.js"
import { Connection } from "./Connection.js"
import { TRACES } from "./createInserts.js"

export const Db = (database?: string) => {
  const connection = Connection(database)

  const insert = createInserts(connection)
  const createTracesTable = () => connection.query(`
    CREATE TABLE ${TRACES} (
      ${TRACES.id}             uuid PRIMARY KEY,
      ${TRACES.timestamp}      timestamp with time zone,
      ${TRACES.page}           uuid,
      ${TRACES.objectTable}    text,
      ${TRACES.objectId}       text
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
