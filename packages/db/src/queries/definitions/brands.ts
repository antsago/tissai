import type { Brand } from "../../tables.js"
import builder from "../builder.js"

export const byName = {
  takeFirst: true,
  query: (name: string) =>
    builder
      .selectFrom("brands")
      .selectAll()
      .where(
        ({ fn, val }) => fn<number>("similarity", ["name", val(name)]),
        ">=",
        1,
      )
      .limit(1)
      .compile(),
}

export const update = (brand: Brand) =>
  builder
    .updateTable("brands")
    .set(brand)
    .where("name", "=", brand.name)
    .compile()
