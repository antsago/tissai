import { Connection } from "../Connection.js"
import { TABLE as BRANDS } from "./brands.js"
import { TABLE as CATEGORIES } from "./categories.js"
import builder from "./queryBuilder.js"

export type Product = {
  id: string
  title: string
  category: string
  tags: string[]
  description?: string
  images?: string[]
  brand?: string
}
export const TABLE = Object.assign("products", {
  id: "id",
  title: "title",
  description: "description",
  images: "images",
  brand: "brand",
  category: "category",
  tags: "tags",
})

export const initialize = (connection: Connection) =>
  connection.raw(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      ${TABLE.id}             uuid PRIMARY KEY,
      ${TABLE.title}          text NOT NULL,
      ${TABLE.category}       text NOT NULL REFERENCES ${CATEGORIES},
      ${TABLE.tags}           text[] NOT NULL,
      ${TABLE.description}    text,
      ${TABLE.images}         text[],
      ${TABLE.brand}          text REFERENCES ${BRANDS}
    );`)

export const crud = (connection: Connection) => ({
  create: (product: Product) =>
    connection.query(builder.insertInto("products").values(product).compile()),

  getAll: async () =>
    connection.query(builder.selectFrom("products").selectAll().compile()),
})
