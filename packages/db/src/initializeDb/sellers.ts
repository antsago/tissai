import { Connection } from "../Connection.js"

export const SELLERS = Object.assign("sellers", {
  name: "name",
})

export const initialize = (connection: Connection) =>
  connection.raw(`
    CREATE TABLE IF NOT EXISTS ${SELLERS} (
      ${SELLERS.name}   text PRIMARY KEY
    );`)
