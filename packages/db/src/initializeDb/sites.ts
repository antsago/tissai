import { Connection } from "../Connection.js"

export const SITES = Object.assign("sites", {
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
    CREATE TABLE IF NOT EXISTS ${SITES} (
      ${SITES.id}                   uuid PRIMARY KEY,
      ${SITES.name}                 text NOT NULL,
      ${SITES.icon}                 text NOT NULL,
      ${SITES.domain}               text UNIQUE NOT NULL,
      ${SITES.sitemaps}             text[],
      ${SITES.sitemapWhitelist}     text[],
      ${SITES.urlKeywords}          text[]
    );
  `)
