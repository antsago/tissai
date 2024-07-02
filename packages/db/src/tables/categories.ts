import { Connection } from "../Connection.js"
import builder from "./queryBuilder.js"

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
    connection.query(
      builder
        .insertInto("categories")
        .onConflict((oc) => oc.doNothing())
        .values(category)
        .compile(),
    ),
  getAll: async () =>
    connection.query(builder.selectFrom("categories").selectAll().compile()),
})
