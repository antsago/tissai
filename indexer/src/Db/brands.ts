import { Connection } from "./Connection.js"
import * as traces from "./traces.js"

export const TABLE = Object.assign("brands", {
  name: "name",
  logo: "logo",
})

export const create = (connection: Connection) =>
  (pageId: string, name: string, logo: string) => Promise.all([
    connection.query('INSERT INTO brands (name, logo) VALUES ($1, $2);', [name, logo]),
    traces.create(connection)(pageId, TABLE.toString(), name)
  ])

export const initialize = (connection: Connection) =>
  connection.query(`
    CREATE TABLE ${TABLE} (
      ${TABLE.name}   text PRIMARY KEY,
      ${TABLE.logo}   text
    );`
  )