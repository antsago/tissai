import { Db, OFFERS, PRODUCTS, SITES, type Product } from "@tissai/db"
import Embedder from "./Embedder"

type Similar = {
  id: string
  name: string
  image?: string
}
export type ProductDetails = {
  name: string
  description: string
  images: string[]
  product_uri: string
  shop_name: string
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
    const response = await db.query<any>(
      `
        SELECT
          p.${PRODUCTS.title},
          p.${PRODUCTS.description},
          p.${PRODUCTS.images},
          JSON_AGG(sim.*) AS similar,
          JSON_AGG(
            json_build_object(
              '${OFFERS.url}', o.${OFFERS.url},
              '${OFFERS.price}', o.${OFFERS.price},
              '${OFFERS.currency}', o.${OFFERS.currency},
              '${OFFERS.seller}', o.${OFFERS.seller},
              'site_name', s.${SITES.name},
              'site_icon', s.${SITES.icon}
            )
          ) AS offers
        FROM 
          ${PRODUCTS} AS p
          LEFT JOIN ${OFFERS} AS o ON o.${OFFERS.product} = p.${PRODUCTS.id}
          INNER JOIN ${SITES} AS s ON o.${OFFERS.site} = s.${SITES.id},
          LATERAL (
            SELECT
              ${PRODUCTS.id},
              ${PRODUCTS.title},
              ${PRODUCTS.images}[1] AS image
            FROM ${PRODUCTS} AS p2
            WHERE p.${PRODUCTS.id} != p2.${PRODUCTS.id}
            ORDER BY p2.${PRODUCTS.embedding} <-> p.${PRODUCTS.embedding}
            LIMIT 4
          ) AS sim
        WHERE p.${PRODUCTS.id} = $1
        GROUP BY p.${PRODUCTS.id};
      `,
      [id],
    )

    return {
      name: response[0].title,
      description: response[0].description ?? "",
      images: response[0].images ?? [],
      similar: response[0].similar.map((s: any) => ({
        id: s.id,
        name: s.title,
        image: s.image,
      })),
      product_uri: response[0].offers[0]?.url,
      shop_name: response[0].offers[0]?.site_name,
    }
  }

  async function search(searchQuery: string) {
    const embedding = await embedder.embed(searchQuery)
    return db.searchProducts(embedding)
  }

  return {
    getDetails,
    search,
  }
}
