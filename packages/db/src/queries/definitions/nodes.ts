import { sql } from "kysely"
import type { Node } from "../../tables.js"
import builder from "../builder.js"

export const upsert = (node: Node) =>
  builder
    .insertInto("nodes")
    .onConflict((oc) =>
      oc.columns(["id"]).doUpdateSet({
        tally: ({ ref }) =>
          sql`${ref("nodes.tally")} + ${ref("excluded.tally")}`,
      }),
    )
    .values(node)
    .compile()
