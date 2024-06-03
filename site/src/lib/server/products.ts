import { Db, PRODUCTS, type Product } from "@tissai/db"
import Embedder from "./Embedder"

type Similar = {
  id: string
  name: string
  image: string
}
export type ProductDetails = {
  name: string
  description: string
  images: string[]
  productUri: string
  shopName: string
  similar: Similar[]
}
export type Products = {
  getDetails: (id: string) => Promise<ProductDetails>
  search: (query: string) => Promise<Similar[]>
}

export function Products(): Products {
  const embedder = Embedder()
  const db = Db()

  async function getDetails(id: string) {
    const response = await db.query<Pick<Product, 'title'|'description'|'images'> & { similar: (Pick<Product, 'id'|'title'> & { image: string })[] }>(
      `
        SELECT
          p.${PRODUCTS.title},
          p.${PRODUCTS.description},
          p.${PRODUCTS.images},
          JSON_AGG(s.*) AS similar
        FROM 
          ${PRODUCTS} AS p,
          LATERAL (
            SELECT
              ${PRODUCTS.id},
              ${PRODUCTS.title},
              ${PRODUCTS.images}[1] AS image
            FROM ${PRODUCTS} as p2
            WHERE p.${PRODUCTS.id} != p2.${PRODUCTS.id}
            ORDER BY p2.${PRODUCTS.embedding} <-> p.${PRODUCTS.embedding}
            LIMIT 4
          ) AS s
        WHERE p.${PRODUCTS.id}=$1
        GROUP BY p.${PRODUCTS.id};
      `,
      [id],
    )

    return {
      name: response[0].title,
      description: response[0].description ?? '',
      images: response[0].images ?? [],
      similar: response[0].similar.map((s) => ({...s, name: s.title})),
      productUri: 'https://example.com',
      shopName: 'FooBar'
    }
  }

  async function search(searchQuery: string) {
    const embedding = await embedder.embed(searchQuery)

    type SearchResult = Pick<Product, 'id'|'title'> & { image: string }
    const result = await db.query<SearchResult>(
      `
        SELECT
          ${PRODUCTS.id},
          ${PRODUCTS.title},
          ${PRODUCTS.images}[1] AS image
        FROM ${PRODUCTS}
        ORDER BY ${PRODUCTS.embedding} <-> $1
        LIMIT 24;
      `,
      [`[${embedding.join(",")}]`],
    )

    return result.map(p => ({
      id: p.id,
      image: p.image,
      name: p.title,
    }))
  }

  return {
    getDetails,
    search,
  }
}
