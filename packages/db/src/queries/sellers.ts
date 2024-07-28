import type { Seller } from "../tables/index.js"
import builder from "./builder.js"

export const queries = {
  create: (seller: Seller) =>
    builder
      .insertInto("sellers")
      .onConflict((oc) => oc.doNothing())
      .values(seller)
      .compile(),
  getAll: () => builder.selectFrom("sellers").selectAll().compile(),
}
