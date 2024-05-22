import { Connection } from "../Connection.js"
import * as traces from "./traces.js"

export const TABLE = Object.assign("tags", {
  name: "name",
})

export const create =
  (connection: Connection) => (pageId: string, name: string) =>
    Promise.all([
      connection.query(`INSERT INTO ${TABLE} (${TABLE.name}) VALUES ($1);`, [
        name,
      ]),
      traces.create(connection)(pageId, TABLE.toString(), name),
    ])

export const initialize = (connection: Connection) =>
  connection.query(`
    CREATE TABLE ${TABLE} (
      ${TABLE.name}   text PRIMARY KEY
    );`)
