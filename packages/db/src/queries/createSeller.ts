import type { Seller } from "../types.js"
import builder from "./builder.js"

const createSeller = (seller: Seller) =>
  builder
    .insertInto("sellers")
    .onConflict((oc) => oc.doNothing())
    .values(seller)
    .compile()

export default createSeller
