import { Connection } from "../Connection.js"
import { TABLE as SITES } from "./sites.js"

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
  create: ({ id, url, body, site }: Page) =>
    connection.raw(
      `INSERT INTO ${TABLE} (
        ${TABLE.id}, ${TABLE.url}, ${TABLE.body}, ${TABLE.site}
      ) VALUES (
        $1, $2, $3, $4
      );`,
      [id, url, body, site],
    ),

  getAll: async () => connection.raw<Page>(`SELECT * FROM ${TABLE};`),
})
