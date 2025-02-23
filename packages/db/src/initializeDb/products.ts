import { Connection } from "../Connection.js"
import { BRANDS } from "./brands.js"
import { NODES } from "./nodes.js"

export const PRODUCTS = Object.assign("products", {
  id: "id",
  title: "title",
  description: "description",
  images: "images",
  brand: "brand",
  category: "category",
})

export const initialize = (connection: Connection) =>
  connection.raw(`
    CREATE TABLE IF NOT EXISTS ${PRODUCTS} (
      ${PRODUCTS.id}             uuid PRIMARY KEY,
      ${PRODUCTS.title}          text NOT NULL,
      ${PRODUCTS.description}    text,
      ${PRODUCTS.images}         text[],
      ${PRODUCTS.brand}          text REFERENCES ${BRANDS},
      ${PRODUCTS.category}       uuid REFERENCES ${NODES}
    );`)
