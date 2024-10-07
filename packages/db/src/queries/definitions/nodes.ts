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
    .with("properties", (db) =>
      db
        .selectFrom("nodes as category")
        .leftJoin("nodes as label", "category.id", "label.parent")
        .leftJoinLateral(
          (eb) =>
            eb
              .selectFrom("nodes as value")
              .selectAll()
              .whereRef("label.id", "=", "value.parent")
              .where("value.name", "in", words)
              .orderBy("value.tally desc")
              .limit(1)
              .as("value"),
          (join) => join.onTrue(),
        )
        .select(({ ref, fn }) => [
          "category.id as category",
          "category.tally as tally",
          "label.id as label",
          "value.id as value",
          fn
            .coalesce(
              // Probability if property is expressed
              sql`${ref("value.tally")} / ${ref("category.tally")}`,
              // Probability if property is hidden
              sql`(${ref("category.tally")}-${ref("label.tally")}) / ${ref("category.tally")}`,
            )
            .as("probability"),
        ])
        .where((eb) =>
          eb("category.name", "in", words).and("category.parent", "is", null),
        ),
    )
    .selectFrom("properties")
    .select(({ fn, ref, val }) => [
      "category as id",
      fn
        .agg<string>("array_agg", [ref("value")])
        .filterWhere("value", "is not", null)
        .as("properties"),
      // Overall interpretation probability
      sql`${ref("tally")} * ${fn.coalesce(
        fn
          .agg("mul", [ref("probability")])
          .filterWhere("label", "is not", null),
        val(1),
      )}`.as("probability"),
    ])
    .groupBy(["category", "tally"])
    .orderBy(({ fn }) => fn.count("value"), "desc")
    .orderBy("probability", "desc")
    .compile()
