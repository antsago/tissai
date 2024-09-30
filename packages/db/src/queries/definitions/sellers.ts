import type { Seller } from "../../tables.js"
import builder from "../builder.js"

export const create = (seller: Seller) =>
  builder
    .insertInto("sellers")
    .onConflict((oc) => oc.doNothing())
    .values(seller)
    .compile()
