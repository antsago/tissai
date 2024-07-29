import { Connection } from "../Connection.js"
import { SITES } from "./sites.js"

export const PAGES = Object.assign("pages", {
  id: "id",
  url: "url",
  body: "body",
  site: "site",
})

export const initialize = (connection: Connection) =>
  connection.raw(`
    CREATE TABLE IF NOT EXISTS ${PAGES} (
      ${PAGES.id}       uuid PRIMARY KEY,
      ${PAGES.url}      text UNIQUE NOT NULL,
      ${PAGES.body}     text NOT NULL,
      ${PAGES.site}     uuid NOT NULL REFERENCES ${SITES}
    );
  `)
