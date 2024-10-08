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
                .select(["value.id", "value.tally"])
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
            "label.id",
            "label.tally",
            fn
              .jsonAgg("value")
              .filterWhere("value.id", "is not", null)
              .as("children"),
          ])
          .whereRef("category.id", "=", "label.parent")
          .groupBy("label.id")
          .as("label"),
      (join) => join.onTrue(),
    )
    .select(({ fn }) => [
      "category.id",
      "category.tally",
      fn
        .jsonAgg("label")
        .filterWhere("label.id", "is not", null)
        .as("children"),
    ])
    .where("category.parent", "is", null)
    .where("category.name", "in", words)
    .groupBy(["category.id", "category.tally"])
    .compile()

type NullChidren<Q> = Q extends { children: any }
  ? Omit<Q, "children"> & { children: Q["children"] | null }
  : never
export type MatchedNodes =
  ReturnType<typeof match> extends CompiledQuery<infer T>
    ? NullChidren<T>[]
    : never
