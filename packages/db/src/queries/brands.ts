import type { Brand } from "../tables/index.js"
import builder from "./queryBuilder.js"

export const queries = {
  create: (brand: Brand) =>
    builder.insertInto("brands").values(brand).compile(),
  getAll: () => builder.selectFrom("brands").selectAll().compile(),
  byName: {
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
    takeFirst: true,
  },
  update: (brand: Brand) =>
    builder
      .updateTable("brands")
      .set(brand)
      .where("name", "=", brand.name)
      .compile(),
}
