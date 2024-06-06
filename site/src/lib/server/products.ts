import { Db } from "@tissai/db"
import Embedder from "./Embedder"

export function Products() {
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
export type Products = ReturnType<typeof Products>
