import { Connection } from "../Connection.js"
import builder, { type Site } from "./queryBuilder.js"

export const TABLE = Object.assign("sites", {
  id: "id",
  name: "name",
  icon: "icon",
  domain: "domain",
  sitemaps: "sitemaps",
  sitemapWhitelist: "sitemapWhitelist",
  urlKeywords: "urlKeywords",
})

export const initialize = (connection: Connection) =>
  connection.raw(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      ${TABLE.id}                   uuid PRIMARY KEY,
      ${TABLE.name}                 text NOT NULL,
      ${TABLE.icon}                 text NOT NULL,
      ${TABLE.domain}               text UNIQUE NOT NULL,
      ${TABLE.sitemaps}             text[],
      ${TABLE.sitemapWhitelist}     text[],
      ${TABLE.urlKeywords}          text[]
    );
  `)

export const queries = {
  create: (site: Site) => builder.insertInto("sites").values(site).compile(),
  getAll: () => builder.selectFrom("sites").selectAll().compile(),
}
export const crud = (connection: Connection) => ({
  create: (site: Site) => connection.query(queries.create(site)),
  getAll: () => connection.query(queries.getAll()),
})
