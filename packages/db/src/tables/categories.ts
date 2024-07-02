import { Connection } from "../Connection.js"

export type Category = {
  name: string
}

export const TABLE = Object.assign("categories", {
  name: "name",
})

export const initialize = (connection: Connection) =>
  connection.raw(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      ${TABLE.name}   text PRIMARY KEY
    );`)

export const crud = (connection: Connection) => ({
  create: async (category: Category) =>
    connection.raw(
      `INSERT INTO ${TABLE}
      (${TABLE.name}) VALUES ($1)
    ON CONFLICT DO NOTHING;`,
      [category.name],
    ),
  getAll: async () => connection.raw<Category>(`SELECT * FROM ${TABLE};`),
})
