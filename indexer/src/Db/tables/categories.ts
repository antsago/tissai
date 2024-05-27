import { Connection } from "../Connection.js"
import * as traces from "./traces.js"

export type Category = {
  name: string
}

export const TABLE = Object.assign("categories", {
  name: "name",
})

export const create =
  (connection: Connection) => (pageId: string, category: Category) =>
    Promise.all([
      connection.query(`INSERT INTO ${TABLE} (${TABLE.name}) VALUES ($1);`, [
        category.name,
      ]),
      traces.create(connection)(pageId, TABLE.toString(), category.name),
    ])

export const initialize = (connection: Connection) =>
  connection.query(`
    CREATE TABLE ${TABLE} (
      ${TABLE.name}   text PRIMARY KEY
    );`)
