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
          .selectFrom("schemas")
          .select(({ fn }) => ["category", fn.sum("schemas.tally").as("count")])
          .where("schemas.label", "=", CATEGORY_LABEL)
          .groupBy("category")
          .orderBy("count desc")
          .limit(noValues),
      )
      .selectFrom("category_values")
      .select(({ fn, ref, val }) => [
        fn
          .agg<string[]>("array_agg", [ref("category_values.category")])
          .as("values"),
        val(CATEGORY_LABEL).as("label"),
      ])
      .compile(),
}

export const attributes = (category: string, noLabels = 5, noValues = 5) =>
  builder
    .with("labels", (db) =>
      db
        .selectFrom("schemas")
        .select(({ fn }) => [
          "schemas.label",
          "schemas.category",
          fn.sum("schemas.tally").as("score"),
        ])
        .where("schemas.label", "!=", CATEGORY_LABEL)
        .where("schemas.category", "=", category)
        .groupBy(["schemas.category", "schemas.label"])
        .orderBy("score", "desc")
        .limit(noLabels),
    )
    .selectFrom("labels")
    .leftJoinLateral(
      (eb) =>
        eb
          .selectFrom("schemas")
          .select("value")
          .where("schemas.category", "=", eb.ref("labels.category"))
          .where("schemas.label", "=", eb.ref("labels.label"))
          .orderBy("schemas.tally", "desc")
          .limit(noValues)
          .as("values"),
      (join) => join.onTrue(),
    )
    .select(({ fn }) => [
      "labels.label",
      fn.agg<string[]>("array_agg", ["values.value"]).as("values"),
    ])
    .groupBy("labels.label")
    .orderBy(({ fn }) => fn.sum("labels.score"), "desc")
    .compile()
