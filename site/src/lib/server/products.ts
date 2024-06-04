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
  images?: string[]
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
    return db.getProductDetails(id)
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
