import { sql } from "kysely"
import type { Node } from "../../tables.js"
import builder from "../builder.js"

export const upsert = {
  takeFirst: true,
  query: (node: Node) =>
    builder
      .insertInto("nodes")
      .onConflict((oc) =>
        oc.columns(["name", "parent"]).doUpdateSet({
          tally: ({ ref }) =>
            sql`${ref("nodes.tally")} + ${ref("excluded.tally")}`,
        }),
      )
      .values(node)
      .returning("id")
      .compile(),
}

export const infer = (words: string[]) =>
  builder.selectFrom("nodes").select("id").where("name", "in", words).compile()
