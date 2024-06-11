import { Connection } from "../Connection.js"

export type Tag = {
  name: string
}

export const TABLE = Object.assign("tags", {
  name: "name",
})

export const create = (connection: Connection) => (tag: Tag) =>
  connection.query(
    `INSERT INTO ${TABLE} (${TABLE.name}) VALUES ($1) ON CONFLICT DO NOTHING;`,
    [tag.name],
  )

export const initialize = (connection: Connection) =>
  connection.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      ${TABLE.name}   text PRIMARY KEY
    );`)

export const getAll = (connection: Connection) => async () =>
  connection.query<Tag>(`SELECT * FROM ${TABLE};`)
