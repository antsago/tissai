import { Connection } from "../Connection.js"

export type Site = {
  id: string
  name: string
  icon: string
  domain: string
  sitemaps?: string[]
  sitemapWhitelist?: string[]
  urlKeywords?: string[]
}

export const TABLE = Object.assign("sites", {
  id: "id",
  name: "name",
  icon: "icon",
  domain: "domain",
  sitemaps: "sitemaps",
  sitemapWhitelist: "sitemapWhitelist",
  urlKeywords: "urlKeywords",
})

export const create =
  (connection: Connection) =>
  ({ id, name, icon, domain, sitemaps, sitemapWhitelist, urlKeywords }: Site) =>
    connection.query(
      `INSERT INTO ${TABLE} (
        ${TABLE.id},
        ${TABLE.name},
        ${TABLE.icon},
        ${TABLE.domain},
        ${TABLE.sitemaps},
        ${TABLE.sitemapWhitelist},
        ${TABLE.urlKeywords}
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7
      );`,
      [id, name, icon, domain, sitemaps, sitemapWhitelist, urlKeywords],
    )

export const initialize = (connection: Connection) =>
  connection.query(`
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

export const getAll =
  (connection: Connection) => async () => connection.query<Site>(`SELECT * FROM ${TABLE};`)
