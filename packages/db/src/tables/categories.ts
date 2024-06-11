import { Connection } from "../Connection.js"

export type Category = {
  name: string
}

export const TABLE = Object.assign("categories", {
  name: "name",
})

export const create = (connection: Connection) => (category: Category) =>
  connection.query(
    `INSERT INTO ${TABLE}
      (${TABLE.name}) VALUES ($1)
    ON CONFLICT DO NOTHING;`,
    [category.name],
  )

export const initialize = (connection: Connection) =>
  connection.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      ${TABLE.name}   text PRIMARY KEY
    );`)

export const getAll = (connection: Connection) => async () =>
  connection.query<Category>(`SELECT * FROM ${TABLE};`)
