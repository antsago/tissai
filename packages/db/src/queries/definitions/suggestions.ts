import builder from "../builder.js"

export const category = {
  takeFirst: true,
  query: (words: string[]) =>
    builder
      .with("category_counts", (db) =>
        db
          .selectFrom("schemas")
          .select("schemas.category")
          .where("schemas.label", "=", "categoría")
          .where((eb) => eb("schemas.value", "=", eb.fn.any(eb.val(words))))
          .orderBy(({ fn }) => fn.agg("mul", ["schemas.tally"]), "desc")
          .groupBy("category"),
      )
      .selectFrom("category_counts")
      .select(({ fn, ref, val }) => [
        fn.agg("array_agg", [ref("category_counts.category")]).as("values"),
        val("categoría").as("label"),
      ])
      .compile(),
}
