import type { Seller } from "../types.js"
import builder from "./builder.js"

export const create = (seller: Seller) =>
  builder
    .insertInto("sellers")
    .onConflict((oc) => oc.doNothing())
    .values(seller)
    .compile()
