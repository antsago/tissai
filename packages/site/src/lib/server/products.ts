import { Db } from "@tissai/db"
import Embedder from "./Embedder"

export function Products() {
  const embedder = Embedder()
  const db = Db()

  async function getDetails(id: string) {
    return db.getProductDetails(id)
  }

  type SearchParam = {
    query: string
    brand?: string
  }
  async function search({ query, brand }: SearchParam) {
    const embedding = await embedder.embed(query)
    return db.searchProducts({ embedding, brand })
  }

  return {
    getDetails,
    search,
  }
}
export type Products = ReturnType<typeof Products>
