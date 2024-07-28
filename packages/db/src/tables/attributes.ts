import { Connection } from "../Connection.js"
import { TABLE as PRODUCTS } from "./products.js"

export const TABLE = Object.assign("attributes", {
  id: "id",
  label: "label",
  value: "value",
  product: "product",
})

export const initialize = (connection: Connection) =>
  connection.raw(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      ${TABLE.id}             uuid PRIMARY KEY,
      ${TABLE.label}          text NOT NULL,
      ${TABLE.value}          text NOT NULL,
      ${TABLE.product}        uuid NOT NULL REFERENCES ${PRODUCTS}
    );`)
