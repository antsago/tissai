import type { Attribute } from "../tables/index.js"
import builder from "./builder.js"

export const queries = {
  create: (attribute: Attribute) =>
    builder.insertInto("attributes").values(attribute).compile(),
  getAll: () => builder.selectFrom("attributes").selectAll().compile(),
}
