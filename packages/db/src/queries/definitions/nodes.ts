import { type CompiledQuery, sql } from "kysely"
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

export const match = (words: string[]) =>
  builder
    .selectFrom("nodes as category")
    .leftJoinLateral(
      (lb) =>
        lb
          .selectFrom("nodes as label")
          .leftJoinLateral(
            (vb) =>
              vb
                .selectFrom("nodes as value")
                .select(["value.name", "value.tally"])
                .whereRef("label.id", "=", "value.parent")
                .where((eb) =>
                  eb("value.name", "in", words).and(
                    "value.name",
                    "!=",
                    eb.ref("category.name"),
                  ),
                )
                .as("value"),
            (join) => join.onTrue(),
          )
          .select(({ fn }) => [
            "label.name",
            "label.tally",
            fn
              .jsonAgg("value")
              .filterWhere("value.name", "is not", null)
              .as("children"),
          ])
          .whereRef("category.id", "=", "label.parent")
          .groupBy(["label.name", "label.tally"])
          .as("label"),
      (join) => join.onTrue(),
    )
    .select(({ fn }) => [
      "category.name",
      "category.tally",
      fn
        .jsonAgg("label")
        .filterWhere("label.name", "is not", null)
        .$castTo<
          | null
          | {
              name: string
              tally: number
              children:
                | null
                | {
                    name: string
                    tally: number
                  }[]
            }[]
        >()
        .as("children"),
    ])
    .where("category.parent", "is", null)
    .where("category.name", "in", words)
    .groupBy(["category.id", "category.tally"])
    .compile()

export type MatchedNodes =
  ReturnType<typeof match> extends CompiledQuery<infer T> ? T[] : never
