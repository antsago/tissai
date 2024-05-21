import createInserts from "./createInserts.js"
import { Connection } from "./Connection.js"
import * as traces from "./traces.js"
import * as sellers from "./sellers.js"
import * as brands from "./brands.js"
import * as categories from "./categories.js"

export const Db = (database?: string) => {
  const connection = Connection(database)

  const insert = createInserts(connection)

  const initialize = () => Promise.all([
    traces.initialize(connection),
    sellers.initialize(connection),
    brands.initialize(connection),
    categories.initialize(connection),
  ])

  return {
    ...connection,
    insert,
    initialize,
  }
}

export type Db = ReturnType<typeof Db>
