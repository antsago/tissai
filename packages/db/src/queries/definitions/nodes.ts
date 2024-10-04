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
    .with("properties", db =>
      db.selectFrom("nodes as category")
      .leftJoin("nodes as label", "category.id", "label.parent")
      .leftJoin("nodes as value", "label.id", "value.parent")
      .distinctOn("label.id")
      .select([
        "category.id as categoryId",
        "category.tally as categoryTally",
        "label.id as labelId",
        "label.tally as labelTally",
        "value.id as valueId",
        "value.tally as valueTally",
      ])
      .where((eb) =>
        eb("category.name", "in", words).and("category.parent", "is", null),
      )
      .where((eb) => eb("value.name", "in", words).or("value.id", "is", null))
      .orderBy(["label.id", "value.tally desc"])
    )
    .selectFrom("properties")
    .select(({ fn, ref }) => [
      "categoryId as id",
      fn
        .jsonAgg(
          jsonBuildObject({
            id: ref("labelId"),
            value: ref("valueId"),
            probability: sql`${ref("valueTally")} / ${ref("categoryTally")}`,
          }),
        )
        .filterWhere("labelId", "is not", null)
        .as("properties"),
    ])
    .groupBy("id")
    .compile()
