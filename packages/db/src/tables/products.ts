import { Connection } from "../Connection.js"
import { TABLE as BRANDS } from "./brands.js"
import { TABLE as CATEGORIES } from "./categories.js"
import builder from "./queryBuilder.js"

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

export function formatEmbedding(embedding: number[]) {
  return `[${embedding.join(",")}]`
}

export const initialize = (connection: Connection) =>
  connection.raw(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      ${TABLE.id}             uuid PRIMARY KEY,
      ${TABLE.title}          text NOT NULL,
      ${TABLE.category}       text NOT NULL REFERENCES ${CATEGORIES},
      ${TABLE.tags}           text[] NOT NULL,
      ${TABLE.embedding}      vector(384) NOT NULL,
      ${TABLE.description}    text,
      ${TABLE.images}         text[],
      ${TABLE.brand}          text REFERENCES ${BRANDS}
    );`)

export const crud = (connection: Connection) => ({
  create: (product: Product) =>
    connection.query(
      builder
        .insertInto("products")
        .values({
          ...product,
          embedding: formatEmbedding(product.embedding),
        })
        .compile(),
    ),

  getAll: async () => {
    const products = await connection.query(
      builder.selectFrom("products").selectAll().compile(),
    )

    return products.map((p) => ({
      ...p,
      embedding: JSON.parse(p.embedding) as number[],
    }))
  },
})
