import { sql } from "kysely"
import type { Node } from "../../tables.js"
import builder from "../builder.js"
import { jsonBuildObject, jsonObjectFrom } from "kysely/helpers/postgres"
import { join } from "path"

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
  builder
    .selectFrom("nodes as category")
    .leftJoinLateral((eb) => 
      eb.selectFrom("nodes as label")
        .select(["label.id", "label.tally"])
        .whereRef("label.parent", "=", "category.id")
        .as("labels"),
      (join) => join.onTrue(),
    )
    .select(({ fn }) => [
      "category.id",
      "category.tally",
      fn.jsonAgg("labels").as("properties")
    ])
    .where("name", "in", words)
    .groupBy("category.id")
    .compile()
