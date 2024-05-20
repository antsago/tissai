import { randomUUID } from "node:crypto"
import type { RunQuery } from "./Db.js"

function createInserts(runQuery: RunQuery) {
  const insertTrace = (pageId: string, objectTable: string, objectId: string) =>
    runQuery(`INSERT INTO trazes (
      id, timestamp, page_of_origin, object_table, object_id
    ) VALUES (
      $1, CURRENT_TIMESTAMP, $2, $3, $4
    );`, [
      randomUUID(),
      pageId,
      objectTable,
      objectId,
    ])

  const insertSeller = async (pageId: string, name: string) => Promise.all([
    runQuery('INSERT INTO sellers (name) VALUES ($1);', [name]),
    insertTrace(pageId, "sellers", name)
  ])

  const insertBrand = async (pageId: string, name: string, logo: string) => Promise.all([
    runQuery('INSERT INTO brands (name, logo) VALUES ($1, $2);', [name, logo]),
    insertTrace(pageId, "brands", name)
  ])

  const insertCategory = async (pageId: string, name: string) => Promise.all([
    runQuery('INSERT INTO categories (name) VALUES ($1)', [name]),
    insertTrace(pageId, "categories", name)
  ])

  const insertTags = async (pageId: string, tags: string[]) => Promise.all(
    tags.map(name => [
      runQuery('INSERT INTO tags (name) VALUES ($2);', [name]),
      insertTrace(pageId, "tags", name),
    ]).flat()
  )

  const insertProduct = async (
    pageId: string,
    id: string,
    title: string,
    embedding: number[],
    category: string,
    tags: string[],
    description?: string,
    image?: string | string[],
    brand?: string,
  ) => Promise.all([
    runQuery(
      `INSERT INTO products (
        id, title, description, image, brand, embedding, category, tags
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8
      );`,
      [
        id,
        title,
        description,
        image,
        brand,
        embedding,
        category,
        tags,
      ],
    ),
    insertTrace(pageId, "products", id)
  ])

  const insertOffer = async (
    pageId: string,
    id: string,
    url: string,
    site: string,
    product: string,
    seller?: string,
    price?: number,
    currency?: string,
  ) => Promise.all([
    runQuery(
      `INSERT INTO offers (
        id, url, site, product, seller, price, currency
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7
      );`,
      [
        id,
        url,
        site,
        product,
        seller,
        price,
        currency,
      ],
    ),
    insertTrace(pageId, "offers", id)
  ])

  return {
    trace: insertTrace,
    seller: insertSeller,
    brand: insertBrand,
    category: insertCategory,
    tags: insertTags,
    product: insertProduct,
    offer: insertOffer,
  }
}

export default createInserts
