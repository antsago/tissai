import { Connection } from "../Connection.js"
import { TABLE as PRODUCTS } from "./products.js"
import builder, { type Attribute } from "./queryBuilder.js"

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

export const queries = {
  create: (attribute: Attribute) =>
    builder.insertInto("attributes").values(attribute).compile(),
  getAll: () => builder.selectFrom("attributes").selectAll().compile(),
}
export const crud = (connection: Connection) => ({
  create: (attribute: Attribute) => connection.query(queries.create(attribute)),
  getAll: async () => connection.query(queries.getAll()),
})
