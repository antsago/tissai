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

export const crud = (connection: Connection) => ({
  create: (site: Site) =>
    connection.query(builder.insertInto("sites").values(site).compile()),

  getAll: async () =>
    connection.query(builder.selectFrom("sites").selectAll().compile()),
})
