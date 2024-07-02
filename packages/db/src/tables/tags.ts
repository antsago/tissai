import { Connection } from "../Connection.js"
import builder from "./queryBuilder.js"

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
    connection.query(
      builder
        .insertInto("tags")
        .onConflict((oc) => oc.doNothing())
        .values(tag)
        .compile(),
    ),

  getAll: async () =>
    connection.query(builder.selectFrom("tags").selectAll().compile()),
})
