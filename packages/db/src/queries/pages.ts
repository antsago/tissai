import type { Page } from "../types.js"
import builder from "./builder.js"

export const queries = {
  create: (page: Page) => builder.insertInto("pages").values(page).compile(),
  getAll: () => builder.selectFrom("pages").selectAll().compile(),
}
