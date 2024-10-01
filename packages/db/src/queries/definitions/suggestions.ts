import { sql } from "kysely"
import builder from "../builder.js"
import { join } from "path"

export const CATEGORY_LABEL = "categoría"

export type Suggestion = {
  frequency: number
  label: string
  values: string[]
}

export const category = {
  takeFirst: true,
  query: (noValues = 5) =>
    builder
      .with("category_values", (db) =>
        db
          .selectFrom("nodes")
          .select("name")
          .where("nodes.parent", "is", null)
          .orderBy("tally", "desc")
          .limit(noValues),
      )
      .selectFrom("category_values")
      .select(({ fn, ref, val }) => [
        fn
          .agg<string[]>("array_agg", [ref("category_values.name")])
          .as("values"),
        val(CATEGORY_LABEL).as("label"),
      ])
      .compile(),
}

export const attributes = (categoryId: string, noLabels = 5, noValues = 5) =>
  builder
    .with("labels", (db) =>
      db
        .selectFrom("nodes")
        .select(["nodes.id", "nodes.name", "nodes.tally"])
        .where("nodes.parent", "=", categoryId)
        .orderBy("tally", "desc")
        .limit(noLabels),
    )
    .selectFrom("labels")
    .leftJoinLateral(
      (eb) =>
        eb
          .selectFrom("nodes")
          .select("name")
          .where("nodes.parent", "=", eb.ref("labels.id"))
          .orderBy("nodes.tally", "desc")
          .limit(noValues)
          .as("values"),
      (join) => join.onTrue(),
    )
    .select(({ fn }) => [
      "labels.name as label",
      fn.agg<string[]>("array_agg", ["values.name"]).as("values"),
    ])
    .groupBy(["labels.name", "labels.tally"])
    .orderBy("labels.tally", "desc")
    .compile()
