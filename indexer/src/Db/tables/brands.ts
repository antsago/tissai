import { Connection } from "../Connection.js"
import * as traces from "./traces.js"

export type Brand = {
  name: string
  logo?: string
}

export const TABLE = Object.assign("brands", {
  name: "name",
  logo: "logo",
})

export const create =
  (connection: Connection) => (pageId: string, brand: Brand) =>
    Promise.all([
      connection.query(
        `INSERT INTO ${TABLE} (
          ${TABLE.name}, ${TABLE.logo}
        ) VALUES ($1, $2) ON CONFLICT DO NOTHING;`,
        [brand.name, brand.logo],
      ),
      traces.create(connection)(pageId, TABLE.toString(), brand.name),
    ])

export const initialize = (connection: Connection) =>
  connection.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      ${TABLE.name}   text PRIMARY KEY,
      ${TABLE.logo}   text
    );`)
