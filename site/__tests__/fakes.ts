import { PRODUCT as DB_PRODUCT } from "@tissai/db/mocks"

export { BRAND } from '@tissai/db/mocks'

export const PRODUCT = {
  id: DB_PRODUCT.id,
  name: DB_PRODUCT.title,
  description: DB_PRODUCT.description,
  images: DB_PRODUCT.images,
  product_uri: "https://example.com/product.html",
  shop_name: "Example",
  similar: [],
}
export const SIMILAR = {
  id: "000",
  name: "Similar product",
  image: "https://example.com/related_product.jpg",
}
export const QUERY = DB_PRODUCT.title
export const EMBEDDING = DB_PRODUCT.embedding
