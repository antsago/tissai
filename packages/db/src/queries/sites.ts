import type { Site } from "../tables/index.js"
import builder from "./queryBuilder.js"

export const queries = {
  create: (site: Site) => builder.insertInto("sites").values(site).compile(),
  getAll: () => builder.selectFrom("sites").selectAll().compile(),
}
