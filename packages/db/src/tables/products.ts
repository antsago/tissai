import { Connection } from "../Connection.js"
import { TABLE as BRANDS } from "./brands.js"

export const TABLE = Object.assign("products", {
  id: "id",
  title: "title",
  description: "description",
  images: "images",
  brand: "brand",
})

export const initialize = (connection: Connection) =>
  connection.raw(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      ${TABLE.id}             uuid PRIMARY KEY,
      ${TABLE.title}          text NOT NULL,
      ${TABLE.description}    text,
      ${TABLE.images}         text[],
      ${TABLE.brand}          text REFERENCES ${BRANDS}
    );`)
