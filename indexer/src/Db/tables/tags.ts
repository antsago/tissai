import { Connection } from "../Connection.js"
import * as traces from "./traces.js"

export type Tag = {
  name: string
}

export const TABLE = Object.assign("tags", {
  name: "name",
})

export const create =
  (connection: Connection) => (pageId: string, tag: Tag) =>
    Promise.all([
      connection.query(`INSERT INTO ${TABLE} (${TABLE.name}) VALUES ($1);`, [
        tag.name,
      ]),
      traces.create(connection)(pageId, TABLE.toString(), tag.name),
    ])

export const initialize = (connection: Connection) =>
  connection.query(`
    CREATE TABLE ${TABLE} (
      ${TABLE.name}   text PRIMARY KEY
    );`)
