import { Connection } from "../Connection.js"
import { TABLE as BRANDS } from "./brands.js"
import builder, { type Product } from "./queryBuilder.js"

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

export const queries = {
  create: (product: Product) =>builder.insertInto("products").values(product).compile(),
  getAll: () => builder.selectFrom("products").selectAll().compile(),
}
export const crud = (connection: Connection) => ({
  create: (product: Product) =>
    connection.query(queries.create(product)),

  getAll: () => connection.query(queries.getAll()),
})
