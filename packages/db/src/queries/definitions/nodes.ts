import { sql } from "kysely"
import type { Node } from "../../tables.js"
import builder from "../builder.js"
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
    .leftJoin("nodes as label", "category.id", "label.parent")
    .leftJoinLateral(eb =>
      eb
        .selectFrom("nodes as value")
        .selectAll()
        .whereRef("label.id", '=', "value.parent")
        .where((eb) => eb("value.name", "in", words))
        .orderBy("value.tally", "desc")
        .limit(1)
        .as("value"),
      (join) => join.onTrue()
    )
    .select(({ fn, ref }) => [
      "category.id",
      "category.tally",
      fn
        .jsonAgg(
          jsonBuildObject({
            id: ref("label.id"),
            value: ref("value.id"),
            probability: sql`${ref("value.tally")} / ${ref("label.tally")}`,
          }),
        )
        .filterWhere("label.id", "is not", null)
        .as("properties"),
    ])
    .where((eb) =>
      eb("category.name", "in", words).and("category.parent", "is", null),
    )
    .groupBy("category.id")
    .compile()
