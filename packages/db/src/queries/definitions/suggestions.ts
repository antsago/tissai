import builder from "../builder.js"

export const CATEGORY_LABEL = "categoría"

export type Suggestion = {
  label: string
  values: { name: string; href: string }[]
}

export const category = {
  takeFirst: true,
  query: (noValues = 5) =>
    builder
      .with("category_values", (db) =>
        db
          .selectFrom("nodes")
          .select(["name", "id"])
          .where("nodes.parent", "is", null)
          .orderBy("tally", "desc")
          .limit(noValues),
      )
      .selectFrom("category_values")
      .select(({ fn, val }) => [
        fn.jsonAgg("category_values").as("values"),
        val(CATEGORY_LABEL).as("label"),
      ])
      .compile(),
}

export const attributes = (categoryId: string, noLabels = 5, noValues = 5) =>
  builder
    .with("labels", (db) =>
      db
        .selectFrom("nodes as category")
        .innerJoin("nodes as label", "category.id", "label.parent")
        .select(["label.id", "label.name", "label.tally"])
        .where("category.id", "=", categoryId)
        .limit(noLabels),
    )
    .selectFrom("labels")
    .leftJoinLateral(
      (eb) =>
        eb
          .selectFrom("nodes")
          .select(["nodes.name", "nodes.id"])
          .where("nodes.parent", "=", eb.ref("labels.id"))
          .orderBy("nodes.tally", "desc")
          .limit(noValues)
          .as("values"),
      (join) => join.onTrue(),
    )
    .select(({ fn }) => [
      "labels.name as label",
      fn.jsonAgg("values").as("values"),
    ])
    .groupBy(["labels.name", "labels.tally"])
    .orderBy("labels.tally", "desc")
    .compile()
