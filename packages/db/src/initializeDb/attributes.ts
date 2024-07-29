import { Connection } from "../Connection.js"
import { PRODUCTS } from "./products.js"

export const ATTRIBUTES = Object.assign("attributes", {
  id: "id",
  label: "label",
  value: "value",
  product: "product",
})

export const initialize = (connection: Connection) =>
  connection.raw(`
    CREATE TABLE IF NOT EXISTS ${ATTRIBUTES} (
      ${ATTRIBUTES.id}             uuid PRIMARY KEY,
      ${ATTRIBUTES.label}          text NOT NULL,
      ${ATTRIBUTES.value}          text NOT NULL,
      ${ATTRIBUTES.product}        uuid NOT NULL REFERENCES ${PRODUCTS}
    );`)
