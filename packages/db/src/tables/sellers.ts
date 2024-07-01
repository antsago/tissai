import { Connection } from "../Connection.js"

export type Seller = {
  name: string
}

export const TABLE = Object.assign("sellers", {
  name: "name",
})

export const initialize = (connection: Connection) =>
  connection.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      ${TABLE.name}   text PRIMARY KEY
    );`)

export const crud = (connection: Connection) => ({
  create: (seller: Seller) =>
    connection.query(
      `INSERT INTO ${TABLE}
      (${TABLE.name}) VALUES ($1)
    ON CONFLICT DO NOTHING;`,
      [seller.name],
    ),

  getAll: async () => connection.query<Seller>(`SELECT * FROM ${TABLE};`),
})
