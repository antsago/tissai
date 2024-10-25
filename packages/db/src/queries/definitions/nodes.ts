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

export const asAttributes = (ids: string[]) =>
  builder
    .selectFrom("nodes")
    .leftJoin("nodes as parents", "nodes.parent", "parents.id")
    .select(["parents.name as label", "nodes.id", "nodes.name"])
    .where("nodes.id", "in", ids)
    .compile()

// Temporary limiting to avoid combinatorial explosion until I can refine the schema
const MAX_CHILDREN = 5
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
                .select(["value.id", "value.name", "value.tally"])
                .whereRef("label.id", "=", "value.parent")
                .where((eb) =>
                  eb("value.name", "in", words).and(
                    "value.name",
                    "!=",
                    eb.ref("category.name"),
                  ),
                )
                .orderBy("value.tally desc") // to get most relevant children
                .limit(MAX_CHILDREN)
                .as("value"),
            (join) => join.onTrue(),
          )
          .select(({ fn }) => [
            "label.id",
            "label.name",
            "label.tally",
            fn
              .jsonAgg("value")
              .filterWhere("value.name", "is not", null)
              .as("children"),
          ])
          .whereRef("category.id", "=", "label.parent")
          .groupBy(["label.id"])
          .where("value.name", "is not", null) // to get most relevant children
          .orderBy("label.tally desc") // to get most relevant children
          .limit(MAX_CHILDREN)
          .as("label"),
      (join) => join.onTrue(),
    )
    .select(({ fn }) => [
      "category.id",
      "category.name",
      "category.tally",
      fn
        .jsonAgg("label")
        .filterWhere("label.name", "is not", null)
        .$castTo<
          | null
          | {
              id: string
              name: string
              tally: number
              children:
                | null
                | {
                    id: string
                    name: string
                    tally: number
                  }[]
            }[]
        >()
        .as("children"),
    ])
    .where("category.parent", "is", null)
    .where("category.name", "in", words)
    .groupBy(["category.id"])
    .compile()

export type MatchedNodes =
  ReturnType<typeof match> extends CompiledQuery<infer T> ? T[] : never
