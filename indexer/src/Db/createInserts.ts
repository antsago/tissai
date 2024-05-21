import { Connection } from "./Connection.js"
import * as traces from "./traces.js"
import * as sellers from "./sellers.js"
import * as brands from "./brands.js"
import * as categories from "./categories.js"
import * as tags from "./tags.js"

function createInserts(connection: Connection) {
  const insertTrace = traces.create(connection)
  const insertSeller = sellers.create(connection)
  const insertBrand = brands.create(connection)
  const insertCategory = categories.create(connection)
  const insertTag = tags.create(connection)

  const insertTags = async (pageId: string, tags: string[]) => Promise.all(
    tags.map(name => insertTag(pageId, name)).flat()
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
    tag: insertTag,
    product: insertProduct,
    offer: insertOffer,
  }
}

export default createInserts
