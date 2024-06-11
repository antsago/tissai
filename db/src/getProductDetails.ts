import { Connection } from "./Connection.js"
import {
  BRANDS,
  Brand,
  OFFERS,
  Offer,
  PRODUCTS,
  Product,
  SITES,
  Site,
} from "./tables/index.js"

type DetailsResponse = {
  title: Product["title"]
  description: Product["description"]
  images: Product["images"]
  category: Product["category"]
  tags: Product["tags"]
  brand: (Brand | undefined)[]
  offers: {
    url: Offer["url"]
    price: Offer["price"]
    currency: Offer["currency"]
    seller: Offer["seller"]
    site: {
      name: Site["name"]
      icon: Site["icon"]
    }
  }[]
}
type SimilarResponse = {
  id: Product["id"]
  title: Product["title"]
  image?: string
}

const getProductDetails =
  (connection: Connection) => async (productId: Product["id"]) => {
    const [details] = await connection.query<DetailsResponse>(
      `
        SELECT
          p.${PRODUCTS.title},
          p.${PRODUCTS.description},
          p.${PRODUCTS.images},
          p.${PRODUCTS.category},
          p.${PRODUCTS.tags},
          JSON_AGG(b.*) AS brand,
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'url', o.${OFFERS.url},
              'price', o.${OFFERS.price},
              'currency', o.${OFFERS.currency},
              'seller', o.${OFFERS.seller},
              'site', JSON_BUILD_OBJECT(
                'name', s.${SITES.name},
                'icon', s.${SITES.icon}
              )
            )
          ) AS offers
        FROM 
          ${PRODUCTS} AS p
          LEFT JOIN ${OFFERS} AS o ON o.${OFFERS.product} = p.${PRODUCTS.id}
          INNER JOIN ${SITES} AS s ON o.${OFFERS.site} = s.${SITES.id}
          LEFT JOIN ${BRANDS} AS b ON b.${BRANDS.name} = p.${PRODUCTS.brand}
        WHERE p.${PRODUCTS.id} = $1
        GROUP BY p.${PRODUCTS.id};
      `,
      [productId],
    )
    
    const similar = await connection.query<SimilarResponse>(
      `
        SELECT
          ${PRODUCTS.id},
          ${PRODUCTS.title},
          ${PRODUCTS.images}[1] AS image
        FROM ${PRODUCTS}
        WHERE ${PRODUCTS.id} != $1
        ORDER BY ${PRODUCTS.embedding} <-> (
          SELECT
            ${PRODUCTS.embedding}
          FROM ${PRODUCTS}
          WHERE ${PRODUCTS.id} = $1
        )
        LIMIT 4
      `,
      [productId],
    )

    return {
      ...details,
      brand: details.brand[0],
      similar,
    }
  }

export type ProductDetails = Awaited<
  ReturnType<ReturnType<typeof getProductDetails>>
>
export default getProductDetails
