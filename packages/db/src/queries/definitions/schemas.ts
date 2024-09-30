import { sql } from "kysely"
import { type Schema } from "../../tables.js"
import builder from "../builder.js"

export const upsert = (schema: Schema) =>
  builder
    .insertInto("schemas")
    .onConflict((oc) =>
      oc.columns(["category", "label", "value"]).doUpdateSet({
        tally: ({ ref }) =>
          sql`${ref("schemas.tally")} + ${ref("excluded.tally")}`,
      }),
    )
    .values(schema)
    .compile()
