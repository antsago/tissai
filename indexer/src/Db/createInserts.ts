import { Connection } from "./Connection.js"
import * as traces from "./traces.js"
import * as sellers from "./sellers.js"

function createInserts(connection: Connection) {
  const insertTrace = traces.create(connection)
  const insertSeller = sellers.create(connection)

  const insertBrand = async (pageId: string, name: string, logo: string) => Promise.all([
    connection.query('INSERT INTO brands (name, logo) VALUES ($1, $2);', [name, logo]),
    insertTrace(pageId, "brands", name)
  ])

  const insertCategory = async (pageId: string, name: string) => Promise.all([
    connection.query('INSERT INTO categories (name) VALUES ($1)', [name]),
    insertTrace(pageId, "categories", name)
  ])

  const insertTags = async (pageId: string, tags: string[]) => Promise.all(
    tags.map(name => [
      connection.query('INSERT INTO tags (name) VALUES ($2);', [name]),
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
    connection.query(
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
    connection.query(
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
