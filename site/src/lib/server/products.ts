import { DB } from "./db"
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
  const db = DB()

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
    const sqlQuery = `
			SELECT
				id, name, images[1] AS image
			FROM products
			ORDER BY embedding <-> '[${embedding}]'
			LIMIT 24
		`
    return db.query<Similar>(sqlQuery)
  }

  return {
    getDetails,
    search,
  }
}
