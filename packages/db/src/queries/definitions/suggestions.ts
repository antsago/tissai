import builder from "../builder.js"

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

export const attributes = (category: string, noLabels = 5) =>
  builder
    .with("labels", (db) =>
      db
        .selectFrom("schemas")
        .select(({ fn, ref }) => [
          "label",
          fn.sum("schemas.tally").as("count"),
          fn.agg<string[]>("array_agg", [ref("schemas.value")]).as("values"),
        ])
        .where("schemas.label", "!=", CATEGORY_LABEL)
        .groupBy("label")
        .orderBy("count desc")
        .limit(noLabels),
    )
    .selectFrom("labels")
    .select(["label", "values"])
    .compile()
