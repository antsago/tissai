import { Connection } from "../Connection.js"
import { TABLE as PAGES } from "./pages.js"
import builder from "./queryBuilder.js"

export type Attribute = {
  id: string
  label: string
  value: string
  title: string
}

export const TABLE = Object.assign("attributes", {
  id: "id",
  label: "label",
  value: "value",
  title: "title",
})

export const initialize = (connection: Connection) =>
  connection.raw(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      ${TABLE.id}             uuid PRIMARY KEY,
      ${TABLE.label}          text,
      ${TABLE.value}          text,
      ${TABLE.title}          text
    );`)

export const crud = (connection: Connection) => ({
  create: (attribute: Attribute) =>
    connection.query(
      builder.insertInto("attributes").values(attribute).compile(),
    ),

  getAll: async () =>
    connection.query(builder.selectFrom("attributes").selectAll().compile()),
})
