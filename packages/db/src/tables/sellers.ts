import { Connection } from "../Connection.js"

export const TABLE = Object.assign("sellers", {
  name: "name",
})

export const initialize = (connection: Connection) =>
  connection.raw(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      ${TABLE.name}   text PRIMARY KEY
    );`)
