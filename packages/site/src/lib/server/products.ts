import type { SearchParams } from "@tissai/db"
import { Db } from "@tissai/db"
import Embedder from "./Embedder"

export function Products() {
  const embedder = Embedder()
  const db = Db()

  async function getDetails(id: string) {
    return db.getProductDetails(id)
  }

  type Parameters = Omit<SearchParams, "embedding"> & { query: string }
  async function search({ query, ...filters }: Parameters) {
    const embedding = await embedder.embed(query)
    return db.searchProducts({ embedding, ...filters })
  }

  return {
    getDetails,
    search,
  }
}
export type Products = ReturnType<typeof Products>
