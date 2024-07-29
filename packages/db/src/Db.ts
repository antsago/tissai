import { Connection } from "./Connection.js"
import initialize from "./initializeDb/index.js"
import { executors } from "./queries/index.js"

export const Db = (database?: string) => {
  const connection = Connection(database)

  return {
    ...connection,
    ...executors(connection),
    initialize: () => initialize(connection),
  }
}

export type Db = ReturnType<typeof Db>
