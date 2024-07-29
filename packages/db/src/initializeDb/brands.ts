import { Connection } from "../Connection.js"

export const BRANDS = Object.assign("brands", {
  name: "name",
  logo: "logo",
})

export const initialize = (connection: Connection) =>
  connection.raw(`
    CREATE TABLE IF NOT EXISTS ${BRANDS} (
      ${BRANDS.name}   text PRIMARY KEY,
      ${BRANDS.logo}   text
    );
  `)
