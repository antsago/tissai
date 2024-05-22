import { Connection } from "../Connection.js"
import * as traces from "./traces.js"

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

export const create =
  (connection: Connection) =>
  (
    pageId: string,
    id: string,
    title: string,
    embedding: number[],
    category: string,
    tags: string[],
    description?: string,
    images?: string | string[],
    brand?: string,
  ) =>
    Promise.all([
      connection.query(
        `
      INSERT INTO ${TABLE} (
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
        [id, title, description, images, brand, embedding, category, tags],
      ),
      traces.create(connection)(pageId, TABLE.toString(), id),
    ])

export const initialize = (connection: Connection) =>
  connection.query(`
    CREATE TABLE ${TABLE} (
      ${TABLE.id}             uuid PRIMARY KEY,
      ${TABLE.title}          text NOT NULL,
      ${TABLE.category}       text NOT NULL,
      ${TABLE.tags}           text[] NOT NULL,
      ${TABLE.embedding}      vector(384) NOT NULL,
      ${TABLE.description}    text,
      ${TABLE.images}         text[],
      ${TABLE.brand}          text
    );`)
