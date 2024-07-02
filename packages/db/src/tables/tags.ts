import { Connection } from "../Connection.js"

export type Tag = {
  name: string
}

export const TABLE = Object.assign("tags", {
  name: "name",
})

export const initialize = (connection: Connection) =>
  connection.raw(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      ${TABLE.name}   text PRIMARY KEY
    );`)

export const crud = (connection: Connection) => ({
  create: (tag: Tag) =>
    connection.raw(
      `INSERT INTO ${TABLE} (${TABLE.name}) VALUES ($1) ON CONFLICT DO NOTHING;`,
      [tag.name],
    ),

  getAll: async () => connection.raw<Tag>(`SELECT * FROM ${TABLE};`),
})
