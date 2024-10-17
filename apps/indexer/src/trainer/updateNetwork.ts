import { randomUUID } from "node:crypto"
import type { Interpretation } from "./label/index.js"
import { type Db } from "@tissai/db"

export async function updateNetwork(
  { category, attributes }: Interpretation,
  db: Db,
) {
  const { id: categoryId } = await db.nodes.upsert({
    id: randomUUID(),
    parent: null,
    name: category,
    tally: 1,
  })

  await Promise.all(
    attributes.map(async (attribute) => {
      const { id: labelId } = await db.nodes.upsert({
        id: randomUUID(),
        parent: categoryId,
        name: attribute.label,
        tally: 1,
      })

      await db.nodes.upsert({
        id: randomUUID(),
        parent: labelId,
        name: attribute.value,
        tally: 1,
      })
    }),
  )
}
