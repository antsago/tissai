import { sql } from "kysely"
import type { Node } from "../../tables.js"
import builder from "../builder.js"
import { join } from "path"
import { jsonBuildObject } from "kysely/helpers/postgres"

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
    .leftJoinLateral(
      ({ selectFrom }) =>
        selectFrom("nodes as label")
          .select(({ fn, selectFrom }) => [
            "label.id",
            "label.tally",
            selectFrom("nodes as value")
              .select(({ ref }) =>
                jsonBuildObject({
                  id: ref("value.id"),
                  tally: ref("value.tally"),
                }).as("details"),
              )
              .whereRef("value.parent", "=", "label.id")
              .where("value.name", "in", words)
              .limit(1)
              .as("value"),
          ])
          .whereRef("label.parent", "=", "category.id")
          .as("labels"),
      (join) => join.onTrue(),
    )
    .select(({ fn }) => [
      "category.id",
      "category.tally",
      fn.jsonAgg("labels").as("children"),
    ])
    .where("category.name", "in", words)
    .where("category.parent", "is", null)
    .groupBy("category.id")
    .compile()
