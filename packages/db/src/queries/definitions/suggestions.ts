import { sql } from "kysely"
import builder from "../builder.js"

export const CATEGORY_LABEL = "categoría"

// Pick the category-word pairs that maximize p(C|W) = p(C) * p(W|C) / p(W) ∝ c(W|C) / c(W)
export const category = {
  takeFirst: true,
  query: (words: string[]) =>
    builder
      .with("word_count", (db) =>
        db
          .selectFrom("schemas")
          .select(({ fn }) => [
            "schemas.value as W",
            fn.sum("schemas.tally").as("c(W)"),
          ])
          .where((eb) => eb("schemas.value", "=", eb.fn.any(eb.val(words))))
          .groupBy("schemas.value"),
      )
      .with("category_counts", (db) =>
        db
          .selectFrom("schemas")
          .select(({ fn }) => [
            "schemas.category as C",
            fn.sum("schemas.tally").as("c(C|W)"),
            "schemas.value as W",
          ])
          .where("schemas.label", "=", CATEGORY_LABEL)
          .where((eb) => eb("schemas.value", "=", eb.fn.any(eb.val(words))))
          .orderBy(({ fn }) => fn.agg("mul", ["schemas.tally"]), "desc")
          .groupBy(["schemas.category", "schemas.value"]),
      )
      .with("category_probabilities", (db) =>
        db
          .selectFrom("category_counts")
          .leftJoin("word_count", "category_counts.W", "word_count.W")
          .select(({ ref }) => [
            sql`${ref("category_counts.c(C|W)")} / ${ref("word_count.c(W)")}`.as(
              "p(C|W)",
            ),
            "category_counts.C",
          ])
          .distinctOn("C")
          .orderBy(["C asc", "p(C|W) desc"])
      )
      .with("category_values", (db) =>
        db.selectFrom("category_probabilities")
        .select("C as category_name")
        .orderBy("p(C|W) desc")
        .limit(5)
      )
      .selectFrom("category_values").select(({ fn, ref, val }) => [
        fn.agg("array_agg", [ref("category_values.category_name")]).as("values"),
        val(CATEGORY_LABEL).as("label"),
      ])
      .compile(),
}
