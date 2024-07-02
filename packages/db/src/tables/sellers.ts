import { Connection } from "../Connection.js"

export type Seller = {
  name: string
}

export const TABLE = Object.assign("sellers", {
  name: "name",
})

export const initialize = (connection: Connection) =>
  connection.raw(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      ${TABLE.name}   text PRIMARY KEY
    );`)

export const crud = (connection: Connection) => ({
  create: (seller: Seller) =>
    connection.raw(
      `INSERT INTO ${TABLE}
      (${TABLE.name}) VALUES ($1)
    ON CONFLICT DO NOTHING;`,
      [seller.name],
    ),

  getAll: async () => connection.raw<Seller>(`SELECT * FROM ${TABLE};`),
})
