import type { Brand } from "../../tables.js"
import builder from "../builder.js"

export const upsert = {
  takeFirst: true,
  query: (brand: Brand) =>
    builder
      .insertInto("brands")
      .onConflict((oc) =>
        oc.columns(["name"]).doUpdateSet(({ ref, fn }) => ({
          logo: fn.coalesce(ref("excluded.logo"), ref("brands.logo")),
        })),
      )
      .values(brand)
      .compile(),
}
