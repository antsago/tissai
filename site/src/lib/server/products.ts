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
    const query = `
			SELECT p.name, p.description, p.images, p.product_uri, p.shop_name, JSON_AGG(s.*) AS similar
			FROM 
				products AS p,
				LATERAL (
					SELECT
						id, name, images[1] AS image
					FROM products as p2
					WHERE p.id != p2.id
					ORDER BY p2.embedding <-> p.embedding
					LIMIT 4
				) AS s
			WHERE p.id='${id}'
			GROUP BY p.id;
		`
    const response = await db.query<ProductDetails>(query)

    return response[0]
  }

  async function search(searchQuery: string) {
    const embedding = await embedder.embed(searchQuery)

    type SearchResult = Pick<Product, 'id'|'title'> & { image: string }
    const result = await db.query<SearchResult>(
      `
        SELECT
          ${PRODUCTS.id}, ${PRODUCTS.title}, ${PRODUCTS.images}[1] AS image
        FROM ${PRODUCTS}
        ORDER BY ${PRODUCTS.embedding} <-> $1
        LIMIT 24
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
