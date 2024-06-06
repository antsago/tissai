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

type ProductDetails = {
  title: Product["title"]
  description: Product["description"]
  images: Product["images"]
  brand: (Brand|undefined)[]
  similar: {
    id: Product["id"]
    title: Product["title"]
    image?: string
  }[]
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

const getProductDetails =
  (connection: Connection) => async (productId: Product["id"]) => {
    const [response] = await connection.query<ProductDetails>(
      `
      SELECT
        p.${PRODUCTS.title},
        p.${PRODUCTS.description},
        p.${PRODUCTS.images},
        JSON_AGG(b.*) AS brand,
        JSON_AGG(sim.*) AS similar,
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
        LEFT JOIN ${BRANDS} AS b ON b.${BRANDS.name} = p.${PRODUCTS.brand},
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
      [productId],
    )

    return {
      ...response,
      brand: response.brand[0],
    }
  }

export default getProductDetails
