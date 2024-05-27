import { Connection } from "../Connection.js"
import { TABLE as BRANDS } from "./brands.js"
import { TABLE as CATEGORIES } from "./categories.js"
import * as traces from "./traces.js"

export type Product = {
  id: string
  title: string
  embedding: number[]
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
  embedding: "embedding",
  category: "category",
  tags: "tags",
})

function formatEmbedding(embedding: number[]) {
  return `[${embedding.join(",")}]`
}

export const create =
  (connection: Connection) => (pageId: string, product: Product) =>
    Promise.all([
      connection.query(
        `INSERT INTO ${TABLE} (
          ${TABLE.id},
          ${TABLE.title},
          ${TABLE.description},
          ${TABLE.images},
          ${TABLE.brand},
          ${TABLE.embedding},
          ${TABLE.category},
          ${TABLE.tags}
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8
        );`,
        [
          product.id,
          product.title,
          product.description,
          product.images,
          product.brand,
          formatEmbedding(product.embedding),
          product.category,
          product.tags,
        ],
      ),
      traces.create(connection)(pageId, TABLE.toString(), product.id),
    ])

export const initialize = (connection: Connection) =>
  connection.query(`
    CREATE TABLE ${TABLE} (
      ${TABLE.id}             uuid PRIMARY KEY,
      ${TABLE.title}          text NOT NULL,
      ${TABLE.category}       text NOT NULL REFERENCES ${CATEGORIES},
      ${TABLE.tags}           text[] NOT NULL,
      ${TABLE.embedding}      vector(384) NOT NULL,
      ${TABLE.description}    text,
      ${TABLE.images}         text[],
      ${TABLE.brand}          text REFERENCES ${BRANDS}
    );`)
