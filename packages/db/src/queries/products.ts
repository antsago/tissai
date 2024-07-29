import type { Product } from "../types.js"
import builder from "./builder.js"

export const queries = {
  create: (product: Product) =>
    builder.insertInto("products").values(product).compile(),
  getAll: () => builder.selectFrom("products").selectAll().compile(),
}
