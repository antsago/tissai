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
  builder
    .selectFrom("nodes as category")
    .leftJoinLateral(
      (lBuilder) =>
        lBuilder.selectFrom("nodes as label")
          .leftJoinLateral(vBuilder =>
            vBuilder.selectFrom("nodes as value")
              .select([
                "value.id",
                "value.tally",
              ])
              .whereRef("value.parent", "=", "label.id")
              .where("value.name", "in", words)
              .orderBy("value.tally", "desc")
              .limit(1)
              .as("values"),
            (join) => join.onTrue(),
          )
          .select(({ ref }) => [
            "label.id",
            "label.tally",
            "values.id as value",
            sql`${ref("values.tally")} / ${ref("label.tally")}`.as("probability"),
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
