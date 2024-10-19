import { Connection } from "./Connection.js"
import initialize from "./initializeDb/index.js"
import { executors } from "./queries/index.js"

export const Db = (...args: Parameters<typeof Connection>) => {
  const connection = Connection(...args)

  return {
    ...connection,
    ...executors(connection),
    initialize: () => initialize(connection),
  }
}

export type Db = ReturnType<typeof Db>
