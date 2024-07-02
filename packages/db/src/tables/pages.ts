import { Connection } from "../Connection.js"
import { TABLE as SITES } from "./sites.js"
import builder from "./queryBuilder.js"

export type Page = {
  id: string
  url: string
  body: string
  site: string
}

export const TABLE = Object.assign("pages", {
  id: "id",
  url: "url",
  body: "body",
  site: "site",
})

export const initialize = (connection: Connection) =>
  connection.raw(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      ${TABLE.id}       uuid PRIMARY KEY,
      ${TABLE.url}      text UNIQUE NOT NULL,
      ${TABLE.body}     text NOT NULL,
      ${TABLE.site}     uuid NOT NULL REFERENCES ${SITES}
    );
  `)

export const crud = (connection: Connection) => ({
  create: (page: Page) =>
    connection.query(builder.insertInto("pages").values(page).compile()),
  getAll: async () =>
    connection.query(builder.selectFrom("pages").selectAll().compile()),
})
