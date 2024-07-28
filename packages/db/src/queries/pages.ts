import type { Page } from "../tables/index.js"
import builder from "./queryBuilder.js"

export const queries = {
  create: (page: Page) => builder.insertInto("pages").values(page).compile(),
  getAll: () => builder.selectFrom("pages").selectAll().compile(),
}
