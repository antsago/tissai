import type { Offer } from "../types.js"
import builder from "./builder.js"

export const queries = {
  create: (offer: Offer) =>
    builder.insertInto("offers").values(offer).compile(),
  getAll: () => builder.selectFrom("offers").selectAll().compile(),
}
