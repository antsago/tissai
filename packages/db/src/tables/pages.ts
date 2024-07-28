import { Connection } from "../Connection.js"
import { TABLE as SITES } from "./sites.js"
import builder, { type Page } from "./queryBuilder.js"

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

export const queries = {
  create: (page: Page) => builder.insertInto("pages").values(page).compile(),
  getAll: () => builder.selectFrom("pages").selectAll().compile(),
}
