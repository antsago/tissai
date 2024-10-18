import { Connection } from "../Connection.js"
import { NODES } from "./nodes.js"
import { PRODUCTS } from "./products.js"

export const ATTRIBUTES = Object.assign("attributes", {
  id: "id",
  value: "value",
  product: "product",
})

export const initialize = (connection: Connection) =>
  connection.raw(`
    CREATE TABLE IF NOT EXISTS ${ATTRIBUTES} (
      ${ATTRIBUTES.id}             uuid PRIMARY KEY,
      ${ATTRIBUTES.value}          uuid NOT NULL REFERENCES ${NODES},
      ${ATTRIBUTES.product}        uuid NOT NULL REFERENCES ${PRODUCTS}
    );`)
