import { Connection } from "../Connection.js"

export type Seller = {
  name: string
}

export const TABLE = Object.assign("sellers", {
  name: "name",
})

export const create =
  (connection: Connection) => (seller: Seller) =>
    connection.query(
      `INSERT INTO ${TABLE} (${TABLE.name}) VALUES ($1) ON CONFLICT DO NOTHING;`,
      [seller.name],
    )

export const initialize = (connection: Connection) =>
  connection.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      ${TABLE.name}   text PRIMARY KEY
    );`)
