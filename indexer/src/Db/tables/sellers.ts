import { Connection } from "../Connection.js"
import * as traces from "./traces.js"

export type Seller = {
  name: string
}

export const TABLE = Object.assign("sellers", {
  name: "name",
})

export const create =
  (connection: Connection) => (pageId: string, seller: Seller) =>
    Promise.all([
      connection.query(
        `INSERT INTO ${TABLE} (${TABLE.name}) VALUES ($1) ON CONFLICT DO NOTHING;`,
        [seller.name],
      ),
      traces.create(connection)(pageId, TABLE.toString(), seller.name),
    ])

export const initialize = (connection: Connection) =>
  connection.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      ${TABLE.name}   text PRIMARY KEY
    );`)
