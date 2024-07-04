import type { SearchParams } from "@tissai/db"
import { Db } from "@tissai/db"

export function Products() {
  const db = Db()

  async function getDetails(id: string) {
    return db.getProductDetails(id)
  }

  async function search(parameters: SearchParams) {
    return db.searchProducts(parameters)
  }

  return {
    getDetails,
    search,
  }
}
export type Products = ReturnType<typeof Products>
