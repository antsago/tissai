import builder from "../builder.js"

export const CATEGORY_LABEL = "categoría"

export type Suggestion = {
  frequency: number
  label: string
  values: string[]
}

export const category = {
  takeFirst: true,
  query: () =>
    builder
      .with("category_values", (db) => db
        .selectFrom("schemas")
        .select(({ fn }) => ["category", fn.sum("schemas.tally").as("count")])
        .groupBy("category")
        .orderBy("count desc")
        .limit(5)
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
